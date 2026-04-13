'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import {
    Search,
    Loader2,
    CheckCircle2,
    Clock,
    Truck,
    ShieldCheck,
    ShieldX,
    Home,
    ArrowRight,
    AlertCircle,
} from 'lucide-react'
import { getOrderByTrackingAction } from '@/app/track/actions'
import { Order, StatusHistoryEntry } from '@/types/client'
import {
    staggerContainer,
    staggerItem,
    pageVariants,
    fadeVariants,
} from '@/lib/animations'

interface TimelineStep {
    key: string
    label: string
    icon: React.ReactNode
    timestamp: string | null
    completed: boolean
    active: boolean
}

const STATUS_FLOW = ['pending', 'under_review', 'processing', 'shipped', 'delivered'] as const

const STEP_CONFIG: Record<string, { label: string; icon: React.ReactNode }> = {
    pending: {
        label: 'Order Placed',
        icon: <CheckCircle2 className="w-5 h-5" />,
    },
    under_review: {
        label: 'Payment Verified',
        icon: <ShieldCheck className="w-5 h-5" />,
    },
    processing: {
        label: 'Processing',
        icon: <Clock className="w-5 h-5" />,
    },
    shipped: {
        label: 'Dispatched',
        icon: <Truck className="w-5 h-5" />,
    },
    delivered: {
        label: 'Delivered',
        icon: <Home className="w-5 h-5" />,
    },
}

function buildTimeline(order: Order): TimelineStep[] {
    const history: StatusHistoryEntry[] = order.status_history || []
    const isPaymentRejected = (order as any).payment_status === 'rejected'
    const currentStatusIndex = STATUS_FLOW.indexOf(
        order.status as (typeof STATUS_FLOW)[number]
    )

    const steps: TimelineStep[] = STATUS_FLOW.map((stepKey, index) => {
        const config = STEP_CONFIG[stepKey]
        let timestamp: string | null = null

        if (stepKey === 'pending' && order.created_at) {
            timestamp = order.created_at
        } else {
            const historyEntry = history.find(h => {
                const normalizedStatus = h.status.toLowerCase().replace(/\s+/g, '_')
                if (stepKey === 'under_review') {
                    return (
                        normalizedStatus === 'under_review' ||
                        normalizedStatus === 'verified' ||
                        h.note?.toLowerCase().includes('payment verified')
                    )
                }
                return normalizedStatus === stepKey
            })
            if (historyEntry) {
                timestamp = historyEntry.timestamp
            }
        }

        const completed = currentStatusIndex >= index
        const active = currentStatusIndex === index

        return {
            key: stepKey,
            label: config.label,
            icon: config.icon,
            timestamp,
            completed,
            active,
        }
    })

    if (isPaymentRejected) {
        const rejectionEntry = history.find(h => {
            const normalized = h.status.toLowerCase().replace(/\s+/g, '_')
            return normalized === 'rejected' || normalized === 'payment_rejected' ||
                h.note?.toLowerCase().includes('rejected') || h.note?.toLowerCase().includes('payment rejected')
        })

        const rejectionStep: TimelineStep = {
            key: 'payment_rejected',
            label: 'Payment Rejected',
            icon: <ShieldX className="w-5 h-5" />,
            timestamp: rejectionEntry?.timestamp || null,
            completed: true,
            active: true,
        }

        steps.splice(1, 0, rejectionStep)

        for (let i = 2; i < steps.length; i++) {
            steps[i].completed = false
            steps[i].active = false
        }
    }

    return steps
}

