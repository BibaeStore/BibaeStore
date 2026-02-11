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
    Clock
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const stats = [
    {
        title: "Total Revenue",
        value: "Rs. 1,280,000",
        change: "+12.5%",
        trend: "up",
        icon: DollarSign,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10"
    },
    {
        title: "Active Orders",
        value: "156",
        change: "+8.2%",
        trend: "up",
        icon: ShoppingBag,
        color: "text-blue-500",
        bg: "bg-blue-500/10"
    },
    {
        title: "Total Customers",
        value: "2,420",
        change: "+18.7%",
        trend: "up",
        icon: Users,
        color: "text-primary",
        bg: "bg-primary/10"
    },
    {
        title: "Avg. Order Value",
        value: "Rs. 8,500",
        change: "-2.4%",
        trend: "down",
        icon: TrendingUp,
        color: "text-amber-500",
        bg: "bg-amber-500/10"
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
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold tracking-tight">Dashboard Overview</h1>
                    <p className="text-muted-foreground font-body mt-1">Welcome back, here is what's happening today.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="font-body uppercase tracking-wider text-xs">Download Report</Button>
                    <Button className="bg-foreground text-background hover:bg-primary hover:text-primary-foreground font-body uppercase tracking-wider text-xs">Create Product</Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between space-y-0 pb-2">
                                    <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
                                        <stat.icon className="w-5 h-5" />
                                    </div>
                                    <div className={`flex items-center text-xs font-semibold ${stat.trend === 'up' ? 'text-emerald-500' : 'text-destructive'}`}>
                                        {stat.change}
                                        {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3 ml-0.5" /> : <ArrowDownRight className="w-3 h-3 ml-0.5" />}
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">{stat.title}</p>
                                    <h3 className="text-2xl font-bold mt-1 tracking-tight">{stat.value}</h3>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Orders Table */}
                <Card className="lg:col-span-2 border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="font-heading text-xl">Recent Orders</CardTitle>
                            <CardDescription className="font-body">Manage your most recent store activity.</CardDescription>
                        </div>
                        <Button variant="ghost" className="text-primary h-8 text-xs font-body hover:bg-primary/5">View All</Button>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="border-b border-border">
                                    <tr className="text-xs uppercase tracking-widest text-muted-foreground font-bold">
                                        <th className="py-4 px-2">Order ID</th>
                                        <th className="py-4 px-2">Customer</th>
                                        <th className="py-4 px-2">Total</th>
                                        <th className="py-4 px-2 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm font-body">
                                    {recentOrders.map((order) => (
                                        <tr key={order.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors group">
                                            <td className="py-4 px-2 font-semibold text-foreground">{order.id}</td>
                                            <td className="py-4 px-2">
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{order.customer}</span>
                                                    <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3" /> {order.date}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-2 font-medium">{order.amount}</td>
                                            <td className="py-4 px-2 text-right">
                                                <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${order.status === 'Delivered' ? 'bg-emerald-500/10 text-emerald-600' :
                                                        order.status === 'Processing' ? 'bg-blue-500/10 text-blue-600' :
                                                            order.status === 'Shipped' ? 'bg-amber-500/10 text-amber-600' :
                                                                'bg-muted text-muted-foreground'
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
                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="font-heading text-xl">Inventory Status</CardTitle>
                        <CardDescription className="font-body">Stock levels for top categories.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {[
                            { label: "Ladies Stitched", value: 85, color: "bg-primary" },
                            { label: "Kids Collection", value: 62, color: "bg-blue-500" },
                            { label: "Baby Products", value: 45, color: "bg-amber-500" },
                            { label: "Unstitched Fabric", value: 28, color: "bg-rose-500" },
                        ].map((item) => (
                            <div key={item.label} className="space-y-2">
                                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                                    <span>{item.label}</span>
                                    <span className="text-muted-foreground">{item.value}%</span>
                                </div>
                                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${item.value}%` }}
                                        transition={{ duration: 1, delay: 0.5 }}
                                        className={`h-full ${item.color}`}
                                    />
                                </div>
                            </div>
                        ))}

                        <div className="mt-8 pt-6 border-t border-border">
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
                                <div className="w-10 h-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
                                    <Package className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-destructive">Low Stock Alert</p>
                                    <p className="text-sm font-medium mt-0.5">12 items need restocking soon</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
