'use server'

import { createAdminClient } from '@/lib/supabase/server'

export async function getOrderByTrackingAction(
    trackingNumber: string
): Promise<{ data?: any; error?: string }> {
    const adminClient = createAdminClient()
    const { data, error } = await adminClient
        .from('orders')
        .select('*')
        .eq('tracking_number', trackingNumber)
        .single()

    if (error) {
        if (error.code === 'PGRST116') return { data: null }
        console.error('[getOrderByTrackingAction] error:', error)
        return { error: error.message }
    }
    return { data }
}
