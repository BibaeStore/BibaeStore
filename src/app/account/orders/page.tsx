'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
    Package,
    ChevronDown,
    ChevronUp,
    ArrowLeft,
    Loader2,
    ShoppingBag,
    Clock,
    CheckCircle2,
    Truck,
    Ban,
    XCircle,
    AlertTriangle,
    CreditCard,
    Banknote,
    Copy,
    ExternalLink,
    RefreshCw,
} from 'lucide-react'
import { getMyOrdersAction, requestCancellationAction } from '@/app/account/orders/actions'
import { Order } from '@/types/client'
import { formatPrice } from '@/lib/products'
import {
    staggerContainer,
    staggerItem,
    fadeVariants,
    collapseVariants,
    pageVariants,
} from '@/lib/animations'

const getStatusColor = (status: string) => {
    switch (status) {
        case 'delivered':
            return 'bg-emerald-100 text-emerald-700 border-emerald-200'
        case 'pending':
            return 'bg-amber-100 text-amber-700 border-amber-200'
        case 'under_review':
            return 'bg-orange-100 text-orange-700 border-orange-200'
        case 'processing':
            return 'bg-blue-100 text-blue-700 border-blue-200'
        case 'shipped':
            return 'bg-indigo-100 text-indigo-700 border-indigo-200'
        case 'cancelled':
            return 'bg-red-100 text-red-700 border-red-200'
        default:
            return 'bg-gray-100 text-gray-700 border-gray-200'
    }
}

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'delivered':
            return <CheckCircle2 className="w-3.5 h-3.5" />
        case 'pending':
            return <Clock className="w-3.5 h-3.5" />
        case 'under_review':
            return <AlertTriangle className="w-3.5 h-3.5" />
        case 'processing':
            return <RefreshCw className="w-3.5 h-3.5" />
        case 'shipped':
            return <Truck className="w-3.5 h-3.5" />
        case 'cancelled':
            return <Ban className="w-3.5 h-3.5" />
        default:
            return <Package className="w-3.5 h-3.5" />
    }
}

const getStatusLabel = (status: string) => {
    switch (status) {
        case 'under_review':
            return 'Under Review'
        default:
            return status.charAt(0).toUpperCase() + status.slice(1)
    }
}

const getPaymentMethodLabel = (method?: string) => {
    switch (method) {
        case 'online':
            return 'Bank Transfer'
        case 'cod':
            return 'Cash on Delivery'
        default:
            return 'Cash on Delivery'
    }
}

const getPaymentIcon = (method?: string) => {
    switch (method) {
        case 'online':
            return <CreditCard className="w-3.5 h-3.5" />
        default:
            return <Banknote className="w-3.5 h-3.5" />
    }
}

