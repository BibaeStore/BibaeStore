'use client'

import { useState, useEffect, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { AdminHeader } from "@/components/admin/AdminHeader"
import { AdminNotificationProvider } from "@/contexts/AdminNotificationContext"
import { createClient } from "@/lib/supabase/client"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const supabaseRef = useRef(createClient())

    // Check if current page is login page
    const isLoginPage = pathname?.includes('/admin/login') || false

    useEffect(() => {
        const supabase = supabaseRef.current
        const checkAuth = async () => {
            try {
                // Use getSession instead of getUser - it's cached and doesn't hit API
                const { data: { session }, error } = await supabase.auth.getSession()

                if (error) {
                    // Handle rate limit errors gracefully
                    if (error.status === 429) {
                        console.warn('Rate limit reached, retrying in 2s...')
                        setTimeout(checkAuth, 2000)
                        return
                    }
                    throw error
                }

                setIsAuthenticated(!!session?.user)

                // Only redirect if not authenticated AND not already on login page
                if (!session?.user && !pathname?.includes('/admin/login')) {
                    router.push('/admin/login')
                }
            } catch (error) {
                console.error('Auth check error:', error)
            } finally {
                setIsLoading(false)
            }
        }

        checkAuth()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsAuthenticated(!!session?.user)
            // Only redirect if not authenticated AND not already on login page
            if (!session?.user && !pathname?.includes('/admin/login')) {
                router.push('/admin/login')
            }
        })

        return () => subscription.unsubscribe()
    }, [router, pathname])

    // While checking auth, show nothing or a small loader for non-login pages
    if (isLoading && !isLoginPage) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-[#fafafa]">
                <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
        )
    }

    if (isLoginPage) {
        return (
            <div className="min-h-screen w-full bg-[#fafafa] text-gray-900 font-body admin-font-reset">
                {children}
            </div>
        )
    }

    // If not authenticated and not on login page, don't render sidebar yet (handled by early return/redirect)
    if (!isAuthenticated) return null

    return (
        <AdminNotificationProvider>
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
        </AdminNotificationProvider>
    )
}
