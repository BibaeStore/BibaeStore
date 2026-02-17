import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ShopContent from '../../ShopContent';

interface CategoryPageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
    const { slug } = await params;
    const supabase = await createClient();

    // Try by slug first
    let { data: category, error: slugError } = await supabase
        .from('categories')
        .select('*') // Safer: Get all available columns
        .eq('slug', slug)
        .maybeSingle();

    // Fallback: If not found or column missing, try by name (exact match or capitalized)
    if (!category || slugError) {
        const displayName = slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ');
        const { data: nameMatch } = await supabase
            .from('categories')
            .select('*') // Safer: Get all available columns
            .or(`name.ilike."${displayName}",name.ilike."${slug}"`)
            .maybeSingle();
        category = nameMatch;
    }

    if (!category) {
        return {
            title: 'Collection | Bibae Store',
        };
    }

    return {
        title: category.meta_title || `${category.name} Collection`,
        description: category.meta_description || `Explore our ${category.name} collection at Bibae Store. Handcrafted premium boutique wear.`,
        alternates: {
            canonical: `/shop/category/${category.slug || slug}`,
        },
    };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
    const { slug } = await params;
    const supabase = await createClient();

    // 1. Fetch category details (with Resilience)
    let { data: category, error: catError } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

    if (!category || catError) {
        // Fallback to name search
        const displayName = slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ');
        const { data: nameMatch } = await supabase
            .from('categories')
            .select('*')
            .or(`name.ilike.${displayName},name.ilike.${slug}`)
            .maybeSingle();
        category = nameMatch;
    }

    if (!category) {
        notFound();
    }

    // 2. Fetch products for this category
    const { data: products } = await supabase
        .from('products')
        .select('*, category:categories(name)') // Remove slug here
        .eq('category_id', category.id)
        .eq('status', 'active');

    const collectionSchema = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'CollectionPage',
                name: category.name,
                description: category.meta_description || category.description,
                url: `https://bibaestore.com/shop/category/${category.slug}`,
                mainEntity: {
                    '@type': 'ItemList',
                    numberOfItems: products?.length || 0,
                    itemListElement: (products || []).map((p, i) => ({
                        '@type': 'ListItem',
                        position: i + 1,
                        item: {
                            '@type': 'Product',
                            name: p.name,
                            url: `https://bibaestore.com/shop/${p.slug || p.id}`,
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
                itemListElement: [
                    {
                        '@type': 'ListItem',
                        position: 1,
                        name: 'Home',
                        item: 'https://bibaestore.com',
                    },
                    {
                        '@type': 'ListItem',
                        position: 2,
                        name: 'Shop',
                        item: 'https://bibaestore.com/shop',
                    },
                    {
                        '@type': 'ListItem',
                        position: 3,
                        name: category.name,
                        item: `https://bibaestore.com/shop/category/${category.slug}`,
                    },
                ],
            },
        ],
    };

    return (
        <div className="min-h-screen">
            {/* SEO: JSON-LD Injection */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
            />

            <ShopContent initialProducts={products || []} initialTitle={category.name} />

            {/* SEO Rich Text Section for MOFU Ranking */}
            {category.description && (
                <section className="container mx-auto px-4 py-16 border-t border-gray-100">
                    <div className="max-w-4xl mx-auto prose prose-slate prose-headings:font-heading prose-headings:font-light prose-p:font-body prose-p:text-gray-600">
                        <h2 className="text-3xl mb-8 text-gray-900">About Our {category.name}</h2>
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
