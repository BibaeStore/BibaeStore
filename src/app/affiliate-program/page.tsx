import React from 'react';
import Link from 'next/link';

export const metadata = {
    title: 'Affiliate Program',
    description: 'Join the Habiba Minhas Affiliate Program and earn commissions.',
    alternates: {
        canonical: '/affiliate-program/',
    },
};

export default function AffiliatePage() {
    return (
        <div className="bg-white min-h-screen text-gray-900 font-body py-12 md:py-20">
            <div className="container mx-auto px-4 max-w-4xl text-center">
                <h1 className="text-3xl md:text-5xl font-heading font-bold mb-6">Affiliate Program</h1>
                <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
                    Partner with us and earn a commission on every sale you refer.
                </p>

                <div className="bg-gray-50 rounded-2xl p-8 md:p-12 mb-12">
                    <h2 className="text-2xl font-heading font-semibold mb-6">Why Join?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                        <div>
                            <h3 className="text-xl font-bold mb-2">Competitive Rates</h3>
                            <p className="text-gray-600">Earn up to 10% commission on all products.</p>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-2">30-Day Cookie</h3>
                            <p className="text-gray-600">Get credit for any purchase made within 30 days of your referral.</p>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-2">Easy Payouts</h3>
                            <p className="text-gray-600">Get paid monthly directly to your bank account.</p>
                        </div>
                    </div>
                </div>

                <div className="max-w-xl mx-auto">
                    <h2 className="text-2xl font-bold mb-4">How to Apply</h2>
                    <p className="text-gray-600 mb-8">
                        We are currently accepting applications manually. Please email us your details, website/social media links, and marketing strategy.
                    </p>
                    <a href="mailto:affiliates@habibaminhas.com" className="inline-block bg-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-primary/90 transition-colors shadow-lg">
                        Email Us to Apply
                    </a>
                </div>
            </div>
        </div>
    );
}
