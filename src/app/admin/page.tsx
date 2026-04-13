'use client'

import { motion } from 'framer-motion'
import {
    TrendingUp,
    Users,
    ShoppingBag,
    DollarSign,
    Package,
    Clock,
    Calendar,
    Bell,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

import { useEffect, useState, useCallback, useRef } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { useRouter } from 'next/navigation'
import { formatPrice } from '@/lib/products'
import LoadingSpinner from '@/components/LoadingSpinner'
import { createClient } from '@/lib/supabase/client'

interface DashboardStats {
    totalRevenue: number
    activeOrders: number
    totalCustomers: number
    avgOrderValue: number
    todayOrders: number
    todayRevenue: number
}

export default function AdminDashboard() {
    const router = useRouter()
    const [orders, setOrders] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [stats, setStats] = useState<DashboardStats>({
        totalRevenue: 0,
        activeOrders: 0,
        totalCustomers: 0,
        avgOrderValue: 0,
        todayOrders: 0,
        todayRevenue: 0
    })
    const [statusCounts, setStatusCounts] = useState<Record<string, number>>({})

    const fetchData = useCallback(async () => {
        setError(null)
        setIsLoading(true)

        try {
            const supabase = createClient()

            // Fetch recent orders (last 5)
            const { data: ordersData, error: ordersError } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5)

            if (ordersError) throw new Error(ordersError.message)

            // Stats queries in parallel
            const [
                { data: deliveredOrders },
                { count: activeOrders },
                { count: totalCustomers },
                { data: allOrders },
                { data: todayOrdersData },
                { data: allOrderStatuses }
            ] = await Promise.all([
                supabase.from('orders').select('total_amount').eq('status', 'delivered'),
                supabase.from('orders').select('*', { count: 'exact', head: true }).not('status', 'in', '(delivered,cancelled)'),
                supabase.from('clients').select('*', { count: 'exact', head: true }),
                supabase.from('orders').select('total_amount').neq('status', 'cancelled'),
                supabase.from('orders').select('total_amount').gte('created_at', (() => {
                    const d = new Date()
                    d.setHours(0, 0, 0, 0)
                    return d.toISOString()
                })()),
                supabase.from('orders').select('status')
            ])

            const totalRevenue = (deliveredOrders || []).reduce(
                (sum: number, o: any) => sum + Number(o.total_amount), 0
            )
            const avgOrderValue = allOrders && allOrders.length > 0
                ? allOrders.reduce((sum: number, o: any) => sum + Number(o.total_amount), 0) / allOrders.length
                : 0
            const todayOrders = todayOrdersData?.length || 0
            const todayRevenue = (todayOrdersData || []).reduce(
                (sum: number, o: any) => sum + Number(o.total_amount), 0
            )

            // Compute status counts from ALL orders
            const statusCounts: Record<string, number> = {}
            for (const o of (allOrderStatuses || [])) {
                statusCounts[o.status] = (statusCounts[o.status] || 0) + 1
            }

            setOrders(ordersData || [])
            setStats({
                totalRevenue,
                activeOrders: activeOrders || 0,
                totalCustomers: totalCustomers || 0,
                avgOrderValue,
                todayOrders,
                todayRevenue
            })
            setStatusCounts(statusCounts)
        } catch (err: any) {
            console.error('[Dashboard] fetchData error:', err)
            setError(err?.message || 'Failed to load dashboard data')
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])


    const statsCards = [
        {
            title: "Total Revenue",
            value: formatPrice(stats.totalRevenue),
            subtitle: `${formatPrice(stats.todayRevenue)} today`,
            icon: DollarSign,
            color: "text-emerald-600",
            bg: "bg-emerald-100/50"
        },
        {
            title: "Active Orders",
            value: stats.activeOrders.toString(),
            subtitle: `${stats.todayOrders} new today`,
            icon: ShoppingBag,
            color: "text-primary",
            bg: "bg-primary/10"
        },
        {
            title: "Total Customers",
            value: stats.totalCustomers.toString(),
            subtitle: "Registered users",
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-100/50"
        },
        {
            title: "Avg. Order",
            value: formatPrice(stats.avgOrderValue),
            subtitle: "Per order average",
            icon: TrendingUp,
            color: "text-amber-600",
            bg: "bg-amber-100/50"
        },
    ]

    return (
        <div className="space-y-10 pb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1.5">
                    <h1 className="text-3xl font-heading font-bold text-gray-900 tracking-tight">Executive Dashboard</h1>
                    <p className="text-gray-500 font-body text-sm uppercase tracking-[0.1em]">Habiba Minhas Boutique Intelligence Overview</p>
                </div>
                <div className="flex items-center gap-3">

                    <Button
                        variant="outline"
                        className="h-11 border-gray-200 bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-2xl px-6 text-xs uppercase tracking-widest transition-all shadow-sm"
                        onClick={() => router.push('/admin/orders')}
                    >
                        <Calendar className="w-4 h-4 mr-2" /> View Orders
                    </Button>
                    <Button
                        className="h-11 bg-gray-900 hover:bg-gray-800 text-white border border-primary/50 hover:border-primary font-bold rounded-2xl px-6 text-xs uppercase tracking-widest shadow-sm hover:shadow-md transition-all"
                        onClick={() => router.push('/admin/products')}
                    >
                        Create Product
                    </Button>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between">
                    <p className="text-sm text-red-600">{error}</p>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={fetchData}
                        className="text-red-600 hover:bg-red-100 text-xs"
                    >
                        Retry
                    </Button>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {statsCards.map((stat, i) => (
                    <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1, duration: 0.5 }}
                    >
                        <div className="group bg-white border border-gray-200 rounded-[2rem] p-6 hover:shadow-lg hover:shadow-gray-200/50 transition-all cursor-default shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center transition-transform group-hover:scale-110 duration-500 shadow-sm`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="mt-6 space-y-1">
                                <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold">{stat.title}</p>
                                <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                                    {isLoading ? <span className="inline-block w-16 h-6 bg-gray-100 rounded animate-pulse" /> : stat.value}
                                </h3>
                                <p className="text-[10px] text-gray-400">{stat.subtitle}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Orders Table */}
                <Card className="lg:col-span-2 bg-white border-gray-200 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between px-8 pt-8 pb-4">
                        <div className="space-y-1.5">
                            <CardTitle className="font-heading text-xl text-gray-900">Live Transactions</CardTitle>
                            <CardDescription className="text-gray-400 text-xs uppercase tracking-widest font-bold">Latest store movements</CardDescription>
                        </div>
                        <Button
                            variant="ghost"
                            className="text-primary hover:bg-primary/5 h-10 px-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
                            onClick={() => router.push('/admin/orders')}
                        >
                            Explore All
                        </Button>
                    </CardHeader>
                    <CardContent className="px-8 pb-8">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold border-b border-gray-200">
                                        <th className="py-5">Tracking</th>
                                        <th className="py-5">Client</th>
                                        <th className="py-5">Valuation</th>
                                        <th className="py-5">Payment</th>
                                        <th className="py-5 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={5} className="py-10 text-center">
                                                <LoadingSpinner size="sm" />
                                            </td>
                                        </tr>
                                    ) : orders.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-10 text-center text-gray-400">
                                                No transactions found
                                            </td>
                                        </tr>
                                    ) : (
                                        orders.map((order) => (
                                            <tr key={order.id} className="border-b border-gray-200 hover:bg-gray-50/50 transition-colors group cursor-pointer" onClick={() => router.push('/admin/orders')}>
                                                <td className="py-5 font-mono text-gray-500 group-hover:text-primary transition-colors text-xs">
                                                    {order.tracking_number || `#${order.id.slice(0, 8).toUpperCase()}`}
                                                </td>
                                                <td className="py-5">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-gray-900">{order.client?.full_name || order.guest_name || 'Guest'}</span>
                                                        <span className="text-[10px] text-gray-400 flex items-center gap-1.5 mt-1 font-bold">
                                                            <Clock className="w-3 h-3" /> {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-5 font-bold text-gray-900">{formatPrice(order.total_amount)}</td>
                                                <td className="py-5">
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${order.payment_method === 'online'
                                                        ? 'bg-blue-50 text-blue-600'
                                                        : 'bg-gray-100 text-gray-600'
                                                        }`}>
                                                        {order.payment_method === 'online' ? 'Bank' : 'COD'}
                                                    </span>
                                                </td>
                                                <td className="py-5 text-right">
                                                    <span className={`inline-flex px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-[0.1em] ${order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                                                        order.status === 'processing' ? 'bg-primary/10 text-primary' :
                                                            order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                                                                order.status === 'under_review' ? 'bg-amber-100 text-amber-600' :
                                                                    order.status === 'pending' ? 'bg-orange-100 text-orange-600' :
                                                                        order.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                                                                            'bg-gray-100 text-gray-500'
                                                        }`}>
                                                        {order.status === 'under_review' ? 'Review' : order.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Stats Summary */}
                <Card className="bg-white border-gray-200 rounded-[2.5rem] shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="px-8 pt-8 pb-4">
                        <div className="space-y-1.5">
                            <CardTitle className="font-heading text-xl text-gray-900">Order Summary</CardTitle>
                            <CardDescription className="text-gray-400 text-xs uppercase tracking-widest font-bold">Status Distribution</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="px-8 pb-8 space-y-7">
                        {!isLoading && (() => {
                            const total = Object.values(statusCounts).reduce((sum, c) => sum + c, 0)
                            return [
                                { label: "Pending", count: statusCounts['pending'] || 0, color: "bg-orange-500" },
                                { label: "Under Review", count: statusCounts['under_review'] || 0, color: "bg-amber-500" },
                                { label: "Processing", count: statusCounts['processing'] || 0, color: "bg-blue-500" },
                                { label: "Shipped", count: statusCounts['shipped'] || 0, color: "bg-indigo-500" },
                                { label: "Delivered", count: statusCounts['delivered'] || 0, color: "bg-emerald-500" },
                            ].map((item) => (
                                <div key={item.label} className="space-y-2.5 group cursor-default">
                                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.15em]">
                                        <span className="text-gray-500 group-hover:text-gray-900 transition-colors">{item.label}</span>
                                        <span className="text-gray-400">{item.count}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: total > 0 ? `${Math.max(5, (item.count / total) * 100)}%` : '0%' }}
                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                            className={`h-full ${item.color} shadow-sm`}
                                        />
                                    </div>
                                </div>
                            ))
                        })()}

                        <div className="mt-10 pt-8 border-t border-gray-200">
                            <div className="p-5 rounded-[1.5rem] bg-primary/5 border border-primary/10 group overflow-hidden relative">
                                <div className="relative z-10 flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-white text-primary flex items-center justify-center transition-transform group-hover:scale-110 duration-500 shadow-sm border border-primary/10">
                                        <Package className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Today's Activity</p>
                                        <p className="text-sm font-medium text-gray-900 mt-1">{stats.todayOrders} orders · {formatPrice(stats.todayRevenue)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
