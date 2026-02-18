'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/products'
import { toast } from 'sonner'
import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js'

interface AdminNotificationContextType {
    newOrderCount: number
    resetCount: () => void
    lastNewOrderId: string | null
}

const AdminNotificationContext = createContext<AdminNotificationContextType>({
    newOrderCount: 0,
    resetCount: () => { },
    lastNewOrderId: null,
})

export const useAdminNotifications = () => useContext(AdminNotificationContext)

export function AdminNotificationProvider({ children }: { children: React.ReactNode }) {
    const [newOrderCount, setNewOrderCount] = useState(0)
    const [lastNewOrderId, setLastNewOrderId] = useState<string | null>(null)
    // Keep a single stable client instance for the lifetime of this provider
    const supabaseRef = useRef<SupabaseClient | null>(null)
    const channelRef = useRef<RealtimeChannel | null>(null)
    const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const retryCountRef = useRef(0)
    const isMountedRef = useRef(true)

    useEffect(() => {
        isMountedRef.current = true

        // Create a single client instance — never recreate it
        if (!supabaseRef.current) {
            supabaseRef.current = createClient()
        }
        const supabase = supabaseRef.current

        const setupChannel = () => {
            // Remove any existing channel before creating a new one
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current)
                channelRef.current = null
            }

            const channel = supabase
                .channel('admin-order-notifications', {
                    config: { broadcast: { self: false } }
                })
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'orders'
                }, (payload) => {
                    if (!isMountedRef.current) return
                    setNewOrderCount(prev => prev + 1)
                    setLastNewOrderId(payload.new.id as string)

                    toast.success('New order received!', {
                        description: `Order #${(payload.new.id as string)?.slice(0, 8).toUpperCase()} — ${formatPrice(payload.new.total_amount)}`,
                        duration: 8000,
                    })
                })
                .subscribe((status, err) => {
                    if (!isMountedRef.current) return

                    if (status === 'SUBSCRIBED') {
                        retryCountRef.current = 0
                        console.log('[AdminNotifications] Realtime connected')
                    } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                        retryCountRef.current += 1
                        const backoffMs = Math.min(10000 * Math.pow(2, retryCountRef.current - 1), 120000)
                        console.warn(`[AdminNotifications] Channel error, retrying in ${backoffMs / 1000}s... (attempt ${retryCountRef.current})`, err)
                        if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current)
                        retryTimeoutRef.current = setTimeout(() => {
                            if (isMountedRef.current) setupChannel()
                        }, backoffMs)
                    } else if (status === 'CLOSED') {
                        console.log('[AdminNotifications] Channel closed')
                    }
                })

            channelRef.current = channel
        }

        setupChannel()

        return () => {
            isMountedRef.current = false
            if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current)
            if (channelRef.current && supabaseRef.current) {
                supabaseRef.current.removeChannel(channelRef.current)
                channelRef.current = null
            }
        }
    }, []) // Empty deps — only run once on mount

    const resetCount = useCallback(() => {
        setNewOrderCount(0)
    }, [])

    return (
        <AdminNotificationContext.Provider value={{ newOrderCount, resetCount, lastNewOrderId }}>
            {children}
        </AdminNotificationContext.Provider>
    )
}
