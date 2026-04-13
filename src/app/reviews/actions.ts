'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function submitStoreReviewAction(data: {
    name: string
    email?: string
    rating: number
    comment: string
}): Promise<{ success: boolean; error?: string }> {
    // Validate input
    if (!data.name?.trim() || !data.comment?.trim()) {
        return { success: false, error: 'Name and review are required.' }
    }
    if (data.rating < 1 || data.rating > 5) {
        return { success: false, error: 'Rating must be between 1 and 5.' }
    }

    const sessionClient = await createClient()
    const { data: { user } } = await sessionClient.auth.getUser()

    const adminClient = createAdminClient()
    const { error } = await adminClient
        .from('store_reviews')
        .insert({
            client_id: user?.id || null,
            name: data.name.trim(),
            email: data.email?.trim() || null,
            rating: data.rating,
            comment: data.comment.trim(),
            is_approved: false,
        })

    if (error) {
        console.error('[submitStoreReviewAction] error:', error)
        return { success: false, error: 'Failed to submit review. Please try again.' }
    }

    return { success: true }
}

export async function getApprovedStoreReviewsAction(): Promise<{
    data: any[]
    error?: string
}> {
    const adminClient = createAdminClient()
    const { data, error } = await adminClient
        .from('store_reviews')
        .select('id, name, rating, comment, created_at')
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(50)

    if (error) {
        console.error('[getApprovedStoreReviewsAction] error:', error)
        return { data: [], error: error.message }
    }

    return { data: data || [] }
}
