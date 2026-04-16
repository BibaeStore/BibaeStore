
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';
import { ChevronRight, Star, ShoppingBag, Truck, ShieldCheck, Heart, HelpCircle, Info, Sparkles } from 'lucide-react';
import { formatPrice } from '@/lib/products';
import ProductActions from '@/components/ProductActions';
import ProductGallery from '@/components/ProductGallery';
import ProductCard from '@/components/ProductCard';
import { getRelatedProducts, getProductReviews, getRelatedBlogs } from '@/lib/server-queries';
import FAQAccordion from '@/components/FAQAccordion';
import ProductReviews from '@/components/ProductReviews';

// -----------------------------------------------------------------------------
// Helper: Render formatted description text (supports bullet points & paragraphs)
// -----------------------------------------------------------------------------
function renderFormattedText(text: string): React.ReactNode[] {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let bulletItems: string[] = [];
    let key = 0;

    const flushBullets = () => {
        if (bulletItems.length > 0) {
            elements.push(
                <ul key={key++} className="list-disc pl-5 space-y-1.5 text-gray-600">
                    {bulletItems.map((item, i) => (
                        <li key={i} className="leading-relaxed">{item}</li>
                    ))}
                </ul>
            );
            bulletItems = [];
        }
    };

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        const bulletMatch = trimmed.match(/^[-*•]\s*(.*)/);
        if (bulletMatch) {
            bulletItems.push(bulletMatch[1]);
        } else {
            flushBullets();
            elements.push(
                <p key={key++} className="text-gray-600 leading-relaxed">{trimmed}</p>
            );
        }
    }
    flushBullets();

    return elements;
}

// -----------------------------------------------------------------------------
// 1. Generate Metadata + Schematic Markup (JSON-LD)
// -----------------------------------------------------------------------------
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const cleanSlug = decodeURIComponent(slug).replace(/\/$/, "");
    const supabase = await createClient();

    // Check if it's a UUID
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanSlug);

    let product = null;
    let fetchError = null;

    if (isUuid) {
        // Try ID first - using * is safer if columns might be missing
        const { data, error } = await supabase.from('products').select('*').eq('id', cleanSlug).maybeSingle();
        product = data;
        fetchError = error;
    }

    if (!product && !fetchError) {
        // Try Slug
        const { data, error } = await supabase.from('products').select('*').eq('slug', cleanSlug).maybeSingle();
        product = data;
        fetchError = error;
    }

    if (fetchError) {
        // Supabase error objects often stringify as {} if not handled carefully
        console.error('Metadata Fetch Error:', fetchError.message || 'Unknown Error', {
            code: fetchError.code,
            details: fetchError.details,
            slug: cleanSlug
        });
    }

    if (!product) return { title: 'Product Not Found' };

    return {
        title: product.name,
        description: product.description || `Buy ${product.name} online at Habiba Minhas.`,
        alternates: {
            canonical: `https://habibaminhas.com/shop/${product.slug || product.id}/`,
        },
        openGraph: {
            images: product.images?.[0] ? [product.images[0]] : [],
        },
    };
}

