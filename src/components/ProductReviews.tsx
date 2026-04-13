'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Star, User, MessageSquare, ExternalLink } from 'lucide-react'
import { submitRatingAction, getRatingsAction } from '@/app/product/[id]/actions'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface ProductReviewsProps {
    productId: string
    productName: string
    initialReviews: any[]
}

export default function ProductReviews({ productId, productName, initialReviews }: ProductReviewsProps) {
    const [reviews, setReviews] = useState<any[]>(initialReviews)
    const [reviewMode, setReviewMode] = useState<'choose' | 'internal'>('choose')
    const [userRating, setUserRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [userComment, setUserComment] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [userSession, setUserSession] = useState<any>(null)
    const [sessionLoading, setSessionLoading] = useState(true)

    useEffect(() => {
        async function loadSession() {
            const supabase = createClient()
            const { data: { session } } = await supabase.auth.getSession()
            setUserSession(session)
            setSessionLoading(false)
        }
        loadSession()
    }, [])

    const handleSubmit = async () => {
        if (!userSession) return
        if (userRating === 0) {
            toast.error('Please select a rating')
            return
        }
        if (!userComment.trim()) {
            toast.error('Please write a review')
            return
        }

        setSubmitting(true)
        try {
            const result = await submitRatingAction({
                product_id: productId,
                client_id: userSession.user.id,
                rating: userRating,
                comment: userComment.trim(),
            })

            if (result.error) {
                toast.error(result.error)
                return
            }

            toast.success('Thank you for your review!')
            setUserComment('')
            setUserRating(0)

            const updated = await getRatingsAction(productId)
            setReviews(updated.data)
        } catch {
            toast.error('Failed to submit review. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    const averageRating = reviews.length > 0
        ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
        : 0

    const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
        star,
        count: reviews.filter(r => r.rating === star).length,
    }))

    return (
        <div className="mt-20 pt-16 border-t border-gray-100">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center gap-3 mb-10">
                    <MessageSquare className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-heading font-light text-gray-900">Customer Reviews</h2>
                </div>

                <div className="flex flex-col md:flex-row gap-12">
                    {/* Left: Summary + Write Review */}
                    <div className="md:w-[340px] flex-shrink-0">
                        {/* Rating Summary */}
                        <div className="mb-8">
                            <div className="flex items-center gap-4 mb-5">
                                <span className="text-5xl font-heading font-light text-gray-900">
                                    {averageRating > 0 ? averageRating.toFixed(1) : '0.0'}
                                </span>
                                <div>
                                    <div className="flex gap-0.5 mb-1">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <Star key={i} className={`w-4 h-4 ${i <= Math.round(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                                    </p>
                                </div>
                            </div>

                            {/* Rating Bars */}
                            <div className="space-y-2">
                                {ratingCounts.map(({ star, count }) => (
                                    <div key={star} className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500 w-3">{star}</span>
                                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-yellow-400 rounded-full transition-all"
                                                style={{ width: reviews.length > 0 ? `${(count / reviews.length) * 100}%` : '0%' }}
                                            />
                                        </div>
                                        <span className="text-xs text-gray-400 w-6 text-right">{count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Write a Review - Dual Option */}
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                            <h3 className="font-heading text-lg text-gray-900 mb-1">Write a Review</h3>
                            <p className="text-xs text-gray-500 mb-5">Share your experience with {productName}</p>

                            {reviewMode === 'choose' && (
                                <div className="space-y-3">
                                    {/* Trustpilot Option */}
                                    <a
                                        href="https://www.trustpilot.com/review/habibaminhas.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-[#00b67a] transition-all w-full"
                                    >
                                        <svg className="w-7 h-7 flex-shrink-0" viewBox="0 0 24 24" fill="none">
                                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#00b67a" />
                                        </svg>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-900">Review on Trustpilot</p>
                                            <p className="text-[11px] text-gray-500">Help others by sharing on a trusted platform</p>
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-[#00b67a] flex-shrink-0" />
                                    </a>

                                    {/* Internal Review Option */}
                                    <button
                                        onClick={() => setReviewMode('internal')}
                                        className="group flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-primary transition-all w-full text-left"
                                    >
                                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-900">Review on Habiba Minhas</p>
                                            <p className="text-[11px] text-gray-500">Leave a quick review right here</p>
                                        </div>
                                    </button>
                                </div>
                            )}

                            {reviewMode === 'internal' && (
                                <>
                                    <button
                                        onClick={() => setReviewMode('choose')}
                                        className="text-[11px] text-gray-400 hover:text-gray-600 mb-4 inline-flex items-center gap-1"
                                    >
                                        &larr; Back to options
                                    </button>

                                    {sessionLoading ? (
                                        <p className="text-sm text-gray-400">Loading...</p>
                                    ) : userSession ? (
                                        <div className="space-y-4">
                                            {/* Star Selection */}
                                            <div>
                                                <label className="text-xs font-medium text-gray-700 uppercase tracking-wider mb-2 block">Rating</label>
                                                <div className="flex gap-1">
                                                    {[1, 2, 3, 4, 5].map(s => (
                                                        <button
                                                            key={s}
                                                            onClick={() => setUserRating(s)}
                                                            onMouseEnter={() => setHoverRating(s)}
                                                            onMouseLeave={() => setHoverRating(0)}
                                                            className="focus:outline-none"
                                                        >
                                                            <Star className={`w-6 h-6 transition-all ${s <= (hoverRating || userRating)
                                                                ? 'fill-yellow-400 text-yellow-400 scale-110'
                                                                : 'text-gray-300 hover:text-yellow-300'
                                                                }`}
                                                            />
                                                        </button>
                                                    ))}
                                                    {userRating > 0 && (
                                                        <span className="text-xs text-gray-500 ml-2 self-center">
                                                            {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][userRating]}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Comment */}
                                            <textarea
                                                value={userComment}
                                                onChange={e => setUserComment(e.target.value)}
                                                placeholder="What did you like or dislike?"
                                                rows={3}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                                            />

                                            {/* Submit */}
                                            <button
                                                onClick={handleSubmit}
                                                disabled={submitting || userRating === 0}
                                                className={`w-full py-3 rounded-sm font-medium uppercase tracking-wider text-xs transition-all duration-300 ${submitting
                                                    ? 'bg-gray-400 text-white cursor-wait'
                                                    : userRating === 0
                                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                        : 'bg-primary hover:bg-gold-dark text-white shadow-button hover:shadow-button-hover'
                                                    }`}
                                            >
                                                {submitting ? 'Submitting...' : 'Submit Review'}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="text-center py-4">
                                            <p className="text-sm text-gray-500 mb-3">Log in to write a review</p>
                                            <Link
                                                href="/login"
                                                className="inline-block text-sm font-medium text-primary hover:underline"
                                            >
                                                Login / Sign Up
                                            </Link>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Right: Reviews List */}
                    <div className="flex-1 min-w-0">
                        {reviews.length === 0 ? (
                            <div className="text-center py-16 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                                <Star className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 mb-1">No reviews yet</p>
                                <p className="text-sm text-gray-400">Be the first to review this product!</p>
                            </div>
                        ) : (
                            <div className="space-y-0 divide-y divide-gray-100">
                                {reviews.map((review: any) => (
                                    <div key={review.id} className="py-6 first:pt-0">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center relative overflow-hidden flex-shrink-0">
                                                {review.client?.profile_image_url ? (
                                                    <Image
                                                        src={review.client.profile_image_url}
                                                        alt={review.client.full_name || 'User'}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <User className="w-5 h-5 text-primary" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-semibold text-gray-900">
                                                    {review.client?.full_name || 'Anonymous'}
                                                </h4>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex gap-0.5">
                                                        {[1, 2, 3, 4, 5].map(i => (
                                                            <Star key={i} className={`w-3 h-3 ${i <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                                                        ))}
                                                    </div>
                                                    <span className="text-[11px] text-gray-400">
                                                        {new Date(review.created_at).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric',
                                                        })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        {review.comment && (
                                            <p className="text-sm text-gray-600 leading-relaxed ml-[52px]">{review.comment}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
