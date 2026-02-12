'use client'

import { usePathname } from "next/navigation"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { AdminHeader } from "@/components/admin/AdminHeader"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const isLoginPage = pathname === '/admin/login'

    if (isLoginPage) {
        return (
            <div className="min-h-screen w-full bg-[#050505] text-white">
                {children}
            </div>
        )
    }

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full bg-[#050505] text-white">
                <AdminSidebar />
                <SidebarInset className="flex flex-col flex-1 overflow-hidden bg-transparent">
                    <AdminHeader />
                    <main className="flex-1 overflow-y-auto p-6 md:p-8 relative scrollbar-none">
                        {/* Background Decor */}
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(195,157,64,0.03),transparent_50%)] pointer-events-none" />

                        <div className="max-w-[1600px] mx-auto relative z-10">
                            {children}
                        </div>
                    </main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    )
}
