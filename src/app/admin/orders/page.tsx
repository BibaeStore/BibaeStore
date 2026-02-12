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

// Mock Data
const statuses = [
    { label: 'All Statuses', value: 'all' },
    { label: 'Processing', value: 'processing' },
    { label: 'Shipped', value: 'shipped' },
    { label: 'Delivered', value: 'delivered' },
    { label: 'Cancelled', value: 'cancelled' },
]

const recentOrders = [
    {
        id: "ORD-7421",
        customer: { name: "Amna Khan", email: "amna.khan@example.com", avatar: "AK" },
        date: new Date(2023, 10, 25, 14, 30),
        amount: 12500,
        status: "Processing",
        items: 3,
        payment: "COD"
    },
    {
        id: "ORD-7420",
        customer: { name: "Zoya Ahmed", email: "zoya.ahmed@example.com", avatar: "ZA" },
        date: new Date(2023, 10, 25, 12, 15),
        amount: 8200,
        status: "Shipped",
        items: 1,
        payment: "Paid"
    },
    {
        id: "ORD-7419",
        customer: { name: "Sana Malik", email: "sana.malik@example.com", avatar: "SM" },
        date: new Date(2023, 10, 24, 18, 45),
        amount: 15000,
        status: "Delivered",
        items: 4,
        payment: "Paid"
    },
    {
        id: "ORD-7418",
        customer: { name: "Hiba Ali", email: "hiba.ali@example.com", avatar: "HA" },
        date: new Date(2023, 10, 24, 10, 0),
        amount: 5400,
        status: "Cancelled",
        items: 2,
        payment: "Failed"
    },
    {
        id: "ORD-7417",
        customer: { name: "Fatima Noor", email: "fatima.noor@example.com", avatar: "FN" },
        date: new Date(2023, 10, 23, 16, 20),
        amount: 21000,
        status: "Processing",
        items: 5,
        payment: "COD"
    },
]

export default function OrdersPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [selectedOrder, setSelectedOrder] = useState<any>(null)

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'delivered': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
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

    const filteredOrders = recentOrders.filter(order => {
        const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              order.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
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
                                    className={`h-9 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                                        statusFilter === status.value
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
                                            {order.id}
                                        </TableCell>
                                        <TableCell className="py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 border border-gray-200">
                                                    {order.customer.avatar}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-gray-900">{order.customer.name}</span>
                                                    <span className="text-[10px] text-gray-400">{order.customer.email}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-5 text-gray-500 text-sm">
                                            {format(order.date, 'MMM dd, yyyy')} <span className="text-xs text-gray-400 ml-1">{format(order.date, 'HH:mm')}</span>
                                        </TableCell>
                                        <TableCell className="py-5 text-gray-500 text-sm">
                                            {order.items} items
                                        </TableCell>
                                        <TableCell className="py-5 font-bold text-gray-900">
                                            Rs. {order.amount.toLocaleString()}
                                        </TableCell>
                                        <TableCell className="py-5">
                                            <Badge variant="outline" className={`border-gray-200 ${order.payment === 'Paid' ? 'text-emerald-600 bg-emerald-50' : order.payment === 'Failed' ? 'text-red-600 bg-red-50' : 'text-amber-600 bg-amber-50'}`}>
                                                {order.payment}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-5">
                                            <Badge className={`${getStatusColor(order.status)} border px-2.5 py-0.5 rounded-full flex w-fit items-center shadow-sm`}>
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
                                                        <DropdownMenuLabel className="text-xs text-gray-400 uppercase tracking-widest px-2 py-1.5 font-bold">Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => setSelectedOrder(order)} className="rounded-lg text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 cursor-pointer px-2 py-2 mb-0.5">
                                                            <Eye className="w-3.5 h-3.5 mr-2" /> View Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="rounded-lg text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 cursor-pointer px-2 py-2">
                                                            <Truck className="w-3.5 h-3.5 mr-2" /> Update Status
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator className="bg-gray-100 my-1" />
                                                        <DropdownMenuItem className="rounded-lg text-sm text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer px-2 py-2">
                                                            Cancel Order
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
                                    Order {selectedOrder?.id}
                                    <Badge className={`${selectedOrder ? getStatusColor(selectedOrder.status) : ''} border px-2.5 py-0.5 rounded-full text-xs font-bold shadow-none`}>
                                        {selectedOrder?.status}
                                    </Badge>
                                </DialogTitle>
                                <DialogDescription className="text-gray-500 mt-1 flex items-center gap-2 text-xs font-medium">
                                    <Calendar className="w-3 h-3" />
                                    Placed on {selectedOrder && format(selectedOrder.date, 'PPP p')}
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    {selectedOrder && (
                        <div className="space-y-8 pt-2">
                            {/* Customer Info */}
                            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-200">
                                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-sm font-bold text-gray-900 border border-gray-200 shadow-sm">
                                    {selectedOrder.customer.avatar}
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-900">{selectedOrder.customer.name}</h4>
                                    <p className="text-xs text-gray-500">{selectedOrder.customer.email}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">+92 300 1234567</p>
                                </div>
                            </div>

                            {/* Order Items Mock */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">Order Items</h4>
                                <div className="space-y-3">
                                    {[1, 2].map((item) => (
                                        <div key={item} className="flex items-center gap-4 py-2 border-b border-gray-200 last:border-0">
                                            <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200" />
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-gray-900">Premium Lawn Suit - Vol 3</p>
                                                <p className="text-xs text-gray-500">Unstitched • Blue</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold text-gray-900">Rs. 4,500</p>
                                                <p className="text-xs text-gray-500">Qty: 1</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="bg-gray-50 p-6 rounded-2xl space-y-3 border border-gray-200">
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Subtotal</span>
                                    <span className="font-medium text-gray-900">Rs. {selectedOrder.amount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Shipping</span>
                                    <span className="font-medium text-gray-900">Rs. 200</span>
                                </div>
                                <div className="border-t border-gray-200 pt-3 flex justify-between items-center mt-3">
                                    <span className="font-bold text-gray-900">Total</span>
                                    <span className="text-lg font-bold text-primary">Rs. {(selectedOrder.amount + 200).toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button className="flex-1 bg-gray-900 hover:bg-gray-800 text-white border border-primary/50 hover:border-primary font-bold h-11 rounded-xl shadow-sm hover:shadow-md transition-all">
                                    Print Invoice
                                </Button>
                                <Button className="flex-1 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 hover:border-gray-400 font-bold h-11 rounded-xl shadow-sm hover:shadow-md transition-all">
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
