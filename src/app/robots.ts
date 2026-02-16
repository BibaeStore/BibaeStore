
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bibaestore.com';
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/admin/',
                '/private/',
                '/cart',
                '/checkout',
                '/profile',
                '/login',
                '/register',
                '/api/',
                '/*?search=', // Don't index search results
            ],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
