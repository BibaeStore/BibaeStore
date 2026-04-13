'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function getMyOrdersAction(): Promise<{
    data: any[]
    userId?: string
    error?: string
}> {
    const sessionClient = await createClient()
    const { data: { user } } = await sessionClient.auth.getUser()
    if (!user) return { data: [], error: 'Not authenticated' }

    const adminClient = createAdminClient()
    const { data, error } = await adminClient
        .from('orders')
        .select('*, items:order_items(*, product:products(name, images))')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('[getMyOrdersAction] error:', error)
        return { data: [], error: error.message }
    }
    return { data: data || [], userId: user.id }
}

export async function requestCancellationAction(
    orderId: string,
    reason: string
): Promise<{ error?: string }> {
    const sessionClient = await createClient()
    const { data: { user } } = await sessionClient.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const adminClient = createAdminClient()

    // Verify order belongs to user
    const { data: order, error: selectError } = await adminClient
        .from('orders')
        .select('client_id, status_history')
        .eq('id', orderId)
        .single()

    if (selectError) return { error: `Cannot read order: ${selectError.message}` }
    if (order.client_id !== user.id) return { error: 'Not authorized' }

    const currentHistory: any[] = order?.status_history || []
    const newEntry = {
        status: 'cancellation_requested',
        timestamp: new Date().toISOString(),
        note: `Cancellation requested: ${reason}`
    }

    const { error } = await adminClient
        .from('orders')
        .update({
            cancellation_requested: true,
            cancellation_reason: reason,
            status_history: [...currentHistory, newEntry],
            updated_at: new Date().toISOString()
        })
        .eq('id', orderId)

    if (error) return { error: error.message }
    return {}
}
