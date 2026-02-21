'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import {
    Search,
    Eye,
    MoreHorizontal,
    Calendar,
    CheckCircle2,
    Clock,
    Truck,
    Ban,
    Download,
    Printer,
    Package,
    AlertTriangle,
    CreditCard,
    Banknote,
    ImageIcon,
    ExternalLink,
    Save,
    Loader2,
    ShieldCheck,
    ShieldX,
    XCircle,
    FileText,
    Pencil,
    Trash2,
} from 'lucide-react'
import { OrderEditForm } from './OrderEditForm'
import {
    getOrdersAction,
    getOrderDetailsAction,
    updateOrderStatusAction,
    updatePaymentStatusAction,
    addAdminNoteAction,
    approveCancellationAction,
    deleteOrderAction,
    updateOrderAction
} from './actions'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { format } from 'date-fns'
import { toast } from 'sonner'
import Image from 'next/image'
import { formatPrice } from '@/lib/products'
import { createClient } from '@/lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'


// ─── Status filter definitions ───
const statuses = [
    { label: 'All', value: 'all', icon: null },
    { label: 'Pending', value: 'pending', icon: Clock },
    { label: 'Under Review', value: 'under_review', icon: Eye },
    { label: 'Processing', value: 'processing', icon: Package },
    { label: 'Shipped', value: 'shipped', icon: Truck },
    { label: 'Delivered', value: 'delivered', icon: CheckCircle2 },
    { label: 'Cancelled', value: 'cancelled', icon: Ban },
]

// ─── Status color mapping ───
const getStatusColor = (status: string) => {
    switch (status) {
        case 'delivered': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
        case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200'
        case 'under_review': return 'bg-orange-100 text-orange-700 border-orange-200'
        case 'processing': return 'bg-blue-100 text-blue-700 border-blue-200'
        case 'shipped': return 'bg-indigo-100 text-indigo-700 border-indigo-200'
        case 'cancelled': return 'bg-red-100 text-red-700 border-red-200'
        default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
}

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'delivered': return <CheckCircle2 className="w-3 h-3 mr-1" />
        case 'pending': return <Clock className="w-3 h-3 mr-1" />
        case 'under_review': return <Eye className="w-3 h-3 mr-1" />
        case 'processing': return <Package className="w-3 h-3 mr-1" />
        case 'shipped': return <Truck className="w-3 h-3 mr-1" />
        case 'cancelled': return <Ban className="w-3 h-3 mr-1" />
        default: return null
    }
}

