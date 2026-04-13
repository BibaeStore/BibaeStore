import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import ShopContent from '../../ShopContent';

interface CategoryPageProps {
    params: Promise<{ slug: string[] }>;
}

/**
 * Resolves a category from slug segments.
 * - 1 segment: parent category OR redirect if it's a subcategory
 * - 2 segments: parent/child hierarchical URL
 */
type ResolvedCategory = {
    category: any;
    parentCategory: { name: string; slug: string } | null;
    canonicalPath: string;
};

type ResolvedRedirect = {
    redirect: string;
};

async function resolveCategory(slugSegments: string[]): Promise<ResolvedCategory | ResolvedRedirect | null> {
    const supabase = await createClient();

    if (slugSegments.length === 2) {
        // Hierarchical: /shop/category/ladies/stitched
        const [parentSlug, childSlug] = slugSegments;

        const { data: child } = await supabase
            .from('categories')
            .select('*')
            .eq('slug', childSlug)
            .maybeSingle();

        if (!child || !child.parent_id) return null;

        // Fetch the parent separately to verify the URL is correct
        const { data: parent } = await supabase
            .from('categories')
            .select('name, slug')
            .eq('id', child.parent_id)
            .single();

        if (!parent || parent.slug !== parentSlug) return null;

        return {
            category: child,
            parentCategory: parent,
            canonicalPath: `/shop/category/${parentSlug}/${childSlug}/`,
        };
    }

    if (slugSegments.length === 1) {
        const slug = slugSegments[0];

        const { data: category } = await supabase
            .from('categories')
            .select('*')
            .eq('slug', slug)
            .maybeSingle();

        if (!category) return null;

        // If this is a subcategory accessed via flat URL, redirect to hierarchical URL
        if (category.parent_id) {
            const { data: parent } = await supabase
                .from('categories')
                .select('slug')
                .eq('id', category.parent_id)
                .single();

            if (parent) {
                return { redirect: `/shop/category/${parent.slug}/${slug}/` } as ResolvedRedirect;
            }
        }

        return {
            category,
            parentCategory: null,
            canonicalPath: `/shop/category/${slug}/`,
        };
    }

    return null;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
    const { slug: slugSegments } = await params;
    const resolved = await resolveCategory(slugSegments);

    if (!resolved || 'redirect' in resolved) {
        return { title: 'Collection' };
    }

    const { category, parentCategory, canonicalPath } = resolved as ResolvedCategory;
    const fullName = parentCategory
        ? `${parentCategory.name} ${category.name}`
        : category.name;

    return {
        title: category.meta_title || `${fullName} Collection`,
        description: category.meta_description || `Explore our ${fullName} collection at Habiba Minhas. Handcrafted premium boutique wear.`,
        alternates: {
            canonical: canonicalPath,
        },
    };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
    const { slug: slugSegments } = await params;
    const resolved = await resolveCategory(slugSegments);

    if (!resolved) {
        notFound();
    }

    // Redirect flat subcategory URLs to hierarchical
    if ('redirect' in resolved) {
        redirect((resolved as ResolvedRedirect).redirect);
    }

    const { category, parentCategory, canonicalPath } = resolved as ResolvedCategory;
    const supabase = await createClient();

    // Build list of category IDs (parent + children if this is a root category)
    const categoryIds = [category.id];
    if (!category.parent_id) {
        const { data: children } = await supabase
            .from('categories')
            .select('id')
            .eq('parent_id', category.id)
            .eq('status', 'active');
        if (children) {
            categoryIds.push(...children.map((c: { id: string }) => c.id));
        }
    }

    // Fetch products for this category and all subcategories
    const { data: products } = await supabase
        .from('products')
        .select('*, category:categories(name)')
        .in('category_id', categoryIds)
        .eq('status', 'active');

    // Build breadcrumb items for JSON-LD
    const breadcrumbItems = [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://habibaminhas.com/' },
        { '@type': 'ListItem', position: 2, name: 'Shop', item: 'https://habibaminhas.com/shop/' },
    ];

    if (parentCategory) {
        breadcrumbItems.push({
            '@type': 'ListItem',
            position: 3,
            name: parentCategory.name,
            item: `https://habibaminhas.com/shop/category/${parentCategory.slug}/`,
        });
        breadcrumbItems.push({
            '@type': 'ListItem',
            position: 4,
            name: category.name,
            item: `https://habibaminhas.com${canonicalPath}`,
        });
    } else {
        breadcrumbItems.push({
            '@type': 'ListItem',
            position: 3,
            name: category.name,
            item: `https://habibaminhas.com${canonicalPath}`,
        });
    }

    const collectionSchema = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'CollectionPage',
                name: category.name,
                description: category.meta_description || category.description,
                url: `https://habibaminhas.com${canonicalPath}`,
                mainEntity: {
                    '@type': 'ItemList',
                    numberOfItems: products?.length || 0,
                    itemListElement: (products || []).map((p, i) => ({
                        '@type': 'ListItem',
                        position: i + 1,
                        item: {
                            '@type': 'Product',
                            name: p.name,
                            url: `https://habibaminhas.com/shop/${p.slug || p.id}/`,
                            image: p.images?.[0],
                            offers: {
                                '@type': 'Offer',
                                price: p.sale_price || p.price,
                                priceCurrency: 'PKR',
                            },
                        },
                    })),
                },
            },
            {
                '@type': 'BreadcrumbList',
                itemListElement: breadcrumbItems,
            },
        ],
    };

    const displayTitle = parentCategory
        ? `${parentCategory.name} ${category.name}`
        : category.name;

    return (
        <div className="min-h-screen">
            {/* SEO: JSON-LD Injection */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
            />

            {/* Hidden H1 for SEO Raw HTML discoverability since ShopContent is client-side */}
            <h1 className="sr-only">{displayTitle} Collection - Habiba Minhas</h1>
            
            <ShopContent initialProducts={products || []} initialTitle={displayTitle} isCategoryPage />

            {/* SEO Rich Text Section for MOFU Ranking */}
            {category.description && (
                <section className="container mx-auto px-4 py-16 border-t border-gray-100">
                    <div className="max-w-4xl mx-auto prose prose-slate prose-headings:font-heading prose-headings:font-light prose-p:font-body prose-p:text-gray-600">
                        <h2 className="text-3xl mb-8 text-gray-900">About Our {displayTitle}</h2>
                        <div
                            className="rich-text-content"
                            dangerouslySetInnerHTML={{ __html: category.description }}
                        />
                    </div>
                </section>
            )}
        </div>
    );
}
