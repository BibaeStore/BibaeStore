'use client'

import * as React from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
    LayoutDashboard,
    ShoppingBag,
    Users,
    Package,
    Layers,
    BarChart3,
    Gift,
    Settings,
    LogOut,
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const logo = '/habiba-minhas-logo.jpeg'

const baseMenuItems = [
    { title: "Dashboard", icon: LayoutDashboard, href: "/admin" },
    { title: "Orders", icon: ShoppingBag, href: "/admin/orders", badgeKey: "orders" },
    { title: "Products", icon: Package, href: "/admin/products" },
    { title: "Categories", icon: Layers, href: "/admin/categories" },
    { title: "Customers", icon: Users, href: "/admin/customers" },
    { title: "Marketing", icon: Gift, href: "/admin/marketing" },
    { title: "Analytics", icon: BarChart3, href: "/admin/analytics" },
]



export function AdminSidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()
    const [hoveredItem, setHoveredItem] = React.useState<string | null>(null)

    const handleLogout = async () => {
        try {
            await supabase.removeAllChannels()
            const { error } = await supabase.auth.signOut()
            if (error) throw error
            window.location.href = '/admin/login'
        } catch (error) {
            console.error('Error logging out:', error)
        }
    }

    return (
        <Sidebar
            collapsible="icon"
            className="border-r border-gray-300 bg-white text-gray-900 shadow-md z-30"
            style={{
                "--sidebar-background": "0 0% 100%",
                "--sidebar-foreground": "0 0% 0%",
                "--sidebar-primary": "43 76% 65%",
                "--sidebar-primary-foreground": "0 0% 0%",
                "--sidebar-accent": "40 20% 96%",
                "--sidebar-accent-foreground": "0 0% 0%",
                "--sidebar-border": "40 20% 90%",
                "--sidebar-ring": "43 76% 65%",
            } as React.CSSProperties}
        >
            {/* Header - Brand Logo */}
            <SidebarHeader className="py-8 flex items-center justify-between border-b border-gray-100 px-8 relative overflow-hidden group-data-[collapsible=icon]:px-2 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
                <Link href="/admin" className="flex items-center gap-4 group relative z-10 w-full overflow-hidden">
                    <div className="relative shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 flex items-center justify-center overflow-hidden transition-all group-hover:border-primary/30 group-hover:from-primary/5 shadow-md shadow-gray-200/50">
                        <img
                            src={logo}
                            alt="Habiba Minhas"
                            className="h-8 w-auto transition-transform group-hover:scale-110 drop-shadow-sm"
                        />
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex flex-col group-data-[collapsible=icon]:hidden transition-opacity duration-200">
                        <span className="text-2xl font-heading font-bold text-gray-900 tracking-wide leading-none">
                            habibaminhas
                        </span>
                    </div>
                </Link>
            </SidebarHeader>

            <SidebarContent className="px-3 py-6 overflow-y-auto overflow-x-hidden scrollbar-none font-body">
                {/* Main Navigation */}
                <SidebarMenu className="gap-1.5">
                    {baseMenuItems.map((item) => {
                        const isActive = item.href === '/admin' ? pathname === '/admin' : (pathname === item.href || pathname.startsWith(item.href + '/'))
                        const isHovered = hoveredItem === item.title
                        const badge = undefined

                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isActive}
                                    onMouseEnter={() => setHoveredItem(item.title)}
                                    onMouseLeave={() => setHoveredItem(null)}
                                    tooltip={item.title}
                                    className={`relative h-12 px-4 rounded-2xl transition-all duration-300 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2 overflow-hidden ${isActive
                                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 font-bold ring-1 ring-primary/50"
                                        : "bg-white text-gray-600 border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 hover:text-gray-900 hover:bg-gray-50"
                                        }`}
                                >
                                    <Link href={item.href} className="flex items-center w-full">
                                        <item.icon className={`w-5 h-5 transition-transform duration-300 ${isHovered || isActive ? 'scale-110' : ''}`} />

                                        <span className="ml-3 text-sm tracking-wide group-data-[collapsible=icon]:hidden transition-all duration-300">
                                            {item.title}
                                        </span>

                                        {badge && !isActive && (
                                            <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse group-data-[collapsible=icon]:hidden">
                                                {badge}
                                            </span>
                                        )}

                                        {isActive && (
                                            <div className="absolute right-2 w-1.5 h-1.5 bg-white/40 rounded-full group-data-[collapsible=icon]:hidden" />
                                        )}
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )
                    })}
                </SidebarMenu>
            </SidebarContent>

            {/* Footer */}
            <SidebarFooter className="p-3 border-t border-gray-100 bg-gray-50/50 backdrop-blur-md relative overflow-hidden font-body group-data-[collapsible=icon]:p-2">
                <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />

                <div className="flex items-center gap-3 p-2 rounded-xl mb-2 relative z-10 transition-colors hover:bg-white group-data-[collapsible=icon]:justify-center">
                    <div className="relative shrink-0">
                        <Avatar className="w-9 h-9 border border-white shadow-sm">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">BS</AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
                    </div>
                    <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden transition-all duration-200">
                        <p className="text-sm font-medium text-gray-900 truncate">Habiba Minhas</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Super Admin</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 relative z-10 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:flex-col">
                    <button className="flex items-center justify-center h-9 rounded-lg bg-white border border-gray-200 text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-all shadow-sm" title="Settings">
                        <Settings className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center h-9 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-all border border-red-100 hover:border-red-200 shadow-sm"
                        title="Logout"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </SidebarFooter>
        </Sidebar>
    )
}
