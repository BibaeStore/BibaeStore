'use server'

import { createAdminClient } from '@/lib/supabase/server'

export async function getOrderSuccessDetailsAction(
    orderId: string
): Promise<{ data?: any; error?: string }> {
    const adminClient = createAdminClient()
    const { data, error } = await adminClient
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single()

    if (error) {
        console.error('[getOrderSuccessDetailsAction] error:', error)
        return { error: error.message }
    }
    return { data }
}
