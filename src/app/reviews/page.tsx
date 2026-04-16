import React from 'react';
import { getApprovedStoreReviewsAction } from './actions';
import ReviewsContent from './ReviewsContent';

export const metadata = {
    title: 'Customer Reviews',
    description: 'See what our happy customers are saying about Habiba Minhas. Read verified reviews and share your own experience.',
    alternates: {
        canonical: '/reviews/',
    },
};

export default async function ReviewsPage() {
    const { data: reviews } = await getApprovedStoreReviewsAction();

    return (
        <main>
            {/* Hidden H1 for SEO Raw HTML discoverability since ReviewsContent is client-side */}
            <h1 className="sr-only">Customer Reviews & Testimonials - Habiba Minhas</h1>
            <ReviewsContent initialReviews={reviews} />
        </main>
    );
}