// -----------------------------------------------------------------------------
// 2. Main Page Component
// -----------------------------------------------------------------------------
export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const cleanSlug = decodeURIComponent(slug).replace(/\/$/, "");
    const supabase = await createClient();

    // Try both slug and ID for maximum resilience
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanSlug);

    let product = null;
    let fetchError = null;

    // Resilience strategy: Try ID first if it's a UUID, then Slug
    if (isUuid) {
        const { data, error } = await supabase
            .from('products')
            .select('*, category:categories(name, slug, parent_id)')
            .eq('id', cleanSlug)
            .maybeSingle();
        product = data;
        fetchError = error;
    }

    if (!product && !fetchError) {
        const { data, error } = await supabase
            .from('products')
            .select('*, category:categories(name, slug, parent_id)')
            .eq('slug', cleanSlug)
            .maybeSingle();
        product = data;
        fetchError = error;
    }

    if (fetchError) {
        console.error('Product Page DB Error:', fetchError.message || 'Unknown Error', {
            code: fetchError.code,
            details: fetchError.details,
            slug: cleanSlug
        });
        notFound();
    }

    if (!product) {
        console.warn(`Product not found for identifier: "${cleanSlug}"`);
        notFound();
    }

    // Fetch parent category info if this product's category is a subcategory
    let parentCategoryInfo: { name: string; slug: string } | null = null;
    if (product.category?.parent_id) {
        const { data: parentCat } = await supabase
            .from('categories')
            .select('name, slug')
            .eq('id', product.category.parent_id)
            .single();
        parentCategoryInfo = parentCat;
    }

    // 3. Related Products, Reviews & Blogs (parallel fetch)
    const [relatedProducts, productReviews, relatedBlogs] = await Promise.all([
        product.category_id ? getRelatedProducts(product.category_id, product.id) : Promise.resolve([]),
        getProductReviews(product.id),
        getRelatedBlogs(product.category?.name || '')
    ]);

    const faqs = [
        {
            q: `Is ${product.name} available for nationwide delivery?`,
            a: "Yes, we offer fast delivery across Pakistan including Karachi, Lahore, Islamabad, and all other cities within 3-5 working days."
        },
        {
            q: `What is the quality of the fabric?`,
            a: "At Habiba Minhas, we use 100% premium quality fabrics. This product is handcrafted with meticulous attention to detail to ensure durability and comfort."
        },
        {
            q: "Can I return or exchange this item?",
            a: "Yes, we have a hassle-free return and exchange policy within 7 days of delivery for any manufacturing defects or sizing issues."
        }
    ];

    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'Product',
                name: product.name,
                image: product.images?.[0],
                description: product.description,
                sku: product.sku || product.id,
                mpn: product.sku || product.id,
                brand: {
                    '@type': 'Brand',
                    name: 'Habiba Minhas',
                },
                color: product.colors?.[0],
                material: product.material || 'Premium Quality Fabric',
                audience: {
                    '@type': 'PeopleAudience',
                    suggestedGender: product.category?.name?.toLowerCase().includes('ladies') ? 'female' : 'unisex'
                },
                offers: {
                    '@type': 'Offer',
                    url: `https://habibaminhas.com/shop/${product.slug}/`,
                    priceCurrency: 'PKR',
                    price: product.sale_price || product.price,
                    priceValidUntil: '2027-01-01',
                    availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
                    itemCondition: 'https://schema.org/NewCondition',
                    shippingDetails: {
                        '@type': 'OfferShippingDetails',
                        shippingRate: {
                            '@type': 'MonetaryAmount',
                            value: 200,
                            currency: 'PKR'
                        },
                        shippingDestination: {
                            '@type': 'DefinedRegion',
                            addressCountry: 'PK'
                        }
                    }
                },
                // ─── AI SEO Enhancement: aggregateRating & review ───────────────────
                ...(productReviews.length > 0 ? {
                    aggregateRating: {
                        '@type': 'AggregateRating',
                        ratingValue: (productReviews.reduce((acc: number, r: any) => acc + r.rating, 0) / productReviews.length).toFixed(1),
                        reviewCount: productReviews.length,
                        bestRating: 5,
                        worstRating: 1,
                    },
                    review: productReviews.slice(0, 5).map((r: any) => ({
                        '@type': 'Review',
                        author: {
                            '@type': 'Person',
                            name: r.client?.full_name || 'Anonymous Customer',
                        },
                        datePublished: r.created_at,
                        reviewBody: r.comment || '',
                        reviewRating: {
                            '@type': 'Rating',
                            ratingValue: r.rating,
                            bestRating: 5,
                            worstRating: 1,
                        },
                    })),
                } : {}),
            },
            {
                '@type': 'FAQPage',
                mainEntity: faqs.map(faq => ({
                    '@type': 'Question',
                    name: faq.q,
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: faq.a
                    }
                }))
            },
            {
                '@type': 'BreadcrumbList',
                itemListElement: [
                    {
                        '@type': 'ListItem',
                        position: 1,
                        name: 'Home',
                        item: 'https://habibaminhas.com/',
                    },
                    {
                        '@type': 'ListItem',
                        position: 2,
                        name: 'Shop',
                        item: 'https://habibaminhas.com/shop/',
                    },
                    ...(product.category ? (() => {
                        const cat = product.category;
                        const catPath = parentCategoryInfo
                            ? `/shop/category/${parentCategoryInfo.slug}/${cat.slug}/`
                            : `/shop/category/${cat.slug}/`;
                        const items = [];
                        let pos = 3;
                        if (parentCategoryInfo) {
                            items.push({
                                '@type': 'ListItem',
                                position: pos++,
                                name: parentCategoryInfo.name,
                                item: `https://habibaminhas.com/shop/category/${parentCategoryInfo.slug}/`,
                            });
                        }
                        items.push({
                            '@type': 'ListItem',
                            position: pos++,
                            name: cat.name,
                            item: `https://habibaminhas.com${catPath}`,
                        });
                        return items;
                    })() : []),
                    {
                        '@type': 'ListItem',
                        position: product.category
                            ? (parentCategoryInfo ? 5 : 4)
                            : 3,
                        name: product.name,
                        item: `https://habibaminhas.com/shop/${product.slug}/`,
                    },
                ],
            }
        ]
    };

    return (
        <div className="bg-white min-h-screen font-body pb-20">
            {/* 3. JSON-LD Injection */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* 4. Breadcrumbs (Video Point: Navigation & Structure) */}
            <div className="bg-gray-50 border-b border-gray-200 py-4">
                <div className="container mx-auto px-4">
                    <nav className="flex items-center text-sm text-gray-500 gap-2">
                        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                        <ChevronRight className="w-4 h-4" />
                        <Link href="/shop/" className="hover:text-primary transition-colors">Shop</Link>
                        <ChevronRight className="w-4 h-4" />
                        {product.category && (() => {
                            const cat = product.category;
                            const catPath = parentCategoryInfo
                                ? `/shop/category/${parentCategoryInfo.slug}/${cat.slug}/`
                                : `/shop/category/${cat.slug}/`;
                            return (
                                <>
                                    {parentCategoryInfo && (
                                        <>
                                            <Link
                                                href={`/shop/category/${parentCategoryInfo.slug}/`}
                                                className="hover:text-primary transition-colors"
                                            >
                                                {parentCategoryInfo.name}
                                            </Link>
                                            <ChevronRight className="w-4 h-4" />
                                        </>
                                    )}
                                    <Link
                                        href={catPath}
                                        className="hover:text-primary transition-colors"
                                    >
                                        {cat.name}
                                    </Link>
                                    <ChevronRight className="w-4 h-4" />
                                </>
                            );
                        })()}
                        <span className="text-gray-900 font-medium truncate max-w-[200px]">{product.name}</span>
                    </nav>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
                    {/* Left: Image Gallery */}
                    <ProductGallery
                        images={product.images || []}
                        name={product.name}
                        salePrice={product.sale_price}
                    />

                    {/* Right: Product Details */}
                    <div>
                        <h1 className="text-3xl md:text-4xl font-heading font-light text-gray-900 mb-2">{product.name}</h1>

                        {/* Reviews Summary */}
                        <div className="flex items-center gap-2 mb-6">
                            <div className="flex text-yellow-400">
                                {[1, 2, 3, 4, 5].map(i => {
                                    const avg = productReviews.length > 0
                                        ? productReviews.reduce((a: number, r: any) => a + r.rating, 0) / productReviews.length
                                        : 0;
                                    return <Star key={i} className={`w-4 h-4 ${i <= Math.round(avg) ? 'fill-current' : 'text-gray-300'}`} />;
                                })}
                            </div>
                            <span className="text-sm text-gray-500">
                                {productReviews.length > 0
                                    ? `(${productReviews.length} ${productReviews.length === 1 ? 'review' : 'reviews'})`
                                    : '(No reviews yet)'}
                            </span>
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-4 mb-8">
                            <span className="text-2xl font-bold text-primary">{formatPrice(product.sale_price || product.price)}</span>
                            {product.sale_price && (
                                <span className="text-lg text-gray-400 line-through decoration-1">{formatPrice(product.price)}</span>
                            )}
                        </div>

                        {/* Short Description (bullet formatted) */}
                        {product.short_description && (
                            <div className="space-y-2 mb-6">
                                {renderFormattedText(product.short_description)}
                            </div>
                        )}

                        {/* Long Description (formatted with bullet support) */}
                        {product.description && (
                            <div className="space-y-3 mb-8">
                                <p className="text-sm font-body font-medium tracking-wider uppercase text-gray-900 mb-2">Description</p>
                                {renderFormattedText(product.description)}
                            </div>
                        )}

                        {/* Color Variation Notice (for Ladies & Kids clothing categories) */}
                        {(() => {
                            const catSlug = product.category?.slug || '';
                            const parentSlug = parentCategoryInfo?.slug || '';
                            const isClothing = parentSlug === 'ladies' || parentSlug === 'kids' ||
                                catSlug === 'ladies' || catSlug === 'kids' ||
                                catSlug.includes('stitch') || catSlug.includes('girl');
                            return isClothing ? (
                                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
                                    <Info className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-amber-800 leading-relaxed">
                                        <span className="font-semibold">Please Note:</span> The actual color of the product may slightly vary from the images shown due to photography lighting and screen display settings.
                                    </p>
                                </div>
                            ) : null;
                        })()}

                        {/* Actions */}
                        <ProductActions
                            product={product}
                            categorySlug={product.category?.slug}
                            parentCategorySlug={parentCategoryInfo?.slug}
                        />

                        {/* Trust Signals (Video Point: Trust & Credibility) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-8 border-t border-gray-100">
                            <div className="flex items-start gap-3">
                                <Truck className="w-5 h-5 text-primary mt-1" />
                                <div>
                                    <div className="font-semibold text-sm mb-1">Fast Delivery</div>
                                    <p className="text-xs text-gray-500">Shipping within 3-5 days across Pakistan.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <ShieldCheck className="w-5 h-5 text-primary mt-1" />
                                <div>
                                    <div className="font-semibold text-sm mb-1">Authentic Product</div>
                                    <p className="text-xs text-gray-500">100% original & handcrafted quality.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Reviews */}
                <ProductReviews
                    productId={product.id}
                    productName={product.name}
                    initialReviews={productReviews}
                />

                {/* FAQ Section (NLP & Semantic Powerup) */}
                <div className="mt-20 pt-16 border-t border-gray-100">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center gap-3 mb-8">
                            <HelpCircle className="w-6 h-6 text-primary" />
                            <h2 className="text-2xl font-heading font-light text-gray-900">Frequently Asked Questions</h2>
                        </div>
                        <div className="grid grid-cols-1">
                            <FAQAccordion
                                items={faqs.map(faq => ({
                                    question: faq.q,
                                    answer: faq.a
                                }))}
                            />
                        </div>
                    </div>
                </div>

                {/* Expert Styling & Guides (Topical Authority & Semantic Linking) */}
                {relatedBlogs.length > 0 && (
                    <div className="mt-24 pt-16 border-t border-gray-100">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                            <div>
                                <div className="flex items-center gap-2 text-primary mb-3">
                                    <Sparkles className="w-4 h-4" />
                                    <p className="font-body text-xs tracking-[0.3em] uppercase">Authority Guides</p>
                                </div>
                                <h2 className="text-3xl font-heading font-light text-gray-900 leading-tight">Expert Styling & Buying Guides</h2>
                            </div>
                            <Link 
                                href="/blog" 
                                className="text-sm font-bold border-b-2 border-primary/20 hover:border-primary transition-colors pb-1"
                            >
                                View All Guides
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {relatedBlogs.map((blog) => (
                                <Link 
                                    key={blog.id} 
                                    href={`/blog/${blog.slug}`}
                                    className="group block space-y-4"
                                >
                                    <div className="aspect-[16/9] overflow-hidden rounded-2xl bg-gray-100">
                                        <Image
                                            src={blog.cover_image}
                                            alt={blog.title}
                                            width={600}
                                            height={340}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <span className="text-[10px] uppercase tracking-widest text-primary font-bold px-2 py-1 bg-primary/5 rounded">
                                            {blog.category}
                                        </span>
                                        <h3 className="text-lg font-heading font-semibold text-gray-900 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                                            {blog.title}
                                        </h3>
                                        <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                                            {blog.excerpt}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Related Products (Internal Linking & Authority) */}
                {relatedProducts.length > 0 && (
                    <div className="mt-24 pt-16 border-t border-gray-100">
                        <div className="text-center mb-12">
                            <p className="text-primary font-body text-xs tracking-[0.3em] uppercase mb-2">Discovery</p>
                            <h2 className="text-3xl font-heading font-light text-gray-900">You May Also Like</h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {relatedProducts.map((relProduct, i) => (
                                <ProductCard
                                    key={relProduct.id}
                                    product={{
                                        ...relProduct,
                                        image: relProduct.images?.[0] || '/assets/placeholder.jpg',
                                        category: relProduct.category?.name || 'Uncategorized',
                                        price: relProduct.sale_price || relProduct.price,
                                        originalPrice: relProduct.sale_price ? relProduct.price : null,
                                    }}
                                    index={i}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
