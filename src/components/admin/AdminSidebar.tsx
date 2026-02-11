'use client'

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    ShoppingBag,
    Users,
    Package,
    Settings,
    LogOut,
    BarChart3,
    Bell,
    MessageSquare,
    Gift,
    ChevronRight
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
} from "@/components/ui/sidebar"

const logo = '/assets/logo.png'

const menuItems = [
    {
        title: "Dashboard",
        icon: LayoutDashboard,
        href: "/admin",
    },
    {
        title: "Orders",
        icon: ShoppingBag,
        href: "/admin/orders",
        badge: "12",
    },
    {
        title: "Products",
        icon: Package,
        href: "/admin/products",
    },
    {
        title: "Customers",
        icon: Users,
        href: "/admin/customers",
    },
    {
        title: "Marketing",
        icon: Gift,
        href: "/admin/marketing",
    },
    {
        title: "Analytics",
        icon: BarChart3,
        href: "/admin/analytics",
    },
]

export function AdminSidebar() {
    const pathname = usePathname()

    return (
        <Sidebar className="border-r border-border bg-sidebar shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
            <SidebarHeader className="h-20 flex items-center px-6">
                <Link href="/" className="flex items-center group">
                    <div className="relative">
                        <img src={logo} alt="Bibae Store" className="h-9 w-auto transition-transform duration-300 group-hover:scale-105" />
                    </div>
                    <div className="ml-3 flex flex-col">
                        <span className="font-heading font-bold text-xl tracking-tight text-foreground leading-none">Bibae</span>
                        <span className="text-[10px] text-primary font-bold uppercase tracking-widest mt-1">Admin Panel</span>
                    </div>
                </Link>
            </SidebarHeader>
            <SidebarSeparator className="mx-6 opacity-50" />
            <SidebarContent className="px-3 pt-6">
                <SidebarMenu className="gap-1.5">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isActive}
                                    className={`relative flex items-center gap-3.5 px-4 py-6 rounded-xl transition-all duration-300 group ${isActive
                                            ? "bg-foreground text-background shadow-lg shadow-foreground/10"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                        }`}
                                >
                                    <Link href={item.href}>
                                        <div className={`p-1.5 rounded-lg transition-colors ${isActive ? "bg-primary text-primary-foreground" : "bg-muted group-hover:bg-background"}`}>
                                            <item.icon className="w-4.5 h-4.5" strokeWidth={isActive ? 2.5 : 2} />
                                        </div>
                                        <span className={`text-[14px] font-body tracking-wide transition-all ${isActive ? "font-semibold translate-x-0.5" : "font-medium"}`}>
                                            {item.title}
                                        </span>
                                        {item.badge && (
                                            <span className="ml-auto bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full ring-2 ring-background border-2 border-primary/20">
                                                {item.badge}
                                            </span>
                                        )}
                                        {/* Dynamic accent line for active item */}
                                        {isActive && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-primary rounded-r-full" />
                                        )}
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )
                    })}
                </SidebarMenu>

                <div className="mt-10 px-4">
                    <h3 className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 font-bold mb-6">Tools & Support</h3>
                    <SidebarMenu className="gap-1.5">
                        <SidebarMenuItem>
                            <SidebarMenuButton className="text-muted-foreground hover:bg-muted hover:text-foreground px-4 py-5 gap-3.5 group rounded-xl">
                                <div className="p-1.5 rounded-lg bg-muted group-hover:bg-background transition-colors">
                                    <MessageSquare className="w-4.5 h-4.5" />
                                </div>
                                <span className="text-[14px] font-body font-medium">Messages</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton className="text-muted-foreground hover:bg-muted hover:text-foreground px-4 py-5 gap-3.5 group rounded-xl">
                                <div className="p-1.5 rounded-lg bg-muted group-hover:bg-background transition-colors">
                                    <Bell className="w-4.5 h-4.5" />
                                </div>
                                <span className="text-[14px] font-body font-medium">Notifications</span>
                                <div className="ml-auto w-2 h-2 bg-primary rounded-full ring-4 ring-primary/10"></div>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </div>
            </SidebarContent>

            <SidebarFooter className="p-6">
                <div className="bg-muted/40 p-4 rounded-2xl border border-border/50">
                    <SidebarMenu className="gap-1.5">
                        <SidebarMenuItem>
                            <SidebarMenuButton className="text-muted-foreground hover:bg-muted hover:text-foreground px-3 py-4 gap-3 group rounded-lg">
                                <Settings className="w-4.5 h-4.5" />
                                <span className="text-sm font-body font-medium">Settings</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                asChild
                                className="text-destructive hover:bg-destructive/10 hover:text-destructive px-3 py-4 gap-3 rounded-lg"
                            >
                                <Link href="/login">
                                    <LogOut className="w-4.5 h-4.5" />
                                    <span className="text-sm font-body font-medium">Logout</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </div>
            </SidebarFooter>
        </Sidebar>
    )
}
