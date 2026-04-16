import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
    title: 'About Us',
    description: 'Learn more about Habiba Minhas, our story, mission, and commitment to quality fashion and baby products in Pakistan.',
    alternates: {
        canonical: 'https://habibaminhas.com/about/',
    },
};

export default function AboutPage() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'Organization',
                '@id': 'https://habibaminhas.com/#organization',
                name: 'Habiba Minhas',
                url: 'https://habibaminhas.com',
                logo: 'https://habibaminhas.com/logo.png',
                sameAs: [
                    "https://www.instagram.com/habibaminhas/",
                    "https://www.facebook.com/profile.php?id=61574335512818",
                    "https://www.youtube.com/channel/UCSx82xy6YKkSgQI1wYuJX1w",
                    "https://pin.it/58BvOrS7F",
                    "https://x.com/habibaminhas",
                    "https://www.reddit.com/user/Other-Highlight5681/",
                    "https://www.quora.com/profile/Habiba%20Minhas-Store",
                    "https://www.linkedin.com/company/habiba-minhas/",
                    "https://www.tiktok.com/@habibaminhas"
                ],
                contactPoint: {
                    '@type': 'ContactPoint',
                    telephone: '+92 312 0295812',
                    contactType: 'customer service',
                    areaServed: 'PK',
                    availableLanguage: ['English', 'Urdu']
                }
            },
            {
                '@type': 'Person',
                '@id': 'https://habibaminhas.com/#founder',
                name: 'Habiba Minhas',
                jobTitle: 'Founder & Creative Director',
                description: 'Fashion designer and entrepreneur dedicated to premium handcrafted elegance.',
                affiliation: { '@id': 'https://habibaminhas.com/#organization' },
                image: 'https://habibaminhas.com/founder.jpg',
                sameAs: [
                    "https://www.instagram.com/habibaminhas/",
                    "https://x.com/habibaminhas",
                    "https://www.linkedin.com/company/habiba-minhas/"
                ]
            }
        ]
    };


    return (
        <div className="bg-white text-gray-900 font-body">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Hero Section */}
            <section className="relative w-full h-[400px] flex items-center justify-center bg-gray-100 overflow-hidden">
                <div className="absolute inset-0 bg-black/40 z-10"></div>
                <Image
                    src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop"
                    alt="About Habiba Minhas"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="relative z-20 text-center text-white px-4">
                    <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 tracking-tight">
                        Our Story
                    </h1>
                    <p className="text-lg md:text-xl font-light max-w-2xl mx-auto">
                        Crafting elegance for the modern family since 2026.
                    </p>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-16 md:py-24 px-4 container mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <h2 className="text-3xl font-heading font-semibold text-primary">
                            Who We Are
                        </h2>
                        <p className="leading-relaxed text-gray-600">
                            Welcome to <strong>Habiba Minhas</strong>, your premier destination for premium fashion and baby products in Pakistan. We believe that style shouldn't come at the cost of comfort, and quality shouldn't break the bank.
                        </p>
                        <p className="leading-relaxed text-gray-600">
                            Founded with a passion for excellence, Habiba Minhas started as a small vision to bring curated, high-quality items to families who appreciate the finer details. Today, we are proud to serve thousands of happy customers across the region.
                        </p>
                        <div className="pt-4">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-4xl font-bold text-gray-900 mb-1">5k+</h3>
                                    <p className="text-sm text-gray-500">Happy Customers</p>
                                </div>
                                <div>
                                    <h3 className="text-4xl font-bold text-gray-900 mb-1">100+</h3>
                                    <p className="text-sm text-gray-500">Premium Products</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-xl">
                        <Image
                            src="https://images.unsplash.com/photo-1560769629-975ec94e6a86?q=80&w=1964&auto=format&fit=crop"
                            alt="Our Workshop"
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-700"
                        />
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="bg-gray-50 py-16 md:py-24">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl font-heading font-semibold mb-4">Why Choose Us?</h2>
                        <p className="text-gray-600">
                            We define ourselves not just by what we sell, but by the values we uphold in every transaction.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                title: 'Quality First',
                                description: 'We meticulously select materials that stand the test of time and provide distinct comfort.',
                                icon: '✨'
                            },
                            {
                                title: 'Customer Centric',
                                description: 'Your happiness is our priority. From browsing to unboxing, we ensure a seamless journey.',
                                icon: '❤️'
                            },
                            {
                                title: 'Authentic Design',
                                description: 'Unique styles that blend modern trends with timeless elegance.',
                                icon: '🎨'
                            }
                        ].map((value, idx) => (
                            <div key={idx} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                <div className="text-4xl mb-4">{value.icon}</div>
                                <h3 className="text-xl font-heading font-semibold mb-3">{value.title}</h3>
                                <p className="text-gray-600 leading-relaxed text-sm">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-primary text-white text-center">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-heading font-bold mb-6">Join the Habiba Minhas Family</h2>
                    <p className="text-white/90 max-w-2xl mx-auto mb-8 text-lg">
                        Experience the difference of premium quality and dedicated service.
                    </p>
                    <Link
                        href="/shop/"
                        className="inline-block bg-white text-primary px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors shadow-lg"
                    >
                        Start Shopping
                    </Link>
                </div>
            </section>
        </div>
    );
}
