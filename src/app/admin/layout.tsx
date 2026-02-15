'use client'

import { usePathname } from "next/navigation"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { AdminHeader } from "@/components/admin/AdminHeader"
import { AdminNotificationProvider } from "@/contexts/AdminNotificationContext"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const isLoginPage = pathname === '/admin/login'

    if (isLoginPage) {
        return (
            <div className="min-h-screen w-full bg-[#fafafa] text-gray-900">
                {children}
            </div>
        )
    }

    return (
        <AdminNotificationProvider>
            <SidebarProvider>
                <div className="flex min-h-screen w-full bg-[#fafafa] text-gray-900">
                    <AdminSidebar />
                    <SidebarInset className="flex flex-col flex-1 overflow-hidden bg-transparent">
                        <AdminHeader />
                        <main className="flex-1 overflow-y-auto p-6 md:p-8 relative scrollbar-none">
                            {/* Background Decor */}
                            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(195,157,64,0.05),transparent_50%)] pointer-events-none" />

                            <div className="max-w-[1600px] mx-auto relative z-10">
                                {children}
                            </div>
                        </main>
                    </SidebarInset>
                </div>
            </SidebarProvider>
        </AdminNotificationProvider>
    )
}
