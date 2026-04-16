import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    const supabase = await createClient();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://habibaminhas.com';

    // Fetch active products
    const { data: products, error } = await supabase
        .from('products')
        .select(`
            id, 
            name, 
            slug, 
            description, 
            price, 
            sale_price, 
            stock, 
            images, 
            category:categories(name),
            sku
        `)
        .eq('status', 'active');

    if (error) {
        console.error('Error generating product feed:', error);
        return new NextResponse('Error generating feed', { status: 500 });
    }

    let xml = `<?xml version="1.0"?>
<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">
<channel>
    <title>Habiba Minhas</title>
    <link>${baseUrl}</link>
    <description>Handcrafted premium ethnic wear and boutique fashion from Habiba Minhas.</description>
`;

    if (products) {
        products.forEach((product: any) => {
            const productUrl = `${baseUrl}/shop/${product.slug || product.id}/`;
            const imageUrl = product.images?.[0] || `${baseUrl}/Habiba%20Minhas%20logo.jpeg`;
            const price = product.price ? `${product.price} PKR` : '0 PKR';
            const salePrice = product.sale_price ? `${product.sale_price} PKR` : '';
            const condition = 'new';
            const availability = product.stock > 0 ? 'in_stock' : 'out_of_stock';
            const brand = 'Habiba Minhas';
            const category = product.category?.name || 'Apparel & Accessories';
            // Escaping helper
            const escapeXml = (unsafe: string) => {
                if (!unsafe) return '';
                return unsafe.replace(/[<>&'"]/g, (c) => {
                    switch (c) {
                        case '<': return '&lt;';
                        case '>': return '&gt;';
                        case '&': return '&amp;';
                        case '\'': return '&apos;';
                        case '"': return '&quot;';
                        default: return c;
                    }
                });
            };

            xml += `
    <item>
        <g:id>${product.sku || product.id}</g:id>
        <g:title>${escapeXml(product.name)}</g:title>
        <g:description>${escapeXml(product.description || product.name)}</g:description>
        <g:link>${productUrl}</g:link>
        <g:image_link>${escapeXml(imageUrl)}</g:image_link>
        <g:brand>${brand}</g:brand>
        <g:condition>${condition}</g:condition>
        <g:availability>${availability}</g:availability>
        <g:price>${price}</g:price>
        ${salePrice ? `<g:sale_price>${salePrice}</g:sale_price>` : ''}
        <g:product_type>${escapeXml(category)}</g:product_type>
        <g:google_product_category>166</g:google_product_category>
    </item>`;
        });
    }

    xml += `
</channel>
</rss>`;

    return new NextResponse(xml, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
        },
    });
}
