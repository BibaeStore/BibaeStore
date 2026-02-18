'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function submitRatingAction(ratingData: {
    product_id: string
    client_id: string
    rating: number
    comment?: string
}): Promise<{ data?: any; error?: string }> {
    const sessionClient = await createClient()
    const { data: { user } } = await sessionClient.auth.getUser()
    if (!user || user.id !== ratingData.client_id) return { error: 'Not authenticated' }

    const adminClient = createAdminClient()
    const { data, error } = await adminClient
        .from('ratings')
        .upsert(ratingData, { onConflict: 'client_id, product_id' })
        .select()
        .single()

    if (error) {
        console.error('[submitRatingAction] error:', error)
        return { error: error.message }
    }
    return { data }
}

export async function getRatingsAction(
    productId: string
): Promise<{ data: any[]; error?: string }> {
    const adminClient = createAdminClient()
    const { data, error } = await adminClient
        .from('ratings')
        .select('*, client:clients(full_name, profile_image_url)')
        .eq('product_id', productId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('[getRatingsAction] error:', error)
        return { data: [], error: error.message }
    }
    return { data: data || [] }
}
