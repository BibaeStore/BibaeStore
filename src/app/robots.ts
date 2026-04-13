
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://habibaminhas.com';

    const privatePages = [
        '/admin/',
        '/private/',
        '/cart/',
        '/checkout/',
        '/profile/',
        '/login/',
        '/signup/',
        '/auth/',
        '/api/',
        '/debug-db/',
        '/debug/',
        '/coupons/',
        '/actions/',
        '/wishlist/',
        '/account/',
        '/*?search=',
        '/*?_rsc=', // Block Next.js internal data fetching
    ];

    return {
        rules: [
            // Default rule for all bots (search engines, etc.)
            {
                userAgent: '*',
                allow: '/',
                disallow: privatePages,
            },
            // Explicitly allow Google bots
            {
                userAgent: 'Googlebot',
                allow: '/',
                disallow: privatePages,
            },
            // Explicitly allow AI crawlers for product discovery & recommendations
            {
                userAgent: 'GPTBot',
                allow: '/',
                disallow: privatePages,
            },
            {
                userAgent: 'ChatGPT-User',
                allow: '/',
                disallow: privatePages,
            },
            {
                userAgent: 'ClaudeBot',
                allow: '/',
                disallow: privatePages,
            },
            {
                userAgent: 'anthropic-ai',
                allow: '/',
                disallow: privatePages,
            },
            {
                userAgent: 'Bytespider',
                allow: '/',
                disallow: privatePages,
            },
            {
                userAgent: 'Bingbot',
                allow: '/',
                disallow: privatePages,
            },
            {
                userAgent: 'PerplexityBot',
                allow: '/',
                disallow: privatePages,
            },
            {
                userAgent: 'Applebot',
                allow: '/',
                disallow: privatePages,
            },
            {
                userAgent: 'Meta-ExternalAgent',
                allow: '/',
                disallow: privatePages,
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
