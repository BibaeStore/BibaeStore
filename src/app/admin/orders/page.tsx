'use client'

import { useState } from 'react'
import { Search, Filter, Eye, MoreHorizontal, ArrowUpDown, Calendar, CheckCircle2, Clock, Truck, Ban } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
import { useEffect } from 'react'
import { OrderService } from '@/services/order.service'
import { toast } from 'sonner'
import Image from 'next/image'
import { formatPrice } from '@/lib/products'

// Mock Data
const statuses = [
    { label: 'All Statuses', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Processing', value: 'processing' },
    { label: 'Shipped', value: 'shipped' },
    { label: 'Delivered', value: 'delivered' },
    { label: 'Cancelled', value: 'cancelled' },
]

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [selectedOrder, setSelectedOrder] = useState<any>(null)

    useEffect(() => {
        fetchOrders()
    }, [])

    const fetchOrders = async () => {
        try {
            setLoading(true)
            const data = await OrderService.getAllOrders()
            setOrders(data)
        } catch (error) {
            console.error('Failed to fetch orders:', error)
            toast.error('Failed to load orders')
        } finally {
            setLoading(false)
        }
    }

    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
        try {
            await OrderService.updateOrderStatus(orderId, newStatus)
            toast.success(`Order status updated to ${newStatus}`)
            // Update local state
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
            if (selectedOrder?.id === orderId) {
                setSelectedOrder({ ...selectedOrder, status: newStatus })
            }
        } catch (error) {
            console.error('Status update failed:', error)
            toast.error('Failed to update status')
        }
    }

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'delivered': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
            case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200'
            case 'processing': return 'bg-blue-100 text-blue-700 border-blue-200'
            case 'shipped': return 'bg-indigo-100 text-indigo-700 border-indigo-200'
            case 'cancelled': return 'bg-red-100 text-red-700 border-red-200'
            default: return 'bg-gray-100 text-gray-700 border-gray-200'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'delivered': return <CheckCircle2 className="w-3 h-3 mr-1" />
            case 'processing': return <Clock className="w-3 h-3 mr-1" />
            case 'shipped': return <Truck className="w-3 h-3 mr-1" />
            case 'cancelled': return <Ban className="w-3 h-3 mr-1" />
            default: return null
        }
    }

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.client?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === 'all' || order.status.toLowerCase() === statusFilter.toLowerCase()
        return matchesSearch && matchesStatus
    })

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1.5">
                    <h1 className="text-3xl font-heading font-bold text-gray-900 tracking-tight">Orders</h1>
                    <p className="text-gray-500 font-body text-sm uppercase tracking-[0.1em]">Manage & Track Orders</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-11 border-gray-200 bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-2xl px-6 text-xs uppercase tracking-widest transition-all shadow-sm">
                        <Calendar className="w-4 h-4 mr-2" /> Recent
                    </Button>
                    <Button variant="outline" className="h-11 border-gray-200 bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-2xl px-6 text-xs uppercase tracking-widest transition-all shadow-sm">
                        Export CSV
                    </Button>
                </div>
            </div>

            <Card className="bg-white border-gray-200 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="px-8 pt-8 pb-4 space-y-4">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search by Order ID or Customer..."
                                className="pl-10 h-11 bg-gray-50 border-gray-200 text-gray-900 rounded-xl focus-visible:ring-1 focus-visible:ring-primary/20 focus-visible:bg-white transition-all duration-300 placeholder:text-gray-400 text-sm w-full"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
                            {statuses.map((status) => (
                                <Button
                                    key={status.value}
                                    variant="ghost"
                                    onClick={() => setStatusFilter(status.value)}
                                    className={`h-9 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${statusFilter === status.value
                                        ? 'bg-white text-gray-900 border-gray-300 shadow-sm font-semibold'
                                        : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300'
                                        }`}
                                >
                                    {status.label}
                                </Button>
                            ))}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                    <Table>
                        <TableHeader className="bg-gray-50/50 border-b border-gray-200">
                            <TableRow className="hover:bg-transparent border-gray-200">
                                <TableHead className="w-[120px] py-5 pl-8 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">Order ID</TableHead>
                                <TableHead className="py-5 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">Customer</TableHead>
                                <TableHead className="py-5 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">Date & Time</TableHead>
                                <TableHead className="py-5 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">Items</TableHead>
                                <TableHead className="py-5 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">Total</TableHead>
                                <TableHead className="py-5 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">Payment</TableHead>
                                <TableHead className="py-5 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">Status</TableHead>
                                <TableHead className="text-right py-5 pr-8 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredOrders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-48 text-center text-gray-500">
                                        No orders found matching your criteria.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredOrders.map((order) => (
                                    <TableRow key={order.id} className="border-b border-gray-200 hover:bg-gray-50/50 transition-colors group cursor-pointer" onClick={() => setSelectedOrder(order)}>
                                        <TableCell className="py-5 pl-8 font-mono text-gray-900 font-medium group-hover:text-primary transition-colors">
                                            #{order.id.slice(0, 8).toUpperCase()}
                                        </TableCell>
                                        <TableCell className="py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary border border-primary/20 uppercase">
                                                    {order.client?.full_name?.charAt(0) || 'U'}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-gray-900">{order.client?.full_name || 'Unknown'}</span>
                                                    <span className="text-[10px] text-gray-400">{order.client?.email}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-5 text-gray-500 text-sm">
                                            {format(new Date(order.created_at), 'MMM dd, yyyy')} <span className="text-xs text-gray-400 ml-1">{format(new Date(order.created_at), 'HH:mm')}</span>
                                        </TableCell>
                                        <TableCell className="py-5 text-gray-500 text-sm">
                                            {order.items?.length || 0} items
                                        </TableCell>
                                        <TableCell className="py-5 font-bold text-gray-900">
                                            {formatPrice(order.total_amount)}
                                        </TableCell>
                                        <TableCell className="py-5">
                                            <Badge variant="outline" className={`border-gray-200 bg-gray-50 text-gray-600`}>
                                                COD
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-5">
                                            <Badge className={`${getStatusColor(order.status)} border px-2.5 py-0.5 rounded-full flex w-fit items-center shadow-sm uppercase text-[10px] font-bold tracking-wider`}>
                                                {getStatusIcon(order.status)}
                                                {order.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right py-5 pr-8">
                                            <div onClick={(e) => e.stopPropagation()}>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-900 hover:bg-gray-100">
                                                            <MoreHorizontal className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-[160px] bg-white border-gray-200 rounded-xl shadow-lg p-1">
                                                        <DropdownMenuLabel className="text-xs text-gray-400 uppercase tracking-widest px-2 py-1.5 font-bold">Manage</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => setSelectedOrder(order)} className="rounded-lg text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 cursor-pointer px-2 py-2 mb-0.5">
                                                            <Eye className="w-3.5 h-3.5 mr-2" /> View Details
                                                        </DropdownMenuItem>
                                                        {order.status === 'pending' && (
                                                            <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'processing')} className="rounded-lg text-sm text-emerald-600 bg-emerald-50 hover:bg-emerald-100 cursor-pointer px-2 py-2 mb-0.5 font-bold">
                                                                <CheckCircle2 className="w-3.5 h-3.5 mr-2" /> Confirm Order
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuSeparator className="bg-gray-100 my-1" />
                                                        <DropdownMenuLabel className="text-[9px] text-gray-400 uppercase tracking-widest px-2 py-1 font-bold">Status Update</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'processing')} className="rounded-lg text-sm text-blue-600 hover:bg-blue-50 cursor-pointer px-2 py-2">
                                                            <Clock className="w-3.5 h-3.5 mr-2" /> Mark Processing
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'shipped')} className="rounded-lg text-sm text-indigo-600 hover:bg-indigo-50 cursor-pointer px-2 py-2">
                                                            <Truck className="w-3.5 h-3.5 mr-2" /> Mark Shipped
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'delivered')} className="rounded-lg text-sm text-emerald-600 hover:bg-emerald-50 cursor-pointer px-2 py-2">
                                                            <CheckCircle2 className="w-3.5 h-3.5 mr-2" /> Mark Delivered
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator className="bg-gray-100 my-1" />
                                                        <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, 'cancelled')} className="rounded-lg text-sm text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer px-2 py-2 font-bold">
                                                            <Ban className="w-3.5 h-3.5 mr-2" /> Cancel Order
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Order Details Modal */}
            <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
                <DialogContent className="bg-white border-gray-200 shadow-2xl rounded-[2rem] sm:max-w-xl">
                    <DialogHeader className="border-b border-gray-200 pb-6">
                        <div className="flex items-center justify-between pr-8">
                            <div>
                                <DialogTitle className="text-2xl font-heading font-bold text-gray-900 flex items-center gap-3">
                                    Order #{selectedOrder?.id.slice(0, 8).toUpperCase()}
                                    <Badge className={`${selectedOrder ? getStatusColor(selectedOrder.status) : ''} border px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-none uppercase tracking-wider`}>
                                        {selectedOrder?.status}
                                    </Badge>
                                </DialogTitle>
                                <DialogDescription className="text-gray-500 mt-1 flex items-center gap-2 text-xs font-medium">
                                    <Calendar className="w-3 h-3" />
                                    Placed on {selectedOrder && format(new Date(selectedOrder.created_at), 'PPP p')}
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    {selectedOrder && (
                        <div className="space-y-8 pt-2">
                            {/* Customer Info */}
                            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-200">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary border border-primary/20 uppercase">
                                    {selectedOrder.client?.full_name?.charAt(0) || 'U'}
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-900">{selectedOrder.client?.full_name || 'Unknown'}</h4>
                                    <p className="text-xs text-gray-500">{selectedOrder.client?.email}</p>
                                    <p className="text-[10px] font-bold text-primary mt-1 uppercase tracking-widest">{selectedOrder.client?.phone_number || 'No Phone'}</p>
                                </div>
                            </div>

                            {/* Shipping Address */}
                            <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100 flex gap-3 italic">
                                <Truck className="w-5 h-5 text-amber-600 shrink-0" />
                                <div className="text-xs text-amber-900/70 leading-relaxed">
                                    <span className="font-bold block not-italic text-amber-900 mb-1">Shipping Destination</span>
                                    {selectedOrder.shipping_address || 'No Address Provided'}
                                </div>
                            </div>

                            {/* Order Items Mock */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Order Items</h4>
                                <div className="space-y-3 max-h-48 overflow-y-auto pr-2 scrollbar-none">
                                    {selectedOrder.items?.map((item: any) => (
                                        <div key={item.id} className="flex items-center gap-4 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 rounded-lg px-2 transition-colors">
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
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{item.size || 'Standard'} • {item.color || 'Default'}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-gray-900">{formatPrice(item.price)}</p>
                                                <p className="text-[10px] text-gray-400 font-bold">Qty: {item.quantity}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="bg-gray-900 p-6 rounded-2xl space-y-3 border border-primary/20 shadow-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                                <div className="relative z-10 space-y-3">
                                    <div className="flex justify-between text-xs text-gray-400 font-bold uppercase tracking-widest">
                                        <span>Merchandise Subtotal</span>
                                        <span className="text-white">{formatPrice(selectedOrder.total_amount - (selectedOrder.total_amount >= 5000 ? 0 : 200))}</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-400 font-bold uppercase tracking-widest">
                                        <span>Shipping & Handling</span>
                                        <span className="text-white">{selectedOrder.total_amount >= 5000 ? 'FREE' : formatPrice(200)}</span>
                                    </div>
                                    <div className="border-t border-white/10 pt-4 flex justify-between items-center mt-3">
                                        <span className="font-heading text-primary text-sm font-bold uppercase tracking-[0.2em]">Grand Total</span>
                                        <span className="text-2xl font-heading font-bold text-white tracking-tight">{formatPrice(selectedOrder.total_amount)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                {selectedOrder.status === 'pending' ? (
                                    <Button
                                        onClick={() => handleStatusUpdate(selectedOrder.id, 'processing')}
                                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 rounded-xl shadow-lg shadow-emerald-200 transition-all border-0 uppercase tracking-widest text-xs"
                                    >
                                        <CheckCircle2 className="w-4 h-4 mr-2" /> Confirm Order
                                    </Button>
                                ) : (
                                    <Button className="flex-1 bg-gray-900 hover:bg-gray-800 text-white border border-primary/50 hover:border-primary font-bold h-11 rounded-xl shadow-sm hover:shadow-md transition-all uppercase tracking-widest text-xs">
                                        Print Invoice
                                    </Button>
                                )}
                                <Button className="flex-1 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 hover:border-gray-400 font-bold h-11 rounded-xl shadow-sm hover:shadow-md transition-all uppercase tracking-widest text-xs">
                                    Track Order
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
