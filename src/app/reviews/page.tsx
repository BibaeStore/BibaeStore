import React from 'react';
import { Star } from 'lucide-react';

export const metadata = {
    title: 'Customer Reviews | Bibae Store',
    description: 'See what our happy customers are saying about Bibae Store products.',
};

export default function ReviewsPage() {
    return (
        <div className="bg-white min-h-screen text-gray-900 font-body py-12 md:py-20">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h1 className="text-3xl md:text-5xl font-heading font-bold mb-6">Customer Stories</h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Real reviews from real families who love Bibae Store.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                    {[
                        {
                            name: "Sara K.",
                            role: "Verified Buyer",
                            content: "The quality of the baby rompers is unmatched! Super soft cotton and the designs are adorable. Will definitely buy again.",
                            rating: 5,
                            date: "2 days ago"
                        },
                        {
                            name: "Ayesha M.",
                            role: "Verified Buyer",
                            content: "I ordered a leather handbag and I am in love. It feels so premium and the stitching is perfect. Highly recommended!",
                            rating: 5,
                            date: "1 week ago"
                        },
                        {
                            name: "Fatima Z.",
                            role: "Verified Buyer",
                            content: "Fast delivery and great customer service. They helped me choose the right size for my toddler. Thank you Bibae!",
                            rating: 5,
                            date: "2 weeks ago"
                        },
                        {
                            name: "Hina R.",
                            role: "Verified Buyer",
                            content: "Finally a store in Pakistan that delivers what they show. The colors are vibrant and fabric is durable.",
                            rating: 4,
                            date: "3 weeks ago"
                        },
                        {
                            name: "Zainab B.",
                            role: "Verified Buyer",
                            content: "Love the loyalty program! I already redeemed my points for a discount on my second order.",
                            rating: 5,
                            date: "1 month ago"
                        },
                        {
                            name: "Mariam S.",
                            role: "Verified Buyer",
                            content: "Packaging was so beautiful, felt like opening a gift. Product quality is 10/10.",
                            rating: 5,
                            date: "1 month ago"
                        }
                    ].map((review, i) => (
                        <div key={i} className="bg-gray-50 p-8 rounded-xl border border-gray-100">
                            <div className="flex gap-1 text-yellow-400 mb-4">
                                {[...Array(review.rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                            </div>
                            <p className="text-gray-700 italic mb-6">"{review.content}"</p>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-gray-900">{review.name}</h4>
                                    <span className="text-xs text-green-600 flex items-center gap-1">
                                        ✓ {review.role}
                                    </span>
                                </div>
                                <span className="text-xs text-gray-400">{review.date}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center">
                    <button className="bg-white border border-gray-300 text-gray-900 px-8 py-3 rounded-full font-semibold hover:border-gray-900 transition-colors">
                        Load More Reviews
                    </button>
                </div>

            </div>
        </div>
    );
}