// ─── Payment status color mapping ───
const getPaymentStatusColor = (paymentStatus: string) => {
    switch (paymentStatus) {
        case 'verified': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
        case 'rejected': return 'bg-red-100 text-red-700 border-red-200'
        case 'under_review': return 'bg-orange-100 text-orange-700 border-orange-200'
        case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200'
        default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
}

// ─── Format status label for display ───
const formatStatusLabel = (status: string) => {
    return status.replace(/_/g, ' ')
}

// ─── Helper: send status email to customer (fire-and-forget) ───
function sendStatusEmail(order: any, emailType: string, extraData?: Record<string, unknown>) {
    const customerEmail = order.client?.email || order.guest_email
    const customerName = order.client?.full_name || order.guest_name || 'Customer'
    const trackingNumber = order.tracking_number || `#${order.id.slice(0, 8).toUpperCase()}`

    if (!customerEmail) {
        console.warn('No customer email for order', order.id)
        return
    }

    fetch('/api/send-email', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-secret': process.env.NEXT_PUBLIC_INTERNAL_API_SECRET || '',
        },
        body: JSON.stringify({
            type: emailType,
            to: customerEmail,
            data: {
                name: customerName,
                trackingNumber,
                ...extraData,
            },
        }),
    }).catch((err) => console.error('Email send failed:', err))
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [selectedOrder, setSelectedOrder] = useState<any>(null)

    // Detail modal state
    const [adminNote, setAdminNote] = useState('')
    const [savingNote, setSavingNote] = useState(false)
    const [proofViewerOpen, setProofViewerOpen] = useState(false)

    // Dispatch note dialog state
    const [dispatchDialogOpen, setDispatchDialogOpen] = useState(false)
    const [dispatchNote, setDispatchNote] = useState('')
    const [dispatchOrderId, setDispatchOrderId] = useState<string | null>(null)
    const [dispatchLoading, setDispatchLoading] = useState(false)

    // Edit and Delete state
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [editingOrder, setEditingOrder] = useState<any>(null)
    const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null)

    // Loading state for status/payment updates (prevents double-clicks)
    const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)

    // Realtime highlight state
    const [highlightedOrderIds, setHighlightedOrderIds] = useState<Set<string>>(new Set())

    // Single stable client instance for realtime — never recreate it
    const supabaseRef = useRef<SupabaseClient | null>(null)
    if (!supabaseRef.current) {
        supabaseRef.current = createClient()
    }

    // Use ref for selectedOrder in realtime callbacks to avoid channel recreation
    const selectedOrderRef = useRef<any>(null)

    // ─── Data fetching ───
    useEffect(() => {
        fetchOrders()
    }, [])


    // Keep ref in sync so realtime callbacks use latest selectedOrder without recreating channel
    useEffect(() => {
        selectedOrderRef.current = selectedOrder
    }, [selectedOrder])

    useEffect(() => {
        const supabase = supabaseRef.current!

        // Throttle UPDATE events to prevent excessive API calls
        let updateTimeout: NodeJS.Timeout | null = null
        const pendingUpdates = new Set<string>()

        const processUpdates = async () => {
            const idsToUpdate = Array.from(pendingUpdates)
            pendingUpdates.clear()

            for (const orderId of idsToUpdate) {
                try {
                    const fullOrder = await getOrderDetailsAction(orderId).then(r => { if (r.error) throw new Error(r.error); return r.data })
                    setOrders(prev => prev.map(o => o.id === orderId ? fullOrder : o))

                    if (selectedOrderRef.current?.id === orderId) {
                        setSelectedOrder(fullOrder)
                    }
                } catch (err) {
                    console.error('Failed to fetch updated order:', err)
                }
            }
        }

        const channel = supabase
            .channel('orders-page-live')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'orders'
            }, (payload) => {
                const newOrderId = payload.new.id as string

                // Wait for order_items to be inserted, then fetch full order
                setTimeout(async () => {
                    try {
                        const fullOrder = await getOrderDetailsAction(newOrderId).then(r => { if (r.error) throw new Error(r.error); return r.data })
                        setOrders(prev => {
                            if (prev.some(o => o.id === newOrderId)) return prev
                            return [fullOrder, ...prev]
                        })

                        // Highlight the new row briefly
                        setHighlightedOrderIds(prev => new Set(prev).add(newOrderId))
                        setTimeout(() => {
                            setHighlightedOrderIds(prev => {
                                const next = new Set(prev)
                                next.delete(newOrderId)
                                return next
                            })
                        }, 3000)
                    } catch (err) {
                        console.error('Failed to fetch new order:', err)
                    }
                }, 1000)
            })
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'orders'
            }, (payload) => {
                const updatedOrderId = payload.new.id as string

                // Add to pending updates
                pendingUpdates.add(updatedOrderId)

                // Clear existing timeout
                if (updateTimeout) clearTimeout(updateTimeout)

                // Process updates after 500ms of no new updates (debounce)
                updateTimeout = setTimeout(processUpdates, 500)
            })
            .on('postgres_changes', {
                event: 'DELETE',
                schema: 'public',
                table: 'orders'
            }, (payload) => {
                const deletedOrderId = payload.old.id as string
                setOrders(prev => prev.filter(o => o.id !== deletedOrderId))
                if (selectedOrderRef.current?.id === deletedOrderId) {
                    setSelectedOrder(null)
                    toast.info('The order you were viewing was deleted.')
                }
            })
            .subscribe((status, err) => {
                if (err) {
                    console.error('[Orders] Realtime subscription error:', err)
                }
            })

        return () => {
            if (updateTimeout) clearTimeout(updateTimeout)
            supabase.removeChannel(channel)
        }
    }, [])

    // Sync admin note when selected order changes
    useEffect(() => {
        if (selectedOrder) {
            setAdminNote(selectedOrder.admin_notes || '')
        }
    }, [selectedOrder])

    const fetchOrders = async () => {
        try {
            setLoading(true)
            const supabase = createClient()
            const { data, error } = await supabase
                .from('orders')
                .select('*, items:order_items(*, product:products(name, images))')
                .order('created_at', { ascending: false })
            if (error) throw new Error(error.message)
            setOrders(data || [])
        } catch (error: any) {
            console.error('Failed to fetch orders:', error?.message)
            toast.error(error?.message || 'Failed to load orders')
        } finally {
            setLoading(false)
        }
    }

    // ─── Edit & Delete Handlers ───
    const handleEdit = useCallback((order: any) => {
        setEditingOrder(order)
        setIsEditModalOpen(true)
    }, [])

    const handleUpdateSuccess = useCallback((updatedOrder: any) => {
        setOrders(prev => prev.map(o => o.id === updatedOrder.id ? { ...o, ...updatedOrder } : o))
        if (selectedOrder?.id === updatedOrder.id) {
            setSelectedOrder((prev: any) => ({ ...prev, ...updatedOrder }))
        }
    }, [selectedOrder])

    const handleDelete = useCallback((id: string) => {
        setDeleteOrderId(id)
    }, [])

    const confirmDelete = useCallback(async () => {
        if (!deleteOrderId) return

        try {
            const result = await deleteOrderAction(deleteOrderId)
            if (result.error) throw new Error(result.error)

            toast.success("Order deleted successfully")
            setOrders(prev => prev.filter(o => o.id !== deleteOrderId))
            if (selectedOrder?.id === deleteOrderId) {
                setSelectedOrder(null)
            }
        } catch (error: any) {
            console.error('Delete failed:', error)
            toast.error(error.message || "Failed to delete order")
        } finally {
            setDeleteOrderId(null)
        }
    }, [deleteOrderId, selectedOrder])

    // ─── Filtering ───
    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const term = searchTerm.toLowerCase()
            const customerName = order.client?.full_name || order.guest_name || ''
            const matchesSearch =
                order.id?.toLowerCase().includes(term) ||
                order.tracking_number?.toLowerCase().includes(term) ||
                customerName.toLowerCase().includes(term)
            const matchesStatus = statusFilter === 'all' || order.status === statusFilter
            return matchesSearch && matchesStatus
        })
    }, [orders, searchTerm, statusFilter])

    // ─── Status update with history ───
    const handleStatusUpdate = useCallback(async (orderId: string, newStatus: string, note?: string) => {
        if (updatingOrderId) return
        try {
            setUpdatingOrderId(orderId)
            const statusResult = await updateOrderStatusAction(orderId, newStatus, note)
            if (statusResult.error) throw new Error(statusResult.error)
            toast.success(`Order status updated to ${formatStatusLabel(newStatus)}`)
            const order = orders.find(o => o.id === orderId)
            setOrders(prev => prev.map(o =>
                o.id === orderId ? { ...o, status: newStatus, updated_at: new Date().toISOString() } : o
            ))
            if (selectedOrder?.id === orderId) {
                setSelectedOrder((prev: any) => prev ? { ...prev, status: newStatus, updated_at: new Date().toISOString() } : null)
            }

            // Send customer email at key milestones
            if (order) {
                if (newStatus === 'processing') {
                    sendStatusEmail(order, 'order_confirmed')
                } else if (newStatus === 'delivered') {
                    sendStatusEmail(order, 'order_delivered')
                }
            }
        } catch (error) {
            console.error('Status update failed:', error)
            toast.error('Failed to update order status')
        } finally {
            setUpdatingOrderId(null)
        }
    }, [selectedOrder, orders, updatingOrderId])

    // ─── Payment status update ───
    const handlePaymentStatusUpdate = useCallback(async (orderId: string, paymentStatus: string, orderStatus?: string) => {
        if (updatingOrderId) return
        try {
            setUpdatingOrderId(orderId)
            const payResult = await updatePaymentStatusAction(orderId, paymentStatus, orderStatus)
            if (payResult.error) throw new Error(payResult.error)
            toast.success(`Payment ${paymentStatus === 'verified' ? 'verified' : 'rejected'} successfully`)
            const order = orders.find(o => o.id === orderId)
            setOrders(prev => prev.map(o =>
                o.id === orderId ? {
                    ...o,
                    payment_status: paymentStatus,
                    ...(orderStatus ? { status: orderStatus } : {}),
                    updated_at: new Date().toISOString()
                } : o
            ))
            if (selectedOrder?.id === orderId) {
                setSelectedOrder((prev: any) => prev ? {
                    ...prev,
                    payment_status: paymentStatus,
                    ...(orderStatus ? { status: orderStatus } : {}),
                    updated_at: new Date().toISOString()
                } : null)
            }

            // Send customer email for payment verification/rejection
            if (order) {
                if (paymentStatus === 'verified') {
                    sendStatusEmail(order, 'order_confirmed')
                } else if (paymentStatus === 'rejected') {
                    sendStatusEmail(order, 'payment_rejected')
                }
            }
        } catch (error) {
            console.error('Payment status update failed:', error)
            toast.error('Failed to update payment status')
        } finally {
            setUpdatingOrderId(null)
        }
    }, [selectedOrder, orders, updatingOrderId])

    // ─── Admin notes ───
    const handleSaveAdminNote = useCallback(async () => {
        if (!selectedOrder) return
        try {
            setSavingNote(true)
            const noteResult = await addAdminNoteAction(selectedOrder.id, adminNote)
            if (noteResult.error) throw new Error(noteResult.error)
            toast.success('Admin note saved')
            setOrders(prev => prev.map(o =>
                o.id === selectedOrder.id ? { ...o, admin_notes: adminNote } : o
            ))
            setSelectedOrder((prev: any) => prev ? { ...prev, admin_notes: adminNote } : null)
        } catch (error) {
            console.error('Failed to save note:', error)
            toast.error('Failed to save admin note')
        } finally {
            setSavingNote(false)
        }
    }, [selectedOrder, adminNote])

    // ─── Cancellation approval ───
    const handleApproveCancellation = useCallback(async (orderId: string) => {
        if (updatingOrderId) return
        try {
            setUpdatingOrderId(orderId)
            const cancelResult = await approveCancellationAction(orderId)
            if (cancelResult.error) throw new Error(cancelResult.error)
            toast.success('Cancellation approved')
            const order = orders.find(o => o.id === orderId)
            setOrders(prev => prev.map(o =>
                o.id === orderId ? { ...o, status: 'cancelled', cancellation_requested: false, updated_at: new Date().toISOString() } : o
            ))
            if (selectedOrder?.id === orderId) {
                setSelectedOrder((prev: any) => prev ? { ...prev, status: 'cancelled', cancellation_requested: false, updated_at: new Date().toISOString() } : null)
            }

            // Send cancellation approved email to customer
            if (order) {
                sendStatusEmail(order, 'cancellation_approved')
            }
        } catch (error) {
            console.error('Cancellation approval failed:', error)
            toast.error('Failed to approve cancellation')
        } finally {
            setUpdatingOrderId(null)
        }
    }, [selectedOrder, orders, updatingOrderId])

    const handleRejectCancellation = useCallback(async (orderId: string) => {
        if (updatingOrderId) return
        try {
            setUpdatingOrderId(orderId)
            const currentOrder = orders.find(o => o.id === orderId)
            const rejectResult = await updateOrderStatusAction(orderId, currentOrder?.status || 'processing', 'Cancellation request rejected by admin')
            if (rejectResult.error) throw new Error(rejectResult.error)
            await updateOrderAction(orderId, { cancellation_requested: false })
            toast.success('Cancellation request rejected')
            setOrders(prev => prev.map(o =>
                o.id === orderId ? { ...o, cancellation_requested: false } : o
            ))
            if (selectedOrder?.id === orderId) {
                setSelectedOrder((prev: any) => prev ? { ...prev, cancellation_requested: false } : null)
            }
        } catch (error) {
            console.error('Cancellation rejection failed:', error)
            toast.error('Failed to reject cancellation')
        } finally {
            setUpdatingOrderId(null)
        }
    }, [selectedOrder, orders, updatingOrderId])

    // ─── Mark shipped with dispatch note ───
    const openDispatchDialog = useCallback((orderId: string) => {
        setDispatchOrderId(orderId)
        setDispatchNote('')
        setDispatchDialogOpen(true)
    }, [])

    const confirmDispatch = useCallback(async () => {
        if (!dispatchOrderId) return
        try {
            setDispatchLoading(true)
            const note = dispatchNote.trim() ? `Shipped: ${dispatchNote.trim()}` : 'Order shipped'
            const dispatchResult = await updateOrderStatusAction(dispatchOrderId, 'shipped', note)
            if (dispatchResult.error) throw new Error(dispatchResult.error)
            toast.success('Order marked as shipped')
            const order = orders.find(o => o.id === dispatchOrderId)
            setOrders(prev => prev.map(o =>
                o.id === dispatchOrderId ? { ...o, status: 'shipped', updated_at: new Date().toISOString() } : o
            ))
            if (selectedOrder?.id === dispatchOrderId) {
                setSelectedOrder((prev: any) => prev ? { ...prev, status: 'shipped', updated_at: new Date().toISOString() } : null)
            }
            setDispatchDialogOpen(false)

            // Send dispatched email to customer
            if (order) {
                sendStatusEmail(order, 'order_dispatched', {
                    dispatchNote: dispatchNote.trim() || undefined,
                })
            }
        } catch (error) {
            console.error('Dispatch update failed:', error)
            toast.error('Failed to mark as shipped')
        } finally {
            setDispatchLoading(false)
        }
    }, [dispatchOrderId, dispatchNote, selectedOrder, orders])

    // ─── CSV export ───
    const handleExportCSV = useCallback(() => {
        try {
            const headers = ['Order ID', 'Tracking #', 'Customer', 'Email', 'Phone', 'Total', 'Status', 'Payment', 'Payment Status', 'Address', 'Date']
            const rows = filteredOrders.map((order: any) => [
                order.id.slice(0, 8).toUpperCase(),
                order.tracking_number || '',
                order.client?.full_name || order.guest_name || 'Unknown',
                order.client?.email || order.guest_email || '',
                order.client?.phone_number || order.guest_phone || '',
                order.total_amount,
                order.status,
                order.payment_method || 'cod',
                order.payment_status || 'pending',
                (order.shipping_address || '').replace(/,/g, ';'),
                order.created_at ? new Date(order.created_at).toLocaleDateString() : ''
            ])
            const csvContent = [
                headers.join(','),
                ...rows.map((row: any[]) => row.map(cell => `"${cell}"`).join(','))
            ].join('\n')
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `orders-${format(new Date(), 'yyyy-MM-dd')}.csv`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
            toast.success(`Exported ${filteredOrders.length} orders`)
        } catch (error) {
            console.error('Export failed:', error)
            toast.error('Failed to export orders')
        }
    }, [filteredOrders])

    // ─── Print shipping label ───
    const handlePrintShippingLabel = useCallback((order: any) => {
        const printWindow = window.open('', '_blank', 'width=500,height=700')
        if (!printWindow) {
            toast.error('Please allow popups for printing')
            return
        }

        const customerName = order.client?.full_name || order.guest_name || 'Customer'
        const customerPhone = order.client?.phone_number || order.guest_phone || 'N/A'
        const customerEmail = order.client?.email || order.guest_email || ''
        const trackingNo = order.tracking_number || `#${order.id.slice(0, 8).toUpperCase()}`
        const orderDate = order.created_at ? format(new Date(order.created_at), 'dd MMM yyyy, HH:mm') : 'N/A'
        const paymentLabel = order.payment_method === 'online' ? 'PREPAID' : 'COD'
        const paymentBg = order.payment_method === 'online' ? '#059669' : '#C5A059'

        const itemRows = (order.items || []).map((item: any, idx: number) =>
            `<tr>
                <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;font-size:12px;color:#333;">${idx + 1}</td>
                <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;font-size:12px;color:#1a1a1a;font-weight:500;">${item.product?.name || 'Product'}</td>
                <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;font-size:12px;color:#333;text-align:center;">${item.quantity}</td>
                <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;font-size:12px;color:#333;text-align:right;">${formatPrice(item.price)}</td>
            </tr>`
        ).join('')

        printWindow.document.write(`
            <html>
            <head>
                <title>Shipping Label - ${trackingNo}</title>
                <style>
                    @page { size: 10cm 15cm; margin: 0; }
                    * { box-sizing: border-box; margin: 0; padding: 0; }
                    body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; width: 10cm; min-height: 15cm; margin: 0 auto; padding: 0; background: #fff; color: #1a1a1a; }
                    @media print { body { width: 10cm; min-height: 15cm; } }
                </style>
            </head>
            <body>
                <div style="border:2px solid #1a1a1a;min-height:14.5cm;display:flex;flex-direction:column;">
                    <!-- Header with Logo -->
                    <div style="background:#1a1a1a;padding:16px 20px;display:flex;align-items:center;justify-content:space-between;">
                        <div>
                            <img src="/assets/logo.png" alt="Bibae Store" style="height:28px;filter:brightness(0) invert(1);" onerror="this.style.display='none';this.nextElementSibling.style.display='block';" />
                            <div style="display:none;color:#fff;font-size:16px;font-weight:800;letter-spacing:3px;">BIBAÉ STORE</div>
                        </div>
                        <div style="background:${paymentBg};color:#fff;padding:4px 14px;border-radius:20px;font-size:10px;font-weight:700;letter-spacing:2px;">
                            ${paymentLabel}
                        </div>
                    </div>

                    <!-- Tracking Number -->
                    <div style="background:#f8f6f1;padding:12px 20px;border-bottom:1px solid #e8e4dc;text-align:center;">
                        <div style="font-size:8px;color:#999;text-transform:uppercase;letter-spacing:2px;margin-bottom:2px;">Tracking Number</div>
                        <div style="font-size:18px;font-weight:800;letter-spacing:3px;color:#C5A059;font-family:monospace;">${trackingNo}</div>
                    </div>

                    <!-- Ship To Section -->
                    <div style="padding:14px 20px;border-bottom:1px solid #eee;">
                        <div style="font-size:8px;color:#C5A059;text-transform:uppercase;letter-spacing:2px;font-weight:700;margin-bottom:6px;">Ship To</div>
                        <div style="font-size:15px;font-weight:700;color:#1a1a1a;margin-bottom:2px;">${customerName}</div>
                        <div style="font-size:11px;color:#666;margin-bottom:1px;">${customerPhone}</div>
                        ${customerEmail ? `<div style="font-size:10px;color:#999;">${customerEmail}</div>` : ''}
                    </div>

                    <!-- Address -->
                    <div style="padding:12px 20px;border-bottom:1px solid #eee;background:#fafafa;">
                        <div style="font-size:8px;color:#C5A059;text-transform:uppercase;letter-spacing:2px;font-weight:700;margin-bottom:4px;">Delivery Address</div>
                        <div style="font-size:12px;color:#333;line-height:1.5;">${order.shipping_address || 'No address provided'}</div>
                    </div>

                    <!-- Products Table -->
                    <div style="padding:10px 20px;flex:1;">
                        <div style="font-size:8px;color:#C5A059;text-transform:uppercase;letter-spacing:2px;font-weight:700;margin-bottom:6px;">Order Items</div>
                        <table style="width:100%;border-collapse:collapse;">
                            <thead>
                                <tr style="background:#f5f5f5;">
                                    <th style="padding:6px 12px;font-size:9px;color:#999;text-align:left;text-transform:uppercase;letter-spacing:1px;font-weight:600;">#</th>
                                    <th style="padding:6px 12px;font-size:9px;color:#999;text-align:left;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Product</th>
                                    <th style="padding:6px 12px;font-size:9px;color:#999;text-align:center;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Qty</th>
                                    <th style="padding:6px 12px;font-size:9px;color:#999;text-align:right;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemRows}
                            </tbody>
                        </table>
                    </div>

                    <!-- Footer -->
                    <div style="background:#1a1a1a;padding:12px 20px;margin-top:auto;">
                        <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                            <span style="font-size:10px;color:#888;letter-spacing:1px;">SUBTOTAL</span>
                            <span style="font-size:11px;color:#ccc;font-weight:600;">${formatPrice(order.total_amount - 200)}</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;margin-bottom:8px;padding-bottom:8px;border-bottom:1px solid rgba(255,255,255,0.1);">
                            <span style="font-size:10px;color:#888;letter-spacing:1px;">SHIPPING</span>
                            <span style="font-size:11px;color:#ccc;font-weight:600;">${formatPrice(200)}</span>
                        </div>
                        <div style="display:flex;align-items:center;justify-content:space-between;">
                            <div>
                                <div style="font-size:9px;color:#999;letter-spacing:1px;">TOTAL</div>
                                <div style="font-size:16px;font-weight:800;color:#C5A059;">${formatPrice(order.total_amount)}</div>
                            </div>
                            <div style="text-align:right;">
                                <div style="font-size:8px;color:#666;">${orderDate}</div>
                                <div style="font-size:8px;color:#666;">bibaestore.com</div>
                            </div>
                        </div>
                    </div>
                </div>
                <script>window.onload = function() { window.print(); }</script>
            </body>
            </html>
        `)
        printWindow.document.close()
    }, [])

    // ─── Status count badges for filter buttons ───
    const statusCounts = useMemo(() => {
        const counts: Record<string, number> = { all: orders.length }
        orders.forEach(o => {
            counts[o.status] = (counts[o.status] || 0) + 1
        })
        return counts
    }, [orders])

    return (
        <div className="space-y-4 sm:space-y-8 pb-10">
            {/* ─── Page Header ─── */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6">
                <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl font-heading font-bold text-gray-900 tracking-tight">Orders</h1>
                    <p className="text-gray-500 font-body text-xs sm:text-sm uppercase tracking-[0.1em]">Manage & Track Orders</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={handleExportCSV}
                        variant="outline"
                        className="h-9 sm:h-11 border-gray-200 bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-2xl px-4 sm:px-6 text-[10px] sm:text-xs uppercase tracking-widest transition-all shadow-sm"
                    >
                        <Download className="w-4 h-4 mr-2" /> Export CSV
                    </Button>
                </div>
            </div>

            {/* ─── Main Card: Filters + Table ─── */}
            <Card className="bg-white border-gray-200 rounded-2xl sm:rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="px-4 sm:px-8 pt-4 sm:pt-8 pb-4 space-y-4">
                    <div className="flex flex-col lg:flex-row justify-between gap-4">
                        {/* Search */}
                        <div className="relative w-full lg:w-96">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search by Order ID, Tracking #, or Customer..."
                                className="pl-10 h-11 bg-gray-50 border-gray-200 text-gray-900 rounded-xl focus-visible:ring-1 focus-visible:ring-primary/20 focus-visible:bg-white transition-all duration-300 placeholder:text-gray-400 text-sm w-full"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        {/* Status Filters */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
                            {statuses.map((status) => (
                                <Button
                                    key={status.value}
                                    variant="ghost"
                                    onClick={() => setStatusFilter(status.value)}
                                    className={`h-9 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border whitespace-nowrap ${statusFilter === status.value
                                        ? 'bg-white text-gray-900 border-gray-300 shadow-sm font-semibold'
                                        : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300'
                                        }`}
                                >
                                    {status.label}
                                    {(statusCounts[status.value] ?? 0) > 0 && (
                                        <span className={`ml-1.5 text-[9px] px-1.5 py-0.5 rounded-full ${statusFilter === status.value ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                            {statusCounts[status.value]}
                                        </span>
                                    )}
                                </Button>
                            ))}
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="px-0 pb-0">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        </div>
                    ) : (
                        <>
                            {/* Mobile Cards — visible on small screens */}
                            <div className="sm:hidden divide-y divide-gray-100">
                                {filteredOrders.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-48 text-gray-400 px-6">
                                        <Package className="w-10 h-10 mb-3 opacity-20" />
                                        <p className="text-sm font-body">No orders found.</p>
                                    </div>
                                ) : filteredOrders.map((order) => (
                                    <div
                                        key={order.id}
                                        onClick={() => setSelectedOrder(order)}
                                        className={`p-4 cursor-pointer active:bg-gray-50 transition-colors ${highlightedOrderIds.has(order.id) ? 'bg-amber-50' : ''}`}
                                    >
                                        <div className="flex items-start justify-between gap-2 mb-2">
                                            <div className="flex-1 min-w-0">
                                                <p className="font-mono text-sm font-semibold text-gray-900 truncate">
                                                    {order.tracking_number || `#${order.id.slice(0, 8).toUpperCase()}`}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-0.5 truncate">
                                                    {order.client?.full_name || order.guest_name || 'Guest'}
                                                    {!order.client && <span className="ml-1 text-amber-600 font-bold">(Guest)</span>}
                                                </p>
                                            </div>
                                            <Badge className={`${getStatusColor(order.status)} border px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 shadow-none`}>
                                                {formatStatusLabel(order.status)}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center justify-between gap-2 text-xs text-gray-500">
                                            <span>{order.created_at ? format(new Date(order.created_at), 'MMM dd, yyyy') : 'N/A'}</span>
                                            <span className="font-bold text-gray-900">{formatPrice(order.total_amount)}</span>
                                        </div>
                                        <div className="flex items-center justify-between gap-2 mt-2">
                                            <Badge variant="outline" className={`border text-[10px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5 ${order.payment_method === 'online' ? 'border-violet-200 bg-violet-50 text-violet-600' : 'border-gray-200 bg-gray-50 text-gray-600'}`}>
                                                {order.payment_method === 'online' ? 'Bank' : 'COD'}
                                            </Badge>
                                            <Badge className={`${getPaymentStatusColor(order.payment_status || 'pending')} border px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase shadow-none`}>
                                                {formatStatusLabel(order.payment_status || 'pending')}
                                            </Badge>
                                            {order.cancellation_requested && (
                                                <Badge className="bg-red-50 text-red-600 border-red-200 border px-1.5 py-0.5 rounded-full text-[9px] font-bold">
                                                    <AlertTriangle className="w-2.5 h-2.5 mr-0.5 inline" />Cancel Req
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Desktop Table — hidden on mobile */}
                            <div className="hidden sm:block overflow-x-auto [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">
                                <Table className="min-w-[900px]">
                                    <TableHeader className="bg-gray-50/50 border-b border-gray-200">
                                        <TableRow className="hover:bg-transparent border-gray-200">
                                            <TableHead className="w-[120px] py-5 pl-8 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">Tracking #</TableHead>
                                            <TableHead className="py-5 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">Customer</TableHead>
                                            <TableHead className="py-5 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">Date</TableHead>
                                            <TableHead className="py-5 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">Items</TableHead>
                                            <TableHead className="py-5 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">Total</TableHead>
                                            <TableHead className="py-5 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">Payment</TableHead>
                                            <TableHead className="py-5 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">Pay Status</TableHead>
                                            <TableHead className="py-5 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">Status</TableHead>
                                            <TableHead className="text-right py-5 pr-8 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredOrders.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={9} className="h-48 text-center">
                                                    <div className="flex flex-col items-center justify-center text-gray-400">
                                                        <Package className="w-12 h-12 mb-4 opacity-20" />
                                                        <p className="font-body text-sm">No orders found matching your criteria.</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredOrders.map((order) => (
                                                <TableRow
                                                    key={order.id}
                                                    className={`border-b border-gray-200 hover:bg-gray-50/50 transition-all duration-700 group cursor-pointer ${highlightedOrderIds.has(order.id) ? 'bg-amber-50 border-amber-200' : ''}`}
                                                    onClick={() => setSelectedOrder(order)}
                                                >
                                                    {/* Tracking # / Order ID */}
                                                    <TableCell className="py-5 pl-8">
                                                        <div className="flex flex-col">
                                                            <span className="font-mono text-gray-900 font-medium group-hover:text-primary transition-colors text-sm">
                                                                {order.tracking_number || `#${order.id.slice(0, 8).toUpperCase()}`}
                                                            </span>
                                                            {order.cancellation_requested && (
                                                                <Badge className="mt-1 bg-red-50 text-red-600 border-red-200 border px-1.5 py-0 rounded-full text-[9px] font-bold tracking-wider w-fit flex items-center gap-1">
                                                                    <AlertTriangle className="w-2.5 h-2.5" />
                                                                    CANCEL REQ
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </TableCell>

                                                    {/* Customer */}
                                                    <TableCell className="py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border uppercase ${order.client ? 'bg-primary/10 text-primary border-primary/20' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                                                                {(order.client?.full_name || order.guest_name || 'G')?.charAt(0)}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-medium text-gray-900">
                                                                    {order.client?.full_name || order.guest_name || 'Guest'}
                                                                    {!order.client && <span className="text-[9px] ml-1.5 px-1.5 py-0.5 bg-amber-50 text-amber-600 rounded-full border border-amber-200 font-bold">GUEST</span>}
                                                                </span>
                                                                <span className="text-[10px] text-gray-400">{order.client?.email || order.guest_email}</span>
                                                            </div>
                                                        </div>
                                                    </TableCell>

                                                    {/* Date */}
                                                    <TableCell className="py-5 text-gray-500 text-sm">
                                                        {order.created_at ? (
                                                            <>
                                                                {format(new Date(order.created_at), 'MMM dd, yyyy')}
                                                                <span className="text-xs text-gray-400 ml-1">{format(new Date(order.created_at), 'HH:mm')}</span>
                                                            </>
                                                        ) : 'N/A'}
                                                    </TableCell>

                                                    {/* Items count */}
                                                    <TableCell className="py-5 text-gray-500 text-sm">
                                                        {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                                                    </TableCell>

                                                    {/* Total */}
                                                    <TableCell className="py-5 font-bold text-gray-900">
                                                        {formatPrice(order.total_amount)}
                                                    </TableCell>

                                                    {/* Payment Method */}
                                                    <TableCell className="py-5">
                                                        <Badge variant="outline" className={`border text-[10px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5 ${order.payment_method === 'online'
                                                            ? 'border-violet-200 bg-violet-50 text-violet-600'
                                                            : 'border-gray-200 bg-gray-50 text-gray-600'
                                                            }`}
                                                        >
                                                            {order.payment_method === 'online' ? (
                                                                <><CreditCard className="w-3 h-3 mr-1 inline" />Bank</>
                                                            ) : (
                                                                <><Banknote className="w-3 h-3 mr-1 inline" />COD</>
                                                            )}
                                                        </Badge>
                                                    </TableCell>

                                                    {/* Payment Status */}
                                                    <TableCell className="py-5">
                                                        <Badge className={`${getPaymentStatusColor(order.payment_status || 'pending')} border px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase shadow-none`}>
                                                            {formatStatusLabel(order.payment_status || 'pending')}
                                                        </Badge>
                                                    </TableCell>

                                                    {/* Order Status */}
                                                    <TableCell className="py-5">
                                                        <Badge className={`${getStatusColor(order.status)} border px-2.5 py-0.5 rounded-full flex w-fit items-center shadow-sm uppercase text-[10px] font-bold tracking-wider`}>
                                                            {getStatusIcon(order.status)}
                                                            {formatStatusLabel(order.status)}
                                                        </Badge>
                                                    </TableCell>

                                                    {/* Actions Dropdown */}
                                                    <TableCell className="text-right py-5 pr-8">
                                                        <div onClick={(e) => e.stopPropagation()}>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-900 hover:bg-gray-100">
                                                                        <MoreHorizontal className="w-4 h-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end" className="w-[200px] bg-white border-gray-200 rounded-xl shadow-lg p-1">
                                                                    <DropdownMenuLabel className="text-xs text-gray-400 uppercase tracking-widest px-2 py-1.5 font-bold">Manage</DropdownMenuLabel>

                                                                    <DropdownMenuItem onClick={() => setSelectedOrder(order)} className="rounded-lg text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 cursor-pointer px-2 py-2 mb-0.5">
                                                                        <Eye className="w-3.5 h-3.5 mr-2 text-gray-400" /> View Details
                                                                    </DropdownMenuItem>

                                                                    <DropdownMenuItem onClick={() => handleEdit(order)} className="rounded-lg text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 cursor-pointer px-2 py-2 mb-0.5">
                                                                        <Pencil className="w-3.5 h-3.5 mr-2 text-gray-400" /> Edit Info
                                                                    </DropdownMenuItem>

                                                                    <DropdownMenuItem onClick={() => handleDelete(order.id)} className="rounded-lg text-sm text-red-600 hover:bg-red-50 cursor-pointer px-2 py-2 mb-0.5">
                                                                        <Trash2 className="w-3.5 h-3.5 mr-2 text-red-400" /> Delete Order
                                                                    </DropdownMenuItem>


                                                                    {order.status === 'pending' && (
                                                                        <DropdownMenuItem
                                                                            onClick={() => handleStatusUpdate(order.id, 'processing', 'Order confirmed by admin')}
                                                                            disabled={!!updatingOrderId}
                                                                            className="rounded-lg text-sm text-emerald-600 bg-emerald-50 hover:bg-emerald-100 cursor-pointer px-2 py-2 mb-0.5 font-bold"
                                                                        >
                                                                            {updatingOrderId === order.id ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5 mr-2" />} Confirm Order
                                                                        </DropdownMenuItem>
                                                                    )}

                                                                    <DropdownMenuSeparator className="bg-gray-100 my-1" />
                                                                    <DropdownMenuLabel className="text-[9px] text-gray-400 uppercase tracking-widest px-2 py-1 font-bold">Status Update</DropdownMenuLabel>

                                                                    <DropdownMenuItem
                                                                        onClick={() => handleStatusUpdate(order.id, 'processing', 'Moved to processing')}
                                                                        disabled={!!updatingOrderId}
                                                                        className="rounded-lg text-sm text-blue-600 hover:bg-blue-50 cursor-pointer px-2 py-2"
                                                                    >
                                                                        <Package className="w-3.5 h-3.5 mr-2" /> Mark Processing
                                                                    </DropdownMenuItem>

                                                                    <DropdownMenuItem
                                                                        onClick={() => openDispatchDialog(order.id)}
                                                                        disabled={!!updatingOrderId}
                                                                        className="rounded-lg text-sm text-indigo-600 hover:bg-indigo-50 cursor-pointer px-2 py-2"
                                                                    >
                                                                        <Truck className="w-3.5 h-3.5 mr-2" /> Mark Shipped
                                                                    </DropdownMenuItem>

                                                                    <DropdownMenuItem
                                                                        onClick={() => handleStatusUpdate(order.id, 'delivered', 'Order delivered')}
                                                                        disabled={!!updatingOrderId}
                                                                        className="rounded-lg text-sm text-emerald-600 hover:bg-emerald-50 cursor-pointer px-2 py-2"
                                                                    >
                                                                        <CheckCircle2 className="w-3.5 h-3.5 mr-2" /> Mark Delivered
                                                                    </DropdownMenuItem>

                                                                    <DropdownMenuSeparator className="bg-gray-100 my-1" />

                                                                    <DropdownMenuItem
                                                                        onClick={() => handleStatusUpdate(order.id, 'cancelled', 'Order cancelled by admin')}
                                                                        disabled={!!updatingOrderId}
                                                                        className="rounded-lg text-sm text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer px-2 py-2 font-bold"
                                                                    >
                                                                        <Ban className="w-3.5 h-3.5 mr-2" /> Cancel Order
                                                                    </DropdownMenuItem>

                                                                    {order.cancellation_requested && (
                                                                        <>
                                                                            <DropdownMenuSeparator className="bg-gray-100 my-1" />
                                                                            <DropdownMenuLabel className="text-[9px] text-red-400 uppercase tracking-widest px-2 py-1 font-bold">Cancellation Request</DropdownMenuLabel>
                                                                            <DropdownMenuItem
                                                                                onClick={() => handleApproveCancellation(order.id)}
                                                                                disabled={!!updatingOrderId}
                                                                                className="rounded-lg text-sm text-red-600 bg-red-50 hover:bg-red-100 cursor-pointer px-2 py-2 font-bold"
                                                                            >
                                                                                <CheckCircle2 className="w-3.5 h-3.5 mr-2" /> Approve Cancel
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem
                                                                                onClick={() => handleRejectCancellation(order.id)}
                                                                                disabled={!!updatingOrderId}
                                                                                className="rounded-lg text-sm text-gray-600 hover:bg-gray-100 cursor-pointer px-2 py-2"
                                                                            >
                                                                                <XCircle className="w-3.5 h-3.5 mr-2" /> Reject Cancel
                                                                            </DropdownMenuItem>
                                                                        </>
                                                                    )}
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* ═══════════════════════════════════════════
                 ORDER DETAIL DIALOG
                 ═══════════════════════════════════════════ */}
            <Dialog open={!!selectedOrder} onOpenChange={(open) => { if (!open) { setSelectedOrder(null); setProofViewerOpen(false) } }}>
                <DialogContent className="bg-white border-gray-200 shadow-2xl rounded-none sm:rounded-[2rem] sm:max-w-2xl w-full max-h-[100vh] sm:max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-300">
                    <DialogHeader className="border-b border-gray-200 pb-4 sm:pb-6">
                        <div className="flex items-center justify-between pr-8">
                            <div>
                                <DialogTitle className="text-lg sm:text-2xl font-heading font-bold text-gray-900 flex items-center gap-2 sm:gap-3 flex-wrap">
                                    Order #{selectedOrder?.id.slice(0, 8).toUpperCase()}
                                    <Badge className={`${selectedOrder ? getStatusColor(selectedOrder.status) : ''} border px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-none uppercase tracking-wider`}>
                                        {selectedOrder ? formatStatusLabel(selectedOrder.status) : ''}
                                    </Badge>
                                    {selectedOrder?.cancellation_requested && (
                                        <Badge className="bg-red-50 text-red-600 border-red-200 border px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider flex items-center gap-1">
                                            <AlertTriangle className="w-3 h-3" /> Cancel Requested
                                        </Badge>
                                    )}
                                </DialogTitle>
                                <DialogDescription className="text-gray-500 mt-1 flex items-center gap-2 text-xs font-medium">
                                    <Calendar className="w-3 h-3" />
                                    Placed on {selectedOrder && format(new Date(selectedOrder.created_at), 'PPP p')}
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    {selectedOrder && (
                        <div className="space-y-6 pt-2">

                            {/* ── Cancellation Alert ── */}
                            {selectedOrder.cancellation_requested && (
                                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 space-y-3">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-red-800">Cancellation Requested</p>
                                            <p className="text-xs text-red-600 mt-1 leading-relaxed">{selectedOrder.cancellation_reason || 'No reason provided'}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 ml-8">
                                        <Button
                                            size="sm"
                                            disabled={!!updatingOrderId}
                                            onClick={() => handleApproveCancellation(selectedOrder.id)}
                                            className="bg-red-600 hover:bg-red-700 text-white text-[10px] uppercase tracking-widest font-bold h-8 rounded-lg px-4"
                                        >
                                            {updatingOrderId === selectedOrder.id ? <Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> : <CheckCircle2 className="w-3 h-3 mr-1.5" />} Approve
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            disabled={!!updatingOrderId}
                                            onClick={() => handleRejectCancellation(selectedOrder.id)}
                                            className="border-red-200 text-red-600 hover:bg-red-50 text-[10px] uppercase tracking-widest font-bold h-8 rounded-lg px-4"
                                        >
                                            <XCircle className="w-3 h-3 mr-1.5" /> Reject
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* ── Customer Info ── */}
                            <div className={`flex items-center gap-4 p-4 rounded-2xl border ${selectedOrder.client ? 'bg-gray-50 border-gray-200' : 'bg-amber-50/50 border-amber-200'}`}>
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold border uppercase ${selectedOrder.client ? 'bg-primary/10 text-primary border-primary/20' : 'bg-amber-100 text-amber-700 border-amber-300'}`}>
                                    {(selectedOrder.client?.full_name || selectedOrder.guest_name || 'G')?.charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-gray-900">
                                        {selectedOrder.client?.full_name || selectedOrder.guest_name || 'Guest Customer'}
                                        {!selectedOrder.client && <span className="text-[9px] ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full border border-amber-200 font-bold">GUEST ORDER</span>}
                                    </h4>
                                    <p className="text-xs text-gray-500">{selectedOrder.client?.email || selectedOrder.guest_email}</p>
                                    <p className="text-[10px] font-bold text-primary mt-1 uppercase tracking-widest">{selectedOrder.client?.phone_number || selectedOrder.guest_phone || 'No Phone'}</p>
                                </div>
                            </div>

                            {/* ── Shipping Address ── */}
                            <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100 flex gap-3">
                                <Truck className="w-5 h-5 text-amber-600 shrink-0" />
                                <div className="text-xs text-amber-900/70 leading-relaxed flex-1">
                                    <span className="font-bold block text-amber-900 mb-1">Shipping Destination</span>
                                    {selectedOrder.shipping_address || 'No Address Provided'}
                                </div>
                            </div>

                            {/* ── Tracking Number ── */}
                            {selectedOrder.tracking_number && (
                                <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 flex items-center gap-3">
                                    <FileText className="w-5 h-5 text-indigo-600 shrink-0" />
                                    <div>
                                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] block">Tracking Number</span>
                                        <span className="text-sm font-mono font-bold text-indigo-900">{selectedOrder.tracking_number}</span>
                                    </div>
                                </div>
                            )}

                            {/* ── Payment Info + Proof ── */}
                            <div className="space-y-3">
                                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Payment Information</h4>
                                <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className={`border text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-0.5 ${selectedOrder.payment_method === 'online'
                                                ? 'border-violet-200 bg-violet-50 text-violet-600'
                                                : 'border-gray-200 bg-white text-gray-600'
                                                }`}
                                            >
                                                {selectedOrder.payment_method === 'online' ? (
                                                    <><CreditCard className="w-3 h-3 mr-1 inline" /> Bank Transfer</>
                                                ) : (
                                                    <><Banknote className="w-3 h-3 mr-1 inline" /> Cash on Delivery</>
                                                )}
                                            </Badge>
                                        </div>
                                        <Badge className={`${getPaymentStatusColor(selectedOrder.payment_status || 'pending')} border px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase shadow-none`}>
                                            {formatStatusLabel(selectedOrder.payment_status || 'pending')}
                                        </Badge>
                                    </div>

                                    {/* Payment Proof for Bank Transfer */}
                                    {selectedOrder.payment_method === 'online' && (
                                        <div className="space-y-3 pt-2 border-t border-gray-200">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] block">Payment Proof</span>
                                            {selectedOrder.payment_proof_url ? (
                                                <div className="space-y-2">
                                                    <div
                                                        className="relative w-full h-48 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 cursor-pointer group"
                                                        onClick={() => setProofViewerOpen(!proofViewerOpen)}
                                                    >
                                                        <Image
                                                            src={selectedOrder.payment_proof_url}
                                                            alt="Payment Proof"
                                                            fill
                                                            className="object-contain"
                                                        />
                                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                                            <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
                                                                Click to {proofViewerOpen ? 'collapse' : 'expand'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <a
                                                        href={selectedOrder.payment_proof_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 font-bold uppercase tracking-widest transition-colors"
                                                    >
                                                        <ExternalLink className="w-3 h-3" /> Open Full Size
                                                    </a>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-gray-400 text-xs">
                                                    <ImageIcon className="w-4 h-4" />
                                                    <span>No payment proof uploaded</span>
                                                </div>
                                            )}

                                            {/* Verify / Reject Payment Buttons */}
                                            {(selectedOrder.payment_status === 'under_review' || selectedOrder.payment_status === 'pending') && (
                                                <div className="flex gap-2 pt-2">
                                                    <Button
                                                        size="sm"
                                                        disabled={!!updatingOrderId}
                                                        onClick={() => handlePaymentStatusUpdate(selectedOrder.id, 'verified', 'processing')}
                                                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] uppercase tracking-widest font-bold h-9 rounded-lg px-5 shadow-sm"
                                                    >
                                                        {updatingOrderId === selectedOrder.id ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />} Verify Payment
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        disabled={!!updatingOrderId}
                                                        onClick={() => handlePaymentStatusUpdate(selectedOrder.id, 'rejected')}
                                                        className="bg-red-600 hover:bg-red-700 text-white text-[10px] uppercase tracking-widest font-bold h-9 rounded-lg px-5 shadow-sm"
                                                    >
                                                        <ShieldX className="w-3.5 h-3.5 mr-1.5" /> Reject Payment
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* ── Order Items ── */}
                            <div className="space-y-3">
                                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Order Items</h4>
                                <div className="space-y-3 max-h-56 overflow-y-auto pr-2 scrollbar-none">
                                    {selectedOrder.items?.map((item: any, idx: number) => (
                                        <div key={item.id || idx} className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 rounded-lg px-2 transition-colors">
                                            <div className="w-14 h-16 rounded-lg bg-gray-100 border border-gray-200 relative overflow-hidden shrink-0">
                                                <Image
                                                    src={item.product?.images?.[0] || '/assets/placeholder.jpg'}
                                                    alt={item.product?.name || 'Product'}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-gray-900 truncate">{item.product?.name || 'Deleted Product'}</p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{item.size || 'Standard'} {item.color ? `\u2022 ${item.color}` : ''}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-gray-900">{formatPrice(item.price)}</p>
                                                <p className="text-[10px] text-gray-400 font-bold">Qty: {item.quantity}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* ── Summary ── */}
                            <div className="bg-gray-900 p-4 sm:p-6 rounded-2xl space-y-3 border border-primary/20 shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                                <div className="relative z-10 space-y-3">
                                    <div className="flex justify-between text-xs text-gray-400 font-bold uppercase tracking-widest">
                                        <span>Merchandise Subtotal</span>
                                        <span className="text-white">{formatPrice(selectedOrder.total_amount - 200)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-400 font-bold uppercase tracking-widest">
                                        <span>Shipping & Handling</span>
                                        <span className="text-white">{formatPrice(200)}</span>
                                    </div>
                                    <div className="border-t border-white/10 pt-4 flex justify-between items-center mt-3">
                                        <span className="font-heading text-primary text-sm font-bold uppercase tracking-[0.2em]">Grand Total</span>
                                        <span className="text-2xl font-heading font-bold text-white tracking-tight">{formatPrice(selectedOrder.total_amount)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* ── Status History ── */}
                            {selectedOrder.status_history && selectedOrder.status_history.length > 0 && (
                                <div className="space-y-3">
                                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Status History</h4>
                                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2 scrollbar-none">
                                        {[...selectedOrder.status_history].reverse().map((entry: any, idx: number) => (
                                            <div key={idx} className="flex items-start gap-3 py-2 px-3 rounded-lg bg-gray-50 border border-gray-100">
                                                <div className="mt-0.5">
                                                    {getStatusIcon(entry.status) || <Clock className="w-3 h-3 text-gray-400" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <Badge className={`${getStatusColor(entry.status)} border px-1.5 py-0 rounded-full text-[9px] font-bold tracking-wider uppercase shadow-none`}>
                                                            {formatStatusLabel(entry.status)}
                                                        </Badge>
                                                        <span className="text-[10px] text-gray-400">
                                                            {entry.timestamp ? format(new Date(entry.timestamp), 'MMM dd, HH:mm') : ''}
                                                        </span>
                                                    </div>
                                                    {entry.note && <p className="text-xs text-gray-500 mt-1 truncate">{entry.note}</p>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ── Admin Notes ── */}
                            <div className="space-y-3">
                                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Admin Notes</h4>
                                <div className="space-y-2">
                                    <Textarea
                                        value={adminNote}
                                        onChange={(e) => setAdminNote(e.target.value)}
                                        placeholder="Add internal notes about this order..."
                                        className="min-h-[80px] bg-gray-50 border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-primary/20 resize-none"
                                    />
                                    <Button
                                        size="sm"
                                        onClick={handleSaveAdminNote}
                                        disabled={savingNote}
                                        className="bg-gray-900 hover:bg-gray-800 text-white border border-primary/30 hover:border-primary/60 text-[10px] uppercase tracking-widest font-bold h-9 rounded-lg px-5 shadow-sm transition-all"
                                    >
                                        {savingNote ? <Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> : <Save className="w-3 h-3 mr-1.5" />}
                                        Save Note
                                    </Button>
                                </div>
                            </div>

                            {/* ── Action Buttons ── */}
                            <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 pt-2">
                                {selectedOrder.status === 'pending' && (
                                    <Button
                                        disabled={!!updatingOrderId}
                                        onClick={() => handleStatusUpdate(selectedOrder.id, 'processing', 'Order confirmed by admin')}
                                        className="flex-1 min-w-[140px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 rounded-xl shadow-lg shadow-emerald-200 transition-all border-0 uppercase tracking-widest text-xs"
                                    >
                                        {updatingOrderId === selectedOrder.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />} Confirm Order
                                    </Button>
                                )}
                                {selectedOrder.status === 'under_review' && selectedOrder.payment_method === 'online' && (selectedOrder.payment_status === 'under_review' || selectedOrder.payment_status === 'pending') && (
                                    <Button
                                        disabled={!!updatingOrderId}
                                        onClick={() => handlePaymentStatusUpdate(selectedOrder.id, 'verified', 'processing')}
                                        className="flex-1 min-w-[140px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 rounded-xl shadow-lg shadow-emerald-200 transition-all border-0 uppercase tracking-widest text-xs"
                                    >
                                        {updatingOrderId === selectedOrder.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ShieldCheck className="w-4 h-4 mr-2" />} Verify & Process
                                    </Button>
                                )}
                                {selectedOrder.status === 'processing' && (
                                    <Button
                                        disabled={!!updatingOrderId}
                                        onClick={() => openDispatchDialog(selectedOrder.id)}
                                        className="flex-1 min-w-[140px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 rounded-xl shadow-lg shadow-indigo-200 transition-all border-0 uppercase tracking-widest text-xs"
                                    >
                                        <Truck className="w-4 h-4 mr-2" /> Mark Shipped
                                    </Button>
                                )}
                                {selectedOrder.status === 'shipped' && (
                                    <Button
                                        disabled={!!updatingOrderId}
                                        onClick={() => handleStatusUpdate(selectedOrder.id, 'delivered', 'Order delivered')}
                                        className="flex-1 min-w-[140px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 rounded-xl shadow-lg shadow-emerald-200 transition-all border-0 uppercase tracking-widest text-xs"
                                    >
                                        {updatingOrderId === selectedOrder.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />} Mark Delivered
                                    </Button>
                                )}
                                <Button
                                    onClick={() => handleEdit(selectedOrder)}
                                    className="flex-1 min-w-[140px] bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 hover:border-gray-400 font-bold h-11 rounded-xl shadow-sm hover:shadow-md transition-all uppercase tracking-widest text-xs"
                                >
                                    <Pencil className="w-4 h-4 mr-2" /> Edit Details
                                </Button>
                                <Button
                                    onClick={() => handlePrintShippingLabel(selectedOrder)}
                                    className="flex-1 min-w-[140px] bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 hover:border-gray-400 font-bold h-11 rounded-xl shadow-sm hover:shadow-md transition-all uppercase tracking-widest text-xs"
                                >
                                    <Printer className="w-4 h-4 mr-2" /> Print Label
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* ═══════════════════════════════════════════
                 DISPATCH NOTE DIALOG
                 ═══════════════════════════════════════════ */}
            <Dialog open={dispatchDialogOpen} onOpenChange={setDispatchDialogOpen}>
                <DialogContent className="bg-white border-gray-200 shadow-2xl rounded-[2rem] sm:max-w-md">
                    <DialogHeader className="pb-4">
                        <DialogTitle className="text-xl font-heading font-bold text-gray-900 flex items-center gap-2">
                            <Truck className="w-5 h-5 text-indigo-600" /> Mark as Shipped
                        </DialogTitle>
                        <DialogDescription className="text-gray-500 text-xs font-body">
                            Add an optional dispatch note (e.g., courier name, expected delivery date).
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                        <Input
                            value={dispatchNote}
                            onChange={(e) => setDispatchNote(e.target.value)}
                            placeholder="e.g., TCS - Expected delivery: 3-5 business days"
                            className="h-11 bg-gray-50 border-gray-200 text-gray-900 rounded-xl focus-visible:ring-1 focus-visible:ring-indigo-200 placeholder:text-gray-400 text-sm"
                        />
                        <div className="flex gap-3">
                            <Button
                                onClick={confirmDispatch}
                                disabled={dispatchLoading}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 rounded-xl shadow-lg shadow-indigo-200 transition-all border-0 uppercase tracking-widest text-xs"
                            >
                                {dispatchLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Truck className="w-4 h-4 mr-2" />}
                                Confirm Dispatch
                            </Button>
                            <Button
                                onClick={() => setDispatchDialogOpen(false)}
                                variant="outline"
                                className="flex-1 border-gray-300 text-gray-600 hover:bg-gray-50 font-bold h-11 rounded-xl uppercase tracking-widest text-xs"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Order Modal */}
            <OrderEditForm
                open={isEditModalOpen}
                onOpenChange={setIsEditModalOpen}
                order={editingOrder}
                onSuccess={handleUpdateSuccess}
            />

            {/* Delete Confirmation */}
            <AlertDialog open={!!deleteOrderId} onOpenChange={(open) => !open && setDeleteOrderId(null)}>
                <AlertDialogContent className="bg-white border-gray-200">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the order from the database.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white">
                            Delete Order
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
