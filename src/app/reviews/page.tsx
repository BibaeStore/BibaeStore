import React from 'react';
import { getApprovedStoreReviewsAction } from './actions';
import ReviewsContent from './ReviewsContent';

export const metadata = {
    title: 'Customer Reviews',
    description: 'See what our happy customers are saying about Habiba Minhas. Read verified reviews and share your own experience.',
    alternates: {
        canonical: 'https://habibaminhas.com/reviews/',
    },
};

export default async function ReviewsPage() {
    const { data: reviews } = await getApprovedStoreReviewsAction();

    return (
        <main>
            <ReviewsContent initialReviews={reviews} />
        </main>
    );
}
