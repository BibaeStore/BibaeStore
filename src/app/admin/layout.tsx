import { headers } from "next/headers"
import { requireAdmin } from "@/lib/auth"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { AdminHeader } from "@/components/admin/AdminHeader"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // 1. Server-side session validation.
    try {
        await requireAdmin()
    } catch (error: any) {
        // If unauthenticated or no admin role, render the plain layout wrapper.
        // Middleware already protects /admin sub-routes, so reaching here unauthenticated
        // means the user is legitimately on /admin/login.
        return (
            <div className="min-h-screen w-full bg-[#fafafa] text-gray-900 font-body admin-font-reset">
                {children}
            </div>
        )
    }

    // 2. Authenticated layout rendering
    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full bg-[#fafafa] text-gray-900 font-body admin-font-reset">
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
    )
}
