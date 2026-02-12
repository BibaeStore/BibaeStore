'use client'

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    LayoutDashboard,
    ShoppingBag,
    Users,
    Package,
    Layers,
    BarChart3,
    Gift,
    Settings,
    LogOut
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

const logo = '/assets/icon.png'

const mainMenuItems = [
    { title: "Dashboard", icon: LayoutDashboard, href: "/admin" },
    { title: "Orders", icon: ShoppingBag, href: "/admin/orders", badge: "12" },
    { title: "Products", icon: Package, href: "/admin/products" },
    { title: "Categories", icon: Layers, href: "/admin/categories" },
    { title: "Customers", icon: Users, href: "/admin/customers" },
    { title: "Marketing", icon: Gift, href: "/admin/marketing" },
    { title: "Analytics", icon: BarChart3, href: "/admin/analytics" },
]



export function AdminSidebar() {
    const pathname = usePathname()
    const [hoveredItem, setHoveredItem] = React.useState<string | null>(null)

    return (
        <Sidebar collapsible="icon" className="border-r border-white/5 bg-[#050505] text-white">
            {/* Header - Brand Logo */}
            <SidebarHeader className="py-8 flex items-center justify-between border-b border-white/5 px-8 relative overflow-hidden group-data-[collapsible=icon]:px-2 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
                <Link href="/admin" className="flex items-center gap-4 group relative z-10 w-full overflow-hidden">
                    <div className="relative shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 flex items-center justify-center overflow-hidden transition-all border-primary/30 from-primary/10 shadow-lg shadow-black/20">
                        <img
                            src={logo}
                            alt="Bibae"
                            className="h-8 w-auto brightness-0 invert transition-transform group-hover:scale-110 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent opacity-100 transition-opacity" />
                    </div>
                    <div className="flex flex-col group-data-[collapsible=icon]:hidden transition-opacity duration-200">
                        <span className="text-2xl font-heading font-bold text-white tracking-wide leading-none">
                            BibaeStore
                        </span>
                    </div>
                </Link>
            </SidebarHeader>

            <SidebarContent className="px-3 py-6 overflow-y-auto overflow-x-hidden scrollbar-none font-body">
                {/* Main Navigation */}
                <SidebarMenu className="gap-1.5">
                    {mainMenuItems.map((item) => {
                        const isActive = item.href === '/admin' ? pathname === '/admin' : (pathname === item.href || pathname.startsWith(item.href + '/'))
                        const isHovered = hoveredItem === item.title

                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isActive}
                                    onMouseEnter={() => setHoveredItem(item.title)}
                                    onMouseLeave={() => setHoveredItem(null)}
                                    tooltip={item.title}
                                    className={`relative h-12 px-4 rounded-2xl transition-all duration-300 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2 ${isActive
                                        ? "bg-primary text-primary-foreground shadow-xl   font-bold "
                                        : "text-white/50 hover:text-white hover:bg-primary/10 hover:bg-white/[0.04]"
                                        }`}
                                >
                                    <Link href={item.href} className="flex items-center w-full">
                                        <item.icon className={`w-5 h-5 transition-transform duration-300 ${isHovered || isActive ? 'scale-110' : ''}`} />

                                        <span className="ml-3 text-sm tracking-wide group-data-[collapsible=icon]:hidden transition-all duration-300">
                                            {item.title}
                                        </span>

                                        {item.badge && !isActive && (
                                            <span className="ml-auto bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full border border-primary/20 group-data-[collapsible=icon]:hidden">
                                                {item.badge}
                                            </span>
                                        )}

                                        {/* Active Indicator Glow */}
                                        {isActive && (
                                            <div className="absolute right-2 w-1.5 h-1.5 bg-primary rounded-full group-data-[collapsible=icon]:hidden" />
                                        )}
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )
                    })}
                </SidebarMenu>
            </SidebarContent>

            {/* Footer */}
            <SidebarFooter className="p-3 border-t border-white/5 bg-[#030303]/50 backdrop-blur-md relative overflow-hidden font-body group-data-[collapsible=icon]:p-2">
                <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />

                <div className="flex items-center gap-3 p-2 rounded-xl mb-2 relative z-10 transition-colors hover:bg-white/[0.03] group-data-[collapsible=icon]:justify-center">
                    <div className="relative shrink-0">
                        <Avatar className="w-9 h-9 border border-white/10 shadow-inner">
                            <AvatarImage src="/admin-avatar.jpg" />
                            <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">DK</AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#050505]" />
                    </div>
                    <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden transition-all duration-200">
                        <p className="text-sm font-medium text-white truncate">Dilawar Khan</p>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Super Admin</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 relative z-10 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:flex-col">
                    <button className="flex items-center justify-center h-9 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all border border-white/5 hover:border-white/10" title="Settings">
                        <Settings className="w-4 h-4" />
                    </button>
                    <Link
                        href="/admin/login"
                        className="flex items-center justify-center h-9 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all border border-red-500/20 hover:border-red-500/30"
                        title="Logout"
                    >
                        <LogOut className="w-4 h-4" />
                    </Link>
                </div>
            </SidebarFooter>
        </Sidebar>
    )
}
