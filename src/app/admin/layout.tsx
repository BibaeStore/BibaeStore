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
    // Escape hatch for the login page without requiring invasive folder restructuring.
    // This allows /admin/login to render without triggering the redirect loop.
    const reqHeaders = await headers()
    const pathname = reqHeaders.get("x-invoke-path") || reqHeaders.get("x-middleware-invoke-path") || reqHeaders.get("referer") || ""

    if (pathname.includes('/admin/login')) {
        return (
            <div className="min-h-screen w-full bg-[#fafafa] text-gray-900 font-body admin-font-reset">
                {children}
            </div>
        )
    }

    // 1. Server-side session validation.
    try {
        await requireAdmin()
    } catch (error: any) {
        if (error.message === 'UNAUTHENTICATED') {
            const { redirect } = await import('next/navigation')
            redirect('/admin/login')
        }
        throw error // Pass other errors (like no admin role) to error.tsx
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
