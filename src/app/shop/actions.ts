'use server'

import { createAdminClient } from '@/lib/supabase/server'

export async function getShopProductsAction(): Promise<{ data: any[]; error?: string }> {
    const adminClient = createAdminClient()
    const { data, error } = await adminClient
        .from('products')
        .select('*, category:categories(id, name, slug)')
        .eq('status', 'active')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('[getShopProductsAction] error:', error)
        return { data: [], error: error.message }
    }
    return { data: data || [] }
}

export async function getActiveProductsForPopupAction(): Promise<{ data: any[]; error?: string }> {
    const adminClient = createAdminClient()
    const { data, error } = await adminClient
        .from('products')
        .select('id, name, images')
        .eq('status', 'active')
        .limit(20)

    if (error) {
        console.error('[getActiveProductsForPopupAction] error:', error)
        return { data: [], error: error.message }
    }
    return { data: data || [] }
}
