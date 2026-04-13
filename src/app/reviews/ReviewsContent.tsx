'use client'

import { useState, useEffect, useRef } from 'react'
import { Star, Send, ExternalLink, CheckCircle2, User } from 'lucide-react'
import { submitStoreReviewAction } from './actions'
import { toast } from 'sonner'

interface StoreReview {
    id: string
    name: string
    rating: number
    comment: string
    created_at: string
}

interface ReviewsContentProps {
    initialReviews: StoreReview[]
}

export default function ReviewsContent({ initialReviews }: ReviewsContentProps) {
    const [reviews] = useState<StoreReview[]>(initialReviews)
    const [reviewOption, setReviewOption] = useState<'choose' | 'trustpilot' | 'bibae'>('choose')
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [comment, setComment] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const trustpilotRef = useRef<HTMLDivElement>(null)

    // Initialize Trustpilot widget after mount
    useEffect(() => {
        if (trustpilotRef.current && typeof window !== 'undefined' && (window as any).Trustpilot) {
            (window as any).Trustpilot.loadFromElement(trustpilotRef.current, true)
        }
    }, [])

    const handleSubmitReview = async () => {
        if (!name.trim()) {
            toast.error('Please enter your name')
            return
        }
        if (rating === 0) {
            toast.error('Please select a rating')
            return
        }
        if (!comment.trim()) {
            toast.error('Please write your review')
            return
        }

        setIsSubmitting(true)
        try {
            const result = await submitStoreReviewAction({
                name: name.trim(),
                email: email.trim() || undefined,
                rating,
                comment: comment.trim(),
            })

            if (result.success) {
                setSubmitted(true)
                setName('')
                setEmail('')
                setRating(0)
                setComment('')
                toast.success('Thank you! Your review has been submitted for approval.')
            } else {
                toast.error(result.error || 'Failed to submit review')
            }
        } catch {
            toast.error('Something went wrong. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : '0.0'

    const avgRatingRounded = reviews.length > 0
        ? Math.round(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length)
        : 0

    return (
        <div className="bg-white min-h-screen font-body">
            {/* Hero Section */}
            <div className="bg-gray-50 border-b border-gray-200 py-16 md:py-20">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-primary font-body text-xs tracking-[0.3em] uppercase mb-3">Trusted by Families</p>
                    <h1 className="text-3xl md:text-5xl font-heading font-light text-gray-900 mb-4">Customer Reviews</h1>
                    <p className="text-gray-500 max-w-xl mx-auto leading-relaxed">
                        Real feedback from real families. Your experience matters to us.
                    </p>

                    {/* Rating Summary */}
                    {reviews.length > 0 && (
                        <div className="flex items-center justify-center gap-4 mt-8">
                            <span className="text-4xl font-heading font-light text-gray-900">{averageRating}</span>
                            <div>
                                <div className="flex gap-0.5 mb-1">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <Star key={i} className={`w-5 h-5 ${i <= avgRatingRounded ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                                    ))}
                                </div>
                                <p className="text-xs text-gray-500">{reviews.length} verified {reviews.length === 1 ? 'review' : 'reviews'}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="container mx-auto px-4 py-12 md:py-16">
                {/* Trustpilot Widget */}
                <div className="mb-16">
                    <div className="text-center mb-6">
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Also verified on</p>
                    </div>
                    <div
                        ref={trustpilotRef}
                        className="trustpilot-widget"
                        data-locale="en-US"
                        data-template-id="56278e9abfbbba0bdcd568bc"
                        data-businessunit-id="699cada2007f422695581af9"
                        data-style-height="52px"
                        data-style-width="100%"
                        data-token="36253e1e-cde8-4405-b6bb-9b2aa80fd115"
                    >
                        <a href="https://www.trustpilot.com/review/habibaminhas.com" target="_blank" rel="noopener noreferrer">Trustpilot</a>
                    </div>
                </div>

                {/* Leave a Review Section */}
                <div className="max-w-2xl mx-auto mb-20">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl md:text-3xl font-heading font-light text-gray-900 mb-2">Share Your Experience</h2>
                        <p className="text-gray-500 text-sm">Choose how you&apos;d like to leave your review</p>
                    </div>

                    {/* Two Options */}
                    {reviewOption === 'choose' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Trustpilot Option */}
                            <button
                                onClick={() => {
                                    window.open('https://www.trustpilot.com/review/habibaminhas.com', '_blank')
                                }}
                                className="group p-6 border-2 border-gray-200 rounded-xl hover:border-[#00b67a] transition-all duration-300 text-left"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#00b67a" />
                                    </svg>
                                    <span className="font-heading text-lg text-gray-900">Trustpilot</span>
                                </div>
                                <p className="text-sm text-gray-500 mb-4">
                                    Review us on Trustpilot, a globally trusted review platform.
                                </p>
                                <span className="text-sm font-medium text-[#00b67a] group-hover:underline inline-flex items-center gap-1">
                                    Review on Trustpilot <ExternalLink className="w-3.5 h-3.5" />
                                </span>
                            </button>

                            {/* Internal Review Option */}
                            <button
                                onClick={() => setReviewOption('bibae')}
                                className="group p-6 border-2 border-gray-200 rounded-xl hover:border-primary transition-all duration-300 text-left"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Star className="w-4 h-4 text-primary fill-primary" />
                                    </div>
                                    <span className="font-heading text-lg text-gray-900">Habiba Minhas</span>
                                </div>
                                <p className="text-sm text-gray-500 mb-4">
                                    Leave a review directly on our website. Quick and easy!
                                </p>
                                <span className="text-sm font-medium text-primary group-hover:underline inline-flex items-center gap-1">
                                    Write a Review <Send className="w-3.5 h-3.5" />
                                </span>
                            </button>
                        </div>
                    )}

                    {/* Internal Review Form */}
                    {reviewOption === 'bibae' && !submitted && (
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 md:p-8">
                            <button
                                onClick={() => setReviewOption('choose')}
                                className="text-xs text-gray-400 hover:text-gray-600 mb-4 inline-flex items-center gap-1"
                            >
                                &larr; Back to options
                            </button>

                            <div className="space-y-5">
                                {/* Rating */}
                                <div>
                                    <label className="text-sm font-medium text-gray-900 mb-2 block uppercase tracking-wider">
                                        Your Rating
                                    </label>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <button
                                                key={s}
                                                onClick={() => setRating(s)}
                                                onMouseEnter={() => setHoverRating(s)}
                                                onMouseLeave={() => setHoverRating(0)}
                                                className="focus:outline-none"
                                            >
                                                <Star className={`w-7 h-7 transition-all ${s <= (hoverRating || rating)
                                                    ? 'fill-yellow-400 text-yellow-400 scale-110'
                                                    : 'text-gray-300 hover:text-yellow-300'
                                                    }`}
                                                />
                                            </button>
                                        ))}
                                        {rating > 0 && (
                                            <span className="text-sm text-gray-500 ml-2 self-center">
                                                {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Name + Email Row */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-900 mb-1.5 block">
                                            Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            placeholder="Your name"
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-900 mb-1.5 block">
                                            Email <span className="text-gray-400 text-xs">(optional)</span>
                                        </label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            placeholder="your@email.com"
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Comment */}
                                <div>
                                    <label className="text-sm font-medium text-gray-900 mb-1.5 block">
                                        Your Review <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={comment}
                                        onChange={e => setComment(e.target.value)}
                                        placeholder="Tell us about your experience with Habiba Minhas..."
                                        rows={4}
                                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                                    />
                                </div>

                                {/* Submit */}
                                <button
                                    onClick={handleSubmitReview}
                                    disabled={isSubmitting}
                                    className={`w-full py-3.5 rounded-sm font-medium uppercase tracking-wider text-sm transition-all duration-300 flex items-center justify-center gap-2 ${isSubmitting
                                        ? 'bg-gray-400 text-white cursor-wait'
                                        : 'bg-primary hover:bg-gold-dark text-white shadow-button hover:shadow-button-hover hover:-translate-y-0.5'
                                        }`}
                                >
                                    {isSubmitting ? 'Submitting...' : (
                                        <><Send className="w-4 h-4" /> Submit Review</>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Success Message */}
                    {submitted && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
                            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                            <h3 className="font-heading text-xl text-gray-900 mb-2">Thank You!</h3>
                            <p className="text-sm text-gray-600 mb-6">
                                Your review has been submitted and is pending approval. It will appear on our website shortly.
                            </p>
                            <button
                                onClick={() => {
                                    setSubmitted(false)
                                    setReviewOption('choose')
                                }}
                                className="text-sm font-medium text-primary hover:underline"
                            >
                                Submit another review
                            </button>
                        </div>
                    )}
                </div>

                {/* Reviews List */}
                <div>
                    <div className="text-center mb-10">
                        <p className="text-primary font-body text-xs tracking-[0.3em] uppercase mb-2">What Our Customers Say</p>
                        <h2 className="text-2xl md:text-3xl font-heading font-light text-gray-900">Verified Reviews</h2>
                    </div>

                    {reviews.length === 0 ? (
                        <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200 max-w-xl mx-auto">
                            <Star className="w-10 h-10 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 mb-2">No reviews yet</p>
                            <p className="text-sm text-gray-400">Be the first to share your experience!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {reviews.map((review) => (
                                <div key={review.id} className="bg-gray-50 border border-gray-100 rounded-xl p-6 hover:shadow-md transition-shadow">
                                    {/* Stars */}
                                    <div className="flex gap-0.5 mb-4">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <Star key={i} className={`w-4 h-4 ${i <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                                        ))}
                                    </div>

                                    {/* Comment */}
                                    <p className="text-gray-700 text-sm leading-relaxed mb-6 italic">
                                        &ldquo;{review.comment}&rdquo;
                                    </p>

                                    {/* Author */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                                                <User className="w-4 h-4 text-primary" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-semibold text-gray-900">{review.name}</h4>
                                                <span className="text-xs text-green-600 flex items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3" /> Verified
                                                </span>
                                            </div>
                                        </div>
                                        <span className="text-xs text-gray-400">
                                            {new Date(review.created_at).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
