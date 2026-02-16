import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Calendar, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Fashion Journal | Boutique Lifestyle Guides 2026',
    description: 'Insights into the 2026 boutique trends, handcrafted fashion stories, and premium styling guides from Bibae Store.',
    keywords: ['pakistan fashion blog', 'boutique styling guides', 'fashion trends 2026', 'handcrafted clothing stories', 'bibae journal'],
    alternates: {
        canonical: '/blog',
    },
};

export const revalidate = 60; // Revalidate every minute

export default async function BlogIndex() {
    const supabase = await createClient();
    let posts = [];

    try {
        const { data, error } = await supabase
            .from('blog_posts')
            .select('*')
            .eq('status', 'published')
            .order('published_at', { ascending: false });

        if (error) {
            // console.warn("Could not fetch blog posts (table might be missing):", error.message);
        } else {
            posts = data || [];
        }
    } catch (e) {
        // console.warn("Exception fetching blog posts:", e);
    }

    const blogPosts = posts;

    return (
        <div className="bg-white min-h-screen font-body">
            {/* Hero */}
            <div className="bg-gray-50 py-16 text-center border-b border-gray-200">
                <div className="container mx-auto px-4">
                    <h1 className="text-3xl md:text-5xl font-heading font-bold mb-4 text-gray-900">The Bibae Journal</h1>
                    <p className="text-gray-600 max-w-xl mx-auto text-lg">
                        Insights, stories, and guides for the modern lifestyle.
                    </p>
                </div>
            </div>

            {/* Posts Grid */}
            <div className="container mx-auto px-4 py-16">
                {blogPosts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {blogPosts.map((post: any) => (
                            <article key={post.slug} className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300">
                                <Link href={`/blog/${post.slug}`} className="block relative aspect-[4/3] overflow-hidden">
                                    {post.cover_image ? (
                                        <Image
                                            src={post.cover_image}
                                            alt={post.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">No Image</div>
                                    )}
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-primary">
                                        {post.category || 'General'}
                                    </div>
                                </Link>
                                <div className="p-6">
                                    <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(post.published_at).toLocaleDateString()}</span>
                                        <span className="flex items-center gap-1"><User className="w-3 h-3" /> {post.author || 'Bibae Team'}</span>
                                    </div>
                                    <h2 className="text-xl font-heading font-bold mb-3 text-gray-900 group-hover:text-primary transition-colors line-clamp-2">
                                        <Link href={`/blog/${post.slug}`}>
                                            {post.title}
                                        </Link>
                                    </h2>
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                                        {post.excerpt}
                                    </p>
                                    <Link href={`/blog/${post.slug}`} className="inline-flex items-center text-sm font-semibold text-primary hover:gap-2 transition-all">
                                        Read Article <ArrowRight className="w-4 h-4 ml-1" />
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-gray-500 mb-4">No journal entries yet.</p>
                        <p className="text-sm">Check back soon for fashion tips and guides.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
