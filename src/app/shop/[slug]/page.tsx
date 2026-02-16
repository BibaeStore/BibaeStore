
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Metadata } from 'next';
import { ChevronRight, Star, ShoppingBag, Truck, ShieldCheck, Heart, HelpCircle } from 'lucide-react';
import { formatPrice } from '@/lib/products';
import ProductActions from '@/components/ProductActions';
import ProductCard from '@/components/ProductCard';
import { getRelatedProducts } from '@/lib/server-queries';

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
        description: product.description || `Buy ${product.name} online at Bibae Store.`,
        alternates: {
            canonical: `/shop/${product.slug || product.id}`,
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
            .select('*, category:categories(name)')
            .eq('id', cleanSlug)
            .maybeSingle();
        product = data;
        fetchError = error;
    }

    if (!product && !fetchError) {
        const { data, error } = await supabase
            .from('products')
            .select('*, category:categories(name)')
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

    // 3. Related Products (Semantic linking)
    const relatedProducts = product.category_id
        ? await getRelatedProducts(product.category_id, product.id)
        : [];

    const faqs = [
        {
            q: `Is ${product.name} available for nationwide delivery?`,
            a: "Yes, we offer fast delivery across Pakistan including Karachi, Lahore, Islamabad, and all other cities within 3-5 working days."
        },
        {
            q: `What is the quality of the fabric?`,
            a: "At Bibaé Store, we use 100% premium quality fabrics. This product is handcrafted with meticulous attention to detail to ensure durability and comfort."
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
                    name: 'Bibae Store',
                },
                color: product.colors?.[0],
                material: product.material || 'Premium Quality Fabric',
                audience: {
                    '@type': 'PeopleAudience',
                    suggestedGender: product.category?.name?.toLowerCase().includes('ladies') ? 'female' : 'unisex'
                },
                offers: {
                    '@type': 'Offer',
                    url: `https://bibaestore.com/shop/${product.slug}`,
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
                        item: 'https://bibaestore.com',
                    },
                    {
                        '@type': 'ListItem',
                        position: 2,
                        name: 'Shop',
                        item: 'https://bibaestore.com/shop',
                    },
                    ...(product.category ? [{
                        '@type': 'ListItem',
                        position: 3,
                        name: product.category.name,
                        item: `https://bibaestore.com/shop/category/${product.category.slug || encodeURIComponent(product.category.name)}`,
                    }] : []),
                    {
                        '@type': 'ListItem',
                        position: product.category ? 4 : 3,
                        name: product.name,
                        item: `https://bibaestore.com/shop/${product.slug}`,
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
                        <Link href="/shop" className="hover:text-primary transition-colors">Shop</Link>
                        <ChevronRight className="w-4 h-4" />
                        {product.category && (
                            <>
                                <Link href={`/shop?category=${product.category.name}`} className="hover:text-primary transition-colors">
                                    {product.category.name}
                                </Link>
                                <ChevronRight className="w-4 h-4" />
                            </>
                        )}
                        <span className="text-gray-900 font-medium truncate max-w-[200px]">{product.name}</span>
                    </nav>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
                    {/* Left: Image Gallery */}
                    <div className="space-y-4">
                        <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-100">
                            {product.images?.[0] ? (
                                <Image
                                    src={product.images[0]}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                            )}
                            {product.sale_price && (
                                <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1 uppercase tracking-wider rounded-sm">
                                    Sale
                                </span>
                            )}
                        </div>
                        {/* Thumbnails (Placeholder) */}
                        <div className="grid grid-cols-4 gap-4">
                            {product.images?.slice(0, 4).map((img: string, i: number) => (
                                <div key={i} className="aspect-square relative rounded-md overflow-hidden border border-gray-200 cursor-pointer hover:border-primary transition-colors">
                                    <Image src={img} alt={`${product.name} ${i}`} fill className="object-cover" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Product Details */}
                    <div>
                        <h1 className="text-3xl md:text-4xl font-heading font-light text-gray-900 mb-2">{product.name}</h1>

                        {/* Reviews (Placeholder) */}
                        <div className="flex items-center gap-2 mb-6">
                            <div className="flex text-yellow-400">
                                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                            </div>
                            <span className="text-sm text-gray-500">(No reviews yet)</span>
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-4 mb-8">
                            <span className="text-2xl font-bold text-primary">{formatPrice(product.sale_price || product.price)}</span>
                            {product.sale_price && (
                                <span className="text-lg text-gray-400 line-through decoration-1">{formatPrice(product.price)}</span>
                            )}
                        </div>

                        {/* Description */}
                        <div className="prose prose-sm text-gray-600 mb-8 max-w-none">
                            <p>{product.description}</p>
                        </div>

                        {/* Actions */}
                        <ProductActions product={product} />

                        {/* Trust Signals (Video Point: Trust & Credibility) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-8 border-t border-gray-100">
                            <div className="flex items-start gap-3">
                                <Truck className="w-5 h-5 text-primary mt-1" />
                                <div>
                                    <h4 className="font-semibold text-sm mb-1">Fast Delivery</h4>
                                    <p className="text-xs text-gray-500">Shipping within 3-5 days across Pakistan.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <ShieldCheck className="w-5 h-5 text-primary mt-1" />
                                <div>
                                    <h4 className="font-semibold text-sm mb-1">Authentic Product</h4>
                                    <p className="text-xs text-gray-500">100% original & handcrafted quality.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FAQ Section (NLP & Semantic Powerup) */}
                <div className="mt-20 pt-16 border-t border-gray-100">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-center gap-3 mb-8">
                            <HelpCircle className="w-6 h-6 text-primary" />
                            <h2 className="text-2xl font-heading font-light text-gray-900">Frequently Asked Questions</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {faqs.map((faq, i) => (
                                <div key={i} className="bg-gray-50 p-6 rounded-2xl">
                                    <h3 className="font-bold text-gray-900 mb-2">{faq.q}</h3>
                                    <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

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
