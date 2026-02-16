import React from 'react';
import Link from 'next/link';

export const metadata = {
    title: 'Wholesale Inquiries | Bibae Store',
    description: 'Wholesale and bulk order information for Bibae Store products.',
    alternates: {
        canonical: '/wholesale',
    },
};

export default function WholesalePage() {
    return (
        <div className="bg-white min-h-screen text-gray-900 font-body py-12 md:py-20">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-16">
                    <h1 className="text-3xl md:text-5xl font-heading font-bold mb-6">Wholesale & Bulk Orders</h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Interested in stocking Bibae Store products? We offer competitive wholesale pricing for retailers.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
                    <div className="space-y-6">
                        <h2 className="text-3xl font-heading font-semibold">Partner with Us</h2>
                        <ul className="space-y-4 text-gray-700">
                            <li className="flex items-center gap-3">
                                <span className="text-primary font-bold">✓</span> Exclusive wholesale discounts
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="text-primary font-bold">✓</span> Priority support and account management
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="text-primary font-bold">✓</span> Early access to new collections
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="text-primary font-bold">✓</span> Marketing materials support
                            </li>
                        </ul>
                    </div>
                    <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200">
                        <h3 className="text-xl font-bold mb-4">Inquiry Form</h3>
                        <form className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                                <input type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                                <input type="text" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input type="email" className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Order Volume</label>
                                <select className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white">
                                    <option>10-50 units</option>
                                    <option>50-100 units</option>
                                    <option>100+ units</option>
                                </select>
                            </div>
                            <button type="submit" className="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:bg-primary/90 transition-colors">
                                Request Pricing
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
