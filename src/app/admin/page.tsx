'use client'

import { motion } from 'framer-motion'
import {
    TrendingUp,
    Users,
    ShoppingBag,
    DollarSign,
    ArrowUpRight,
    ArrowDownRight,
    Package,
    Clock,
    Calendar,
    Filter
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const stats = [
    {
        title: "Total Revenue",
        value: "Rs. 1.28M",
        change: "+12.5%",
        trend: "up",
        icon: DollarSign,
        color: "text-emerald-600",
        bg: "bg-emerald-100/50"
    },
    {
        title: "Active Orders",
        value: "156",
        change: "+8.2%",
        trend: "up",
        icon: ShoppingBag,
        color: "text-primary",
        bg: "bg-primary/10"
    },
    {
        title: "Total Customers",
        value: "2,420",
        change: "+18.7%",
        trend: "up",
        icon: Users,
        color: "text-blue-600",
        bg: "bg-blue-100/50"
    },
    {
        title: "Avg. Order",
        value: "Rs. 8.5K",
        change: "-2.4%",
        trend: "down",
        icon: TrendingUp,
        color: "text-amber-600",
        bg: "bg-amber-100/50"
    },
]

const recentOrders = [
    { id: "#ORD-7421", customer: "Amna Khan", date: "2 mins ago", amount: "Rs. 12,500", status: "Processing" },
    { id: "#ORD-7420", customer: "Zoya Ahmed", date: "15 mins ago", amount: "Rs. 8,200", status: "Shipped" },
    { id: "#ORD-7419", customer: "Sana Malik", date: "1 hour ago", amount: "Rs. 15,000", status: "Delivered" },
    { id: "#ORD-7418", customer: "Hiba Ali", date: "3 hours ago", amount: "Rs. 5,400", status: "Pending" },
]

export default function AdminDashboard() {
    return (
        <div className="space-y-10 pb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1.5">
                    <h1 className="text-3xl font-heading font-bold text-gray-900 tracking-tight">Executive Dashboard</h1>
                    <p className="text-gray-500 font-body text-sm uppercase tracking-[0.1em]">Bibaé Boutique Intelligence Overview</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-11 border-gray-200 bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-2xl px-6 text-xs uppercase tracking-widest transition-all shadow-sm">
                        <Calendar className="w-4 h-4 mr-2" /> Last 30 Days
                    </Button>
                    <Button className="h-11 bg-gray-900 hover:bg-gray-800 text-white border border-primary/50 hover:border-primary font-bold rounded-2xl px-6 text-xs uppercase tracking-widest shadow-sm hover:shadow-md transition-all">
                        Create Product
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {stats.map((stat, i) => (
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
                                <div className={`flex items-center text-xs font-bold px-2.5 py-1 rounded-full ${stat.trend === 'up' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                    {stat.change}
                                    {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3 ml-0.5" /> : <ArrowDownRight className="w-3 h-3 ml-0.5" />}
                                </div>
                            </div>
                            <div className="mt-6 space-y-1">
                                <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold">{stat.title}</p>
                                <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{stat.value}</h3>
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
                        <Button variant="ghost" className="text-primary hover:bg-primary/5 h-10 px-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all">Explore All</Button>
                    </CardHeader>
                    <CardContent className="px-8 pb-8">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold border-b border-gray-200">
                                        <th className="py-5">Serial</th>
                                        <th className="py-5">Client</th>
                                        <th className="py-5">Valuation</th>
                                        <th className="py-5 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {recentOrders.map((order) => (
                                        <tr key={order.id} className="border-b border-gray-200 hover:bg-gray-50/50 transition-colors group cursor-pointer">
                                            <td className="py-5 font-mono text-gray-500 group-hover:text-primary transition-colors">{order.id}</td>
                                            <td className="py-5">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-900">{order.customer}</span>
                                                    <span className="text-[10px] text-gray-400 flex items-center gap-1.5 mt-1 font-bold"><Clock className="w-3 h-3" /> {order.date}</span>
                                                </div>
                                            </td>
                                            <td className="py-5 font-bold text-gray-900">{order.amount}</td>
                                            <td className="py-5 text-right">
                                                <span className={`inline-flex px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-[0.1em] ${order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' :
                                                    order.status === 'Processing' ? 'bg-primary/10 text-primary' :
                                                        order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-gray-100 text-gray-500'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Inventory Summary */}
                <Card className="bg-white border-gray-200 rounded-[2.5rem] shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="px-8 pt-8 pb-4">
                        <div className="space-y-1.5">
                            <CardTitle className="font-heading text-xl text-gray-900">Stock Analytics</CardTitle>
                            <CardDescription className="text-gray-400 text-xs uppercase tracking-widest font-bold">Category Distribution</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="px-8 pb-8 space-y-7">
                        {[
                            { label: "Ladies Stitched", value: 85, color: "bg-primary" },
                            { label: "Kids Collection", value: 62, color: "bg-blue-500" },
                            { label: "Baby Products", value: 45, color: "bg-emerald-500" },
                            { label: "Unstitched Fabric", value: 28, color: "bg-rose-500" },
                        ].map((item) => (
                            <div key={item.label} className="space-y-2.5 group cursor-default">
                                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.15em]">
                                    <span className="text-gray-500 group-hover:text-gray-900 transition-colors">{item.label}</span>
                                    <span className="text-gray-400">{item.value}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${item.value}%` }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        className={`h-full ${item.color} shadow-sm`}
                                    />
                                </div>
                            </div>
                        ))}

                        <div className="mt-10 pt-8 border-t border-gray-200">
                            <div className="p-5 rounded-[1.5rem] bg-red-50 border border-red-100 group overflow-hidden relative">
                                <div className="relative z-10 flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-white text-red-500 flex items-center justify-center transition-transform group-hover:scale-110 duration-500 shadow-sm border border-red-100">
                                        <Package className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-500">Alert Status</p>
                                        <p className="text-sm font-medium text-gray-900 mt-1">12 items low stock</p>
                                    </div>
                                </div>
                                <div className="absolute top-0 right-0 p-2 opacity-10">
                                    <Package className="w-16 h-16 text-red-500" />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
