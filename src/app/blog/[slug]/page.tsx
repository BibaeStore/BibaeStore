import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, Tag, Share2 } from 'lucide-react';
import { Metadata } from 'next';

// 1. Generate Metadata for SEO (Awareness Stage)
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const supabase = await createClient();
    const { data: post } = await supabase
        .from('blog_posts')
        .select('title, meta_description, keywords, cover_image')
        .eq('slug', slug)
        .single();

    if (!post) return { title: 'Not Found' };

    return {
        title: post.title,
        description: post.meta_description || `Read about ${post.title}`,
        keywords: post.keywords?.join(', '),
        alternates: {
            canonical: `/blog/${slug}`,
        },
        openGraph: {
            images: post.cover_image ? [post.cover_image] : [],
        }
    };
}

// 2. Main Page Component
export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const supabase = await createClient();
    const { data: post } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

    if (!post) {
        notFound();
    }

    const blogSchema = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        image: post.cover_image,
        datePublished: post.published_at,
        dateModified: post.updated_at || post.published_at,
        author: {
            '@type': 'Organization',
            name: 'Bibae Store',
            url: 'https://bibaestore.com',
        },
        publisher: {
            '@type': 'Organization',
            name: 'Bibae Store',
            logo: {
                '@type': 'ImageObject',
                url: 'https://bibaestore.com/assets/logo.png',
            },
        },
        description: post.meta_description || post.excerpt,
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `https://bibaestore.com/blog/${slug}`,
        },
    };

    return (
        <article className="bg-white min-h-screen font-body pb-20">
            {/* 3. JSON-LD Injection */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
            />

            {/* Header Image */}
            <div className="relative w-full h-[400px] md:h-[500px] bg-gray-100">
                {post.cover_image && (
                    <Image
                        src={post.cover_image}
                        alt={post.title}
                        fill
                        className="object-cover"
                        priority
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 container mx-auto">
                    <Link href="/blog" className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors text-sm uppercase tracking-widest font-bold">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Journal
                    </Link>
                    <div className="mb-4">
                        <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                            {post.category || 'Article'}
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-heading font-bold text-white mb-4 leading-tight">
                        {post.title}
                    </h1>
                    <div className="flex items-center gap-6 text-white/80 text-sm">
                        <span className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" /> {new Date(post.published_at).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-2">
                            <UserIcon className="w-4 h-4" /> {post.author || 'Bibae Team'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Content Body */}
            <div className="container mx-auto px-4 max-w-4xl py-12">
                <div className="flex gap-4 mb-8">
                    {/* Share Buttons Placeholder */}
                    <button className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors text-sm">
                        <Share2 className="w-4 h-4" /> Share Article
                    </button>
                </div>

                {/* 
            Ideally, use a library like 'react-markdown' or 'sanitize-html' here 
            if content is HTML. For now simplified.
        */}
                <div
                    className="prose prose-lg max-w-none prose-headings:font-heading prose-headings:text-gray-900 prose-p:text-gray-600 prose-a:text-primary prose-img:rounded-xl"
                    dangerouslySetInnerHTML={{ __html: post.content || '' }}
                />

                {/* Tags */}
                {post.keywords && post.keywords.length > 0 && (
                    <div className="mt-12 pt-8 border-t border-gray-100 flex flex-wrap gap-2">
                        {post.keywords.map((tag: string) => (
                            <span key={tag} className="flex items-center gap-1 bg-gray-50 text-gray-600 px-3 py-1 rounded-lg text-sm">
                                <Tag className="w-3 h-3" /> {tag}
                            </span>
                        ))}
                    </div>
                )}

            </div>
        </article>
    );
}

function UserIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
    )
}
