
import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://habibaminhas.com';
    const supabase = await createClient();

    // 1. Static Routes (Foundation & Programs)
    const routes = [
        '',
        '/shop',
        '/blog',
        '/about',
        '/contact',
        '/privacy-policy',
        '/terms',
        '/shipping-policy',
        '/refund-return-policy',
        '/wholesale',
        '/affiliate-program',
        '/loyalty-program',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : route.includes('shop') || route.includes('blog') ? 0.9 : 0.7,
    }));

    // 2. Products (from DB) - The money pages
    let productRoutes: any[] = [];
    try {
        const { data: products } = await supabase
            .from('products')
            .select('slug, id, updated_at, images')
            .eq('status', 'active'); // Only active products

        productRoutes = (products || []).map((product) => ({
            url: `${baseUrl}/shop/${product.slug || product.id}`,
            lastModified: new Date(product.updated_at || new Date()),
            changeFrequency: 'weekly' as const,
            priority: 0.9,
        }));
    } catch (e) {
        console.warn("Could not fetch products for sitemap", e);
    }

    // 3. Blog Posts (from DB)
    let blogRoutes: any[] = [];
    try {
        const { data: posts } = await supabase
            .from('blog_posts')
            .select('slug, updated_at')
            .eq('status', 'published');

        blogRoutes = (posts || []).map((post) => ({
            url: `${baseUrl}/blog/${post.slug}`,
            lastModified: new Date(post.updated_at || new Date()),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        }));
    } catch (e) {
        // Table might not exist yet
    }

    // 4. Categories (Collection Pages) - hierarchical URLs for subcategories
    let categoryRoutes: any[] = [];
    try {
        const { data: cats } = await supabase
            .from('categories')
            .select('id, slug, parent_id, updated_at');

        const allCats = cats || [];
        categoryRoutes = allCats.map((cat) => {
            let path: string;
            if (cat.parent_id) {
                const parent = allCats.find(p => p.id === cat.parent_id);
                path = parent
                    ? `/shop/category/${parent.slug}/${cat.slug}`
                    : `/shop/category/${cat.slug}`;
            } else {
                path = `/shop/category/${cat.slug}`;
            }
            return {
                url: `${baseUrl}${path}`,
                lastModified: new Date(cat.updated_at || new Date()),
                changeFrequency: 'weekly' as const,
                priority: cat.parent_id ? 0.8 : 0.85,
            };
        });
    } catch (e) {
        // Table might not have slug column yet
    }

    return [...routes, ...productRoutes, ...blogRoutes, ...categoryRoutes];
}
