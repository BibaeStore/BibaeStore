'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/products'
import { toast } from 'sonner'

interface AdminNotificationContextType {
    newOrderCount: number
    resetCount: () => void
    lastNewOrderId: string | null
}

const AdminNotificationContext = createContext<AdminNotificationContextType>({
    newOrderCount: 0,
    resetCount: () => {},
    lastNewOrderId: null,
})

export const useAdminNotifications = () => useContext(AdminNotificationContext)

export function AdminNotificationProvider({ children }: { children: React.ReactNode }) {
    const [newOrderCount, setNewOrderCount] = useState(0)
    const [lastNewOrderId, setLastNewOrderId] = useState<string | null>(null)
    const audioRef = useRef<HTMLAudioElement | null>(null)

    useEffect(() => {
        const supabase = createClient()
        const channel = supabase
            .channel('admin-notifications')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'orders'
            }, (payload) => {
                setNewOrderCount(prev => prev + 1)
                setLastNewOrderId(payload.new.id as string)

                toast.success('New order received!', {
                    description: `Order #${(payload.new.id as string)?.slice(0, 8).toUpperCase()} - ${formatPrice(payload.new.total_amount)}`,
                    duration: 8000,
                })

                try {
                    audioRef.current?.play().catch(() => {})
                } catch {}
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const resetCount = useCallback(() => {
        setNewOrderCount(0)
    }, [])

    return (
        <AdminNotificationContext.Provider value={{ newOrderCount, resetCount, lastNewOrderId }}>
            {/* Hidden audio element for notification sound */}
            <audio ref={audioRef} preload="auto">
                <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbsGczIjmW2e7QeTkjQKPi8s1hKiM9lN7w0XQsHC+Gz+vXfzcnSaTh8tF0LBkrnfPRdCwZK53z0XQsGSud89F0LBkrg==" type="audio/wav" />
            </audio>
            {children}
        </AdminNotificationContext.Provider>
    )
}