export default function TrackingContent() {
    const searchParams = useSearchParams()
    const prefilled = searchParams.get('number') || ''

    const [trackingNumber, setTrackingNumber] = useState(prefilled)
    const [inputValue, setInputValue] = useState(prefilled)
    const [order, setOrder] = useState<Order | null>(null)
    const [loading, setLoading] = useState(false)
    const [searched, setSearched] = useState(false)
    const [isCancelled, setIsCancelled] = useState(false)
    const [isPaymentRejected, setIsPaymentRejected] = useState(false)

    const handleSearch = useCallback(async (number?: string) => {
        const query = (number || inputValue).trim()
        if (!query) {
            toast.error('Please enter a tracking number')
            return
        }

        setLoading(true)
        setSearched(true)
        setOrder(null)
        setIsCancelled(false)
        setIsPaymentRejected(false)

        try {
            const result = await getOrderByTrackingAction(query)
            if (result.error) {
                toast.error('Something went wrong. Please try again.')
            } else if (result.data) {
                setOrder(result.data)
                setTrackingNumber(query)
                if (result.data.status === 'cancelled') {
                    setIsCancelled(true)
                }
                if (result.data.payment_status === 'rejected') {
                    setIsPaymentRejected(true)
                }
            } else {
                toast.error('No order found with that tracking number')
            }
        } catch (error) {
            console.error('Tracking lookup failed:', error)
            toast.error('Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }, [inputValue])

    useEffect(() => {
        if (prefilled) {
            handleSearch(prefilled)
        }
    }, [prefilled, handleSearch])

    const timeline = order ? buildTimeline(order) : []

    return (
        <div className="container mx-auto px-4 -mt-8">
            {/* Search Bar */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="max-w-2xl mx-auto"
            >
                <div className="bg-background border border-border p-2 flex items-center shadow-lg">
                    <div className="flex-1 flex items-center gap-3 pl-4">
                        <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                        <input
                            type="text"
                            value={inputValue}
                            onChange={e => setInputValue(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter') handleSearch()
                            }}
                            placeholder="Enter tracking number (e.g. BB-XXXXXXXX)"
                            className="w-full py-3 text-sm font-body bg-transparent focus:outline-none placeholder:text-muted-foreground/50"
                        />
                    </div>
                    <button
                        onClick={() => handleSearch()}
                        disabled={loading}
                        className="bg-foreground text-background px-8 py-3 text-sm font-body font-medium tracking-widest uppercase hover:bg-foreground/90 transition-colors disabled:opacity-50 flex items-center gap-2 flex-shrink-0"
                    >
                        {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                Track
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>
            </motion.div>

            {/* Results */}
            <div className="max-w-2xl mx-auto mt-10 pb-20">
                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                )}

                {!loading && searched && !order && (
                    <motion.div
                        variants={fadeVariants}
                        initial="initial"
                        animate="animate"
                        className="text-center py-16"
                    >
                        <AlertCircle className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" strokeWidth={1} />
                        <h2 className="font-heading text-2xl font-light mb-2">
                            Order Not Found
                        </h2>
                        <p className="text-muted-foreground font-body text-sm max-w-sm mx-auto">
                            We couldn't find an order with tracking number "{inputValue}". Please
                            double-check your tracking number and try again.
                        </p>
                    </motion.div>
                )}

                {!loading && order && isCancelled && (
                    <motion.div
                        variants={pageVariants}
                        initial="initial"
                        animate="animate"
                        className="bg-background border border-border p-8"
                    >
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                                <AlertCircle className="w-8 h-8 text-red-500" />
                            </div>
                            <h2 className="font-heading text-2xl font-light mb-2">
                                Order Cancelled
                            </h2>
                            <p className="text-muted-foreground font-body text-sm mb-4">
                                Tracking: <span className="font-semibold text-foreground">{trackingNumber}</span>
                            </p>
                            <p className="text-sm text-muted-foreground font-body">
                                This order has been cancelled. If you have questions, please contact our support team.
                            </p>
                        </div>
                    </motion.div>
                )}

                {!loading && order && !isCancelled && (
                    <motion.div
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                    >
                        <motion.div
                            variants={staggerItem}
                            className="bg-background border border-border p-6 mb-6"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold mb-1">
                                        Tracking Number
                                    </p>
                                    <p className="font-heading text-2xl font-bold text-primary">
                                        {trackingNumber}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold mb-1">
                                        Order Date
                                    </p>
                                    <p className="font-body text-sm">
                                        {order.created_at
                                            ? new Date(order.created_at).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })
                                            : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {isPaymentRejected && (
                            <motion.div
                                variants={staggerItem}
                                className="bg-red-50 border border-red-200 p-6 mb-6"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                        <ShieldX className="w-5 h-5 text-red-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-heading text-lg font-medium text-red-800 mb-1">
                                            Payment Verification Rejected
                                        </h3>
                                        <p className="text-sm text-red-700 font-body mb-3">
                                            Your payment could not be verified. This may be due to an incorrect screenshot, mismatch in amount, or unclear proof of payment.
                                        </p>
                                        <p className="text-sm text-red-600 font-body font-medium">
                                            Please contact us on{' '}
                                            <a
                                                href="https://wa.me/923348438007"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="underline font-bold"
                                            >
                                                WhatsApp
                                            </a>
                                            {' '}to resolve this issue or resubmit your payment proof.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        <motion.div
                            variants={staggerItem}
                            className="bg-background border border-border p-6 md:p-8"
                        >
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-8">
                                Order Status Timeline
                            </h3>

                            <div className="space-y-0">
                                {timeline.map((step, index) => {
                                    const isLast = index === timeline.length - 1
                                    return (
                                        <motion.div
                                            key={step.key}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.15 + index * 0.1 }}
                                            className="relative flex gap-4 md:gap-6"
                                        >
                                            <div className="flex flex-col items-center">
                                                <div
                                                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all ${
                                                        step.key === 'payment_rejected'
                                                            ? 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/20'
                                                            : step.completed
                                                                ? step.active
                                                                    ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                                                                    : 'bg-emerald-500 border-emerald-500 text-white'
                                                                : 'bg-muted border-border text-muted-foreground/40'
                                                        }`}
                                                >
                                                    {step.completed && !step.active ? (
                                                        <CheckCircle2 className="w-5 h-5" />
                                                    ) : (
                                                        step.icon
                                                    )}
                                                </div>
                                                {!isLast && (
                                                    <div
                                                        className={`w-0.5 flex-1 min-h-[40px] ${
                                                            step.key === 'payment_rejected'
                                                                ? 'bg-gradient-to-b from-red-500 to-border'
                                                                : step.completed && timeline[index + 1]?.completed
                                                                    ? 'bg-emerald-500'
                                                                    : step.completed
                                                                        ? 'bg-gradient-to-b from-emerald-500 to-border'
                                                                        : 'bg-border'
                                                            }`}
                                                    />
                                                )}
                                            </div>

                                            <div className={`pb-8 ${isLast ? 'pb-0' : ''}`}>
                                                <p
                                                    className={`font-heading text-base font-medium ${
                                                        step.key === 'payment_rejected'
                                                            ? 'text-red-600'
                                                            : step.completed
                                                                ? 'text-foreground'
                                                                : 'text-muted-foreground/50'
                                                        }`}
                                                >
                                                    {step.label}
                                                </p>
                                                {step.timestamp ? (
                                                    <p className="text-xs text-muted-foreground font-body mt-1">
                                                        {new Date(step.timestamp).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                        <span className="mx-1.5 text-muted-foreground/30">|</span>
                                                        <span className="text-primary/70">
                                                            {formatDistanceToNow(new Date(step.timestamp), {
                                                                addSuffix: true,
                                                            })}
                                                        </span>
                                                    </p>
                                                ) : (
                                                    <p className="text-xs text-muted-foreground/40 font-body mt-1">
                                                        {step.completed ? 'Completed' : 'Pending'}
                                                    </p>
                                                )}
                                            </div>
                                        </motion.div>
                                    )
                                })}
                            </div>
                        </motion.div>

                        <motion.div
                            variants={staggerItem}
                            className="mt-6 text-center"
                        >
                            <p className="text-xs text-muted-foreground font-body">
                                Need help?{' '}
                                <a
                                    href="https://wa.me/923348438007"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline font-medium"
                                >
                                    Contact us on WhatsApp
                                </a>
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </div>

            {/* Tracking Guide / Info */}
            <div className="max-w-2xl mx-auto pb-20">
                <div className="bg-white border border-border p-8 rounded-2xl shadow-sm">
                    <h2 className="font-heading text-xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-bold text-sm text-gray-900 mb-2">When will I get my tracking number?</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">Tracking numbers are usually emailed within 24-48 hours after your order is confirmed. If you haven't received it, please check your spam folder.</p>
                        </div>
                        <div>
                            <h3 className="font-bold text-sm text-gray-900 mb-2">Why is there no update on my status?</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">It can take up to 24 hours for the courier to update scanning information once the parcel is dispatched. Please check back later.</p>
                        </div>
                        <div>
                            <h3 className="font-bold text-sm text-gray-900 mb-2">What if my order is delayed?</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">Standard delivery takes 3-5 business days. If it's been longer than a week, contact us on WhatsApp with your tracking ID.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
