import React from 'react';
import Link from 'next/link';
import { Gift, Star, Award } from 'lucide-react';

export const metadata = {
    title: 'Bibae Rewards | Loyalty Program',
    description: 'Join the Bibae Rewards program and earn points on every purchase.',
    alternates: {
        canonical: '/loyalty-program',
    },
};

export default function LoyaltyPage() {
    return (
        <div className="bg-white min-h-screen text-gray-900 font-body">
            {/* Hero */}
            <div className="bg-primary text-white py-20 text-center px-4">
                <div className="container mx-auto max-w-3xl">
                    <h1 className="text-4xl md:text-6xl font-heading font-bold mb-6">Bibae Rewards</h1>
                    <p className="text-xl md:text-2xl font-light opacity-90 mb-8">
                        Earn points, unlock tiers, and enjoy exclusive benefits.
                    </p>
                    <Link href="/signup" className="inline-block bg-white text-primary px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors shadow-lg">
                        Join for Free
                    </Link>
                    <p className="mt-4 text-sm opacity-80">Already a member? <Link href="/login" className="underline">Sign in</Link></p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-heading font-bold mb-4">How it Works</h2>
                    <p className="text-gray-600">Simple ways to earn and redeem.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-20">
                    <div className="text-center p-6">
                        <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                            <Star className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">1. Join</h3>
                        <p className="text-gray-600">Create an account and get 50 bonus points instantly.</p>
                    </div>
                    <div className="text-center p-6">
                        <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                            <Award className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">2. Earn</h3>
                        <p className="text-gray-600">Earn 1 point for every PKR 100 spent on our store.</p>
                    </div>
                    <div className="text-center p-6">
                        <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                            <Gift className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">3. Redeem</h3>
                        <p className="text-gray-600">Use your points to get discounts on future orders.</p>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-8 md:p-12 text-center max-w-4xl mx-auto">
                    <h2 className="text-3xl font-heading font-bold mb-8">VIP Tiers</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-xl font-bold text-gray-400 mb-2">Silver</h3>
                            <p className="text-sm text-gray-500 mb-4">0 - 499 Points</p>
                            <ul className="text-left space-y-2 text-sm text-gray-600">
                                <li>• 1x Points Earning</li>
                                <li>• Birthday Gift</li>
                            </ul>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-md border-2 border-primary/20 transform md:-translate-y-4">
                            <h3 className="text-xl font-bold text-primary mb-2">Gold</h3>
                            <p className="text-sm text-gray-500 mb-4">500 - 1999 Points</p>
                            <ul className="text-left space-y-2 text-sm text-gray-600">
                                <li>• 1.5x Points Earning</li>
                                <li>• Early Access to Sales</li>
                                <li>• Free Shipping on all orders</li>
                            </ul>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Platinum</h3>
                            <p className="text-sm text-gray-500 mb-4">2000+ Points</p>
                            <ul className="text-left space-y-2 text-sm text-gray-600">
                                <li>• 2x Points Earning</li>
                                <li>• Priority Support</li>
                                <li>• Exclusive Events</li>
                            </ul>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
