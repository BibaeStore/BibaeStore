'use server'

import { createAdminClient } from '@/lib/supabase/server'

export async function getCartAction(
    clientId: string
): Promise<{ data: any[]; error?: string }> {
    const adminClient = createAdminClient()
    const { data, error } = await adminClient
        .from('cart')
        .select('*, product:products(*)')
        .eq('client_id', clientId)

    if (error) {
        console.error('[getCartAction] error:', error)
        return { data: [], error: error.message }
    }
    return { data: data || [] }
}

export async function addToCartAction(
    clientId: string,
    productId: string,
    quantity: number = 1
): Promise<{ data?: any; error?: string }> {
    const adminClient = createAdminClient()
    const { data, error } = await adminClient
        .from('cart')
        .upsert({
            client_id: clientId,
            product_id: productId,
            quantity
        }, { onConflict: 'client_id, product_id' })
        .select()
        .single()

    if (error) {
        console.error('[addToCartAction] error:', error)
        return { error: error.message }
    }
    return { data }
}

export async function removeFromCartAction(
    clientId: string,
    productId: string
): Promise<{ error?: string }> {
    const adminClient = createAdminClient()
    const { error } = await adminClient
        .from('cart')
        .delete()
        .eq('client_id', clientId)
        .eq('product_id', productId)

    if (error) {
        console.error('[removeFromCartAction] error:', error)
        return { error: error.message }
    }
    return {}
}

export async function updateCartQuantityAction(
    clientId: string,
    productId: string,
    quantity: number
): Promise<{ data?: any; error?: string }> {
    if (quantity <= 0) {
        return removeFromCartAction(clientId, productId)
    }

    const adminClient = createAdminClient()
    const { data, error } = await adminClient
        .from('cart')
        .update({ quantity })
        .eq('client_id', clientId)
        .eq('product_id', productId)
        .select()
        .single()

    if (error) {
        console.error('[updateCartQuantityAction] error:', error)
        return { error: error.message }
    }
    return { data }
}

export async function clearCartAction(
    clientId: string
): Promise<{ error?: string }> {
    const adminClient = createAdminClient()
    const { error } = await adminClient
        .from('cart')
        .delete()
        .eq('client_id', clientId)

    if (error) {
        console.error('[clearCartAction] error:', error)
        return { error: error.message }
    }
    return {}
}