export default function MyOrdersPage() {
    const router = useRouter()
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
    const [cancellingOrder, setCancellingOrder] = useState<string | null>(null)
    const [cancellationReason, setCancellationReason] = useState('')
    const [submittingCancellation, setSubmittingCancellation] = useState(false)

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const result = await getMyOrdersAction()
                if (result.error === 'Not authenticated') {
                    router.push('/login')
                    return
                }
                if (result.error) throw new Error(result.error)
                setOrders(result.data as Order[])
            } catch (error) {
                console.error('Failed to fetch orders:', error)
                toast.error('Failed to load your orders')
            } finally {
                setLoading(false)
            }
        }

        fetchOrders()
    }, [router])

    const toggleExpand = (orderId: string) => {
        setExpandedOrder(prev => (prev === orderId ? null : orderId))
    }

    const copyTracking = (trackingNumber: string) => {
        navigator.clipboard.writeText(trackingNumber)
        toast.success('Tracking number copied!')
    }

    const handleRequestCancellation = async (orderId: string) => {
        if (!cancellationReason.trim()) {
            toast.error('Please provide a reason for cancellation')
            return
        }

        setSubmittingCancellation(true)
        try {
            const result = await requestCancellationAction(orderId, cancellationReason.trim())
            if (result.error) throw new Error(result.error)
            toast.success('Cancellation request submitted')
            setOrders(prev =>
                prev.map(o =>
                    o.id === orderId
                        ? { ...o, cancellation_requested: true, cancellation_reason: cancellationReason.trim() }
                        : o
                )
            )
            setCancellingOrder(null)
            setCancellationReason('')
        } catch (error) {
            console.error('Cancellation request failed:', error)
            toast.error('Failed to submit cancellation request')
        } finally {
            setSubmittingCancellation(false)
        }
    }

    const canRequestCancellation = (order: Order) => {
        return (
            (order.status === 'pending' || order.status === 'under_review') &&
            !order.cancellation_requested
        )
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-muted/30">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <main className="min-h-screen bg-muted/30">
            {/* Header */}
            <div className="bg-foreground text-background py-12 md:py-16">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between"
                    >
                        <div>
                            <Link
                                href="/profile"
                                className="inline-flex items-center gap-1.5 text-background/50 hover:text-background/80 text-xs font-body uppercase tracking-widest mb-4 transition-colors"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" />
                                Back to Profile
                            </Link>
                            <h1 className="font-heading text-4xl md:text-5xl font-light">
                                My Orders
                            </h1>
                            <p className="text-background/40 font-body text-sm mt-2">
                                {orders.length} {orders.length === 1 ? 'order' : 'orders'} placed
                            </p>
                        </div>
                        <Package className="w-10 h-10 text-background/20 hidden md:block" strokeWidth={1} />
                    </motion.div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-10">
                {orders.length === 0 ? (
                    <motion.div
                        variants={pageVariants}
                        initial="initial"
                        animate="animate"
                        className="text-center py-20"
                    >
                        <ShoppingBag
                            className="w-20 h-20 text-muted-foreground/20 mx-auto mb-6"
                            strokeWidth={1}
                        />
                        <h2 className="font-heading text-3xl font-light mb-3">
                            No Orders Yet
                        </h2>
                        <p className="text-muted-foreground font-body text-sm mb-10 max-w-sm mx-auto">
                            You haven't placed any orders yet. Explore our collections and find
                            something you love.
                        </p>
                        <Link
                            href="/shop"
                            className="inline-flex items-center gap-2 bg-foreground text-background px-10 py-4 text-sm font-body font-medium tracking-widest uppercase hover:bg-foreground/90 transition-colors"
                        >
                            Start Shopping
                        </Link>
                    </motion.div>
                ) : (
                    <motion.div
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                        className="space-y-4 max-w-4xl mx-auto"
                    >
                        {orders.map(order => (
                            <motion.div
                                key={order.id}
                                variants={staggerItem}
                                className="bg-background border border-border overflow-hidden"
                            >
                                {/* Order Summary Row */}
                                <button
                                    onClick={() => toggleExpand(order.id)}
                                    className="w-full text-left px-6 py-5 hover:bg-muted/30 transition-colors"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                                        {/* Tracking & Date */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                {order.tracking_number && (
                                                    <span className="font-heading text-lg font-semibold text-foreground truncate">
                                                        {order.tracking_number}
                                                    </span>
                                                )}
                                                {!order.tracking_number && (
                                                    <span className="font-heading text-lg font-semibold text-foreground">
                                                        #{order.id.slice(0, 8).toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground font-body">
                                                {order.created_at
                                                    ? new Date(order.created_at).toLocaleDateString('en-US', {
                                                          year: 'numeric',
                                                          month: 'long',
                                                          day: 'numeric',
                                                      })
                                                    : 'Date unavailable'}
                                            </p>
                                        </div>

                                        {/* Payment Method */}
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-body">
                                            {getPaymentIcon(order.payment_method)}
                                            <span>{getPaymentMethodLabel(order.payment_method)}</span>
                                        </div>

                                        {/* Total */}
                                        <div className="text-right md:min-w-[120px]">
                                            <span className="font-heading text-lg font-bold">
                                                {formatPrice(order.total_amount)}
                                            </span>
                                        </div>

                                        {/* Status Badge */}
                                        <div className="flex items-center gap-3">
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-3 py-1 border text-[10px] font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}
                                            >
                                                {getStatusIcon(order.status)}
                                                {getStatusLabel(order.status)}
                                            </span>

                                            {order.cancellation_requested && order.status !== 'cancelled' && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-orange-600 border border-orange-200 text-[9px] font-bold uppercase tracking-wider">
                                                    <AlertTriangle className="w-3 h-3" />
                                                    Cancel Pending
                                                </span>
                                            )}

                                            <motion.div
                                                animate={{ rotate: expandedOrder === order.id ? 180 : 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <ChevronDown className="w-5 h-5 text-muted-foreground" />
                                            </motion.div>
                                        </div>
                                    </div>
                                </button>

                                {/* Expanded Details */}
                                <AnimatePresence>
                                    {expandedOrder === order.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-6 pb-6 border-t border-border">
                                                {/* Order Items */}
                                                <div className="pt-5 space-y-3">
                                                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-3">
                                                        Order Items
                                                    </h4>
                                                    {order.items && order.items.length > 0 ? (
                                                        order.items.map((item: any) => (
                                                            <div
                                                                key={item.id}
                                                                className="flex items-center gap-4 py-3 border-b border-border/50 last:border-0"
                                                            >
                                                                <div className="w-14 h-16 bg-muted overflow-hidden flex-shrink-0 relative">
                                                                    <Image
                                                                        src={
                                                                            item.product?.images?.[0] ||
                                                                            '/assets/placeholder.jpg'
                                                                        }
                                                                        alt={item.product?.name || 'Product'}
                                                                        fill
                                                                        className="object-cover"
                                                                    />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="font-heading text-sm font-medium truncate">
                                                                        {item.product?.name || 'Product Unavailable'}
                                                                    </p>
                                                                    <p className="text-[10px] text-muted-foreground font-body uppercase tracking-wider mt-0.5">
                                                                        Qty: {item.quantity}
                                                                    </p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="font-body text-sm font-semibold">
                                                                        {formatPrice(item.price * item.quantity)}
                                                                    </p>
                                                                    {item.quantity > 1 && (
                                                                        <p className="text-[10px] text-muted-foreground">
                                                                            {formatPrice(item.price)} each
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="text-sm text-muted-foreground font-body py-3">
                                                            No item details available.
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Payment Status */}
                                                {order.payment_status && order.payment_method === 'online' && (
                                                    <div className="mt-4 pt-4 border-t border-border/50">
                                                        <div className="flex items-center gap-2 text-xs font-body">
                                                            <span className="text-muted-foreground">Payment Status:</span>
                                                            <span
                                                                className={`font-semibold capitalize ${
                                                                    order.payment_status === 'verified'
                                                                        ? 'text-emerald-600'
                                                                        : order.payment_status === 'rejected'
                                                                          ? 'text-red-600'
                                                                          : 'text-orange-600'
                                                                }`}
                                                            >
                                                                {order.payment_status === 'under_review'
                                                                    ? 'Under Review'
                                                                    : order.payment_status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Action Buttons */}
                                                <div className="mt-5 pt-5 border-t border-border flex flex-wrap items-center gap-3">
                                                    {/* Copy Tracking */}
                                                    {order.tracking_number && (
                                                        <button
                                                            onClick={e => {
                                                                e.stopPropagation()
                                                                copyTracking(order.tracking_number!)
                                                            }}
                                                            className="inline-flex items-center gap-1.5 px-4 py-2 border border-border text-xs font-body font-medium uppercase tracking-wider hover:bg-muted transition-colors"
                                                        >
                                                            <Copy className="w-3.5 h-3.5" />
                                                            Copy Tracking
                                                        </button>
                                                    )}

                                                    {/* Track Order */}
                                                    {order.tracking_number && (
                                                        <Link
                                                            href={`/track?number=${order.tracking_number}`}
                                                            className="inline-flex items-center gap-1.5 px-4 py-2 border border-border text-xs font-body font-medium uppercase tracking-wider hover:bg-muted transition-colors"
                                                        >
                                                            <Truck className="w-3.5 h-3.5" />
                                                            Track Order
                                                        </Link>
                                                    )}

                                                    {/* Reorder - link to shop */}
                                                    <Link
                                                        href="/shop"
                                                        className="inline-flex items-center gap-1.5 px-4 py-2 border border-border text-xs font-body font-medium uppercase tracking-wider hover:bg-muted transition-colors"
                                                    >
                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                        Reorder
                                                    </Link>

                                                    {/* Request Cancellation */}
                                                    {canRequestCancellation(order) && (
                                                        <button
                                                            onClick={e => {
                                                                e.stopPropagation()
                                                                setCancellingOrder(
                                                                    cancellingOrder === order.id ? null : order.id
                                                                )
                                                                setCancellationReason('')
                                                            }}
                                                            className="inline-flex items-center gap-1.5 px-4 py-2 border border-red-200 text-red-600 text-xs font-body font-medium uppercase tracking-wider hover:bg-red-50 transition-colors ml-auto"
                                                        >
                                                            <XCircle className="w-3.5 h-3.5" />
                                                            Request Cancellation
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Cancellation Form */}
                                                <AnimatePresence>
                                                    {cancellingOrder === order.id && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.2 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="mt-4 p-4 bg-red-50/50 border border-red-100">
                                                                <h5 className="text-xs font-bold uppercase tracking-wider text-red-700 mb-3">
                                                                    Cancellation Reason
                                                                </h5>
                                                                <textarea
                                                                    value={cancellationReason}
                                                                    onChange={e =>
                                                                        setCancellationReason(e.target.value)
                                                                    }
                                                                    placeholder="Please tell us why you'd like to cancel this order..."
                                                                    className="w-full border border-red-200 bg-background p-3 text-sm font-body resize-none focus:outline-none focus:ring-1 focus:ring-red-300 placeholder:text-muted-foreground"
                                                                    rows={3}
                                                                />
                                                                <div className="flex items-center gap-3 mt-3">
                                                                    <button
                                                                        onClick={() => {
                                                                            setCancellingOrder(null)
                                                                            setCancellationReason('')
                                                                        }}
                                                                        className="px-4 py-2 border border-border text-xs font-body font-medium uppercase tracking-wider hover:bg-muted transition-colors"
                                                                    >
                                                                        Never Mind
                                                                    </button>
                                                                    <button
                                                                        onClick={() =>
                                                                            handleRequestCancellation(order.id)
                                                                        }
                                                                        disabled={
                                                                            submittingCancellation ||
                                                                            !cancellationReason.trim()
                                                                        }
                                                                        className="px-4 py-2 bg-red-600 text-white text-xs font-body font-medium uppercase tracking-wider hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                                                    >
                                                                        {submittingCancellation && (
                                                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                                        )}
                                                                        Submit Request
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </main>
    )
}
