'use client'

import { useState, useEffect, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { AdminHeader } from "@/components/admin/AdminHeader"
import { AdminNotificationProvider } from "@/contexts/AdminNotificationContext"
import { createClient } from "@/lib/supabase/client"
import type { SupabaseClient } from "@supabase/supabase-js"

type AuthState = 'loading' | 'authenticated' | 'unauthenticated'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const router = useRouter()
    const [authState, setAuthState] = useState<AuthState>('loading')
    // Single stable client instance — never recreate it
    const supabaseRef = useRef<SupabaseClient | null>(null)

    const isLoginPage = pathname?.includes('/admin/login') || false

    if (!supabaseRef.current) {
        supabaseRef.current = createClient()
    }

    useEffect(() => {
        const supabase = supabaseRef.current!
        let isMounted = true

        const checkAuth = async () => {
            try {
                // getSession is cached — does NOT hit the network on every call
                const { data: { session }, error } = await supabase.auth.getSession()

                if (!isMounted) return

                if (error) {
                    console.error('[AdminLayout] Auth session error:', error.message)
                    setAuthState('unauthenticated')
                    return
                }

                if (session?.user) {
                    setAuthState('authenticated')
                } else {
                    setAuthState('unauthenticated')
                    if (!isLoginPage) {
                        router.replace('/admin/login')
                        // Fallback: if Next.js router doesn't navigate within 3s, hard redirect
                        setTimeout(() => {
                            if (typeof window !== 'undefined' && !window.location.pathname.includes('/admin/login')) {
                                window.location.href = '/admin/login'
                            }
                        }, 3000)
                    }
                }
            } catch (err) {
                console.error('[AdminLayout] Auth check failed:', err)
                if (isMounted) {
                    setAuthState('unauthenticated')
                    if (!isLoginPage) {
                        router.replace('/admin/login')
                        setTimeout(() => {
                            if (typeof window !== 'undefined' && !window.location.pathname.includes('/admin/login')) {
                                window.location.href = '/admin/login'
                            }
                        }, 3000)
                    }
                }
            }
        }

        checkAuth()

        // Listen for auth state changes (login/logout events)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!isMounted) return
            if (session?.user) {
                setAuthState('authenticated')
            } else {
                setAuthState('unauthenticated')
                if (!isLoginPage) {
                    router.replace('/admin/login')
                    setTimeout(() => {
                        if (typeof window !== 'undefined' && !window.location.pathname.includes('/admin/login')) {
                            window.location.href = '/admin/login'
                        }
                    }, 3000)
                }
            }
        })

        return () => {
            isMounted = false
            subscription.unsubscribe()
        }
        // Only re-run when the page changes (login vs non-login)
    }, [isLoginPage])

    // ── Login page: always render without auth check ──────────────────────────
    if (isLoginPage) {
        return (
            <div className="min-h-screen w-full bg-[#fafafa] text-gray-900 font-body admin-font-reset">
                {children}
            </div>
        )
    }

    // ── Loading state: show spinner ────────────────────────────────────────────
    if (authState === 'loading') {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-[#fafafa]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <p className="text-sm text-gray-400 font-body">Verifying session…</p>
                </div>
            </div>
        )
    }

    // ── Not authenticated: show redirecting state (redirect is already triggered) ──
    if (authState === 'unauthenticated') {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-[#fafafa]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <p className="text-sm text-gray-400 font-body">Redirecting to login…</p>
                </div>
            </div>
        )
    }

    // ── Authenticated: render full admin shell ─────────────────────────────────
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
