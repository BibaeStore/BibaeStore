'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { SupabaseClient } from '@supabase/supabase-js'

async function verifyAdminUser(supabase: SupabaseClient): Promise<{ error?: string }> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }
    const adminEmail = process.env.ADMIN_EMAIL
    if (adminEmail && user.email !== adminEmail) return { error: 'Not authorized' }
    return {}
}

export async function updateOrderAction(
    id: string,
    updateData: Record<string, any>
): Promise<{ data?: any; error?: string }> {
    const sessionClient = await createClient()
    const authCheck = await verifyAdminUser(sessionClient)
    if (authCheck.error) return { error: authCheck.error }

    const adminClient = createAdminClient()
    const { data, error } = await adminClient
        .from('orders')
        .update(updateData)
        .eq('id', id)
        .select(`*, client:clients(full_name, email, phone_number)`)
        .single()

    if (error) {
        console.error(`[updateOrderAction] error:`, error)
        return { error: error.message }
    }

    revalidatePath('/admin/orders')
    return { data }
}

// ─── Read Orders (admin) ─────────────────────────────────────────────────────

export async function getOrdersAction(): Promise<{ data: any[]; error?: string }> {
    const sessionClient = await createClient()
    const authCheck = await verifyAdminUser(sessionClient)
    if (authCheck.error) return { data: [], error: authCheck.error }

    const adminClient = createAdminClient()
    const { data, error } = await adminClient
        .from('orders')
        .select('*, client:clients(full_name, email, phone_number), items:order_items(*, product:products(name, images))')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('[getOrdersAction] Supabase error:', error)
        return { data: [], error: error.message }
    }

    return { data: data || [] }
}

// ─── Get Order Details ───────────────────────────────────────────────────────

export async function getOrderDetailsAction(
    id: string
): Promise<{ data?: any; error?: string }> {
    const sessionClient = await createClient()
    const authCheck = await verifyAdminUser(sessionClient)
    if (authCheck.error) return { error: authCheck.error }

    const adminClient = createAdminClient()
    const { data, error } = await adminClient
        .from('orders')
        .select('*, items:order_items(*, product:products(*)), client:clients(full_name, email, phone_number)')
        .eq('id', id)
        .single()

    if (error) {
        console.error(`[getOrderDetailsAction] error for ${id}:`, error)
        return { error: error.message }
    }

    return { data }
}

// ─── Update Order Status (with history) ──────────────────────────────────────

export async function updateOrderStatusAction(
    orderId: string,
    status: string,
    note?: string
): Promise<{ error?: string }> {
    const sessionClient = await createClient()
    const authCheck = await verifyAdminUser(sessionClient)
    if (authCheck.error) return { error: authCheck.error }

    const adminClient = createAdminClient()

    // Get current order (for status history and stock restoration on cancel)
    const { data: order, error: selectError } = await adminClient
        .from('orders')
        .select('status, status_history, items:order_items(*)')
        .eq('id', orderId)
        .single()

    if (selectError) {
        console.error('[updateOrderStatusAction] select error:', selectError)
        return { error: `Cannot read order: ${selectError.message}` }
    }

    // If cancelling, restore stock
    if (status === 'cancelled' && order.status !== 'cancelled' && order.items) {
        for (const item of order.items) {
            await restoreSizeStock(adminClient, item.product_id, item.size || 'Standard', item.quantity)
        }
    }

    const currentHistory: any[] = order?.status_history || []
    const newEntry = {
        status,
        timestamp: new Date().toISOString(),
        note: note || `Status changed to ${status}`
    }

    const { error } = await adminClient
        .from('orders')
        .update({
            status,
            status_history: [...currentHistory, newEntry],
            updated_at: new Date().toISOString()
        })
        .eq('id', orderId)

    if (error) {
        console.error('[updateOrderStatusAction] update error:', error)
        return { error: `Status update failed: ${error.message}` }
    }

    revalidatePath('/admin/orders')
    return {}
}

// ─── Update Payment Status ───────────────────────────────────────────────────

export async function updatePaymentStatusAction(
    orderId: string,
    paymentStatus: string,
    orderStatus?: string
): Promise<{ error?: string }> {
    const sessionClient = await createClient()
    const authCheck = await verifyAdminUser(sessionClient)
    if (authCheck.error) return { error: authCheck.error }

    const adminClient = createAdminClient()

    const { data: order, error: selectError } = await adminClient
        .from('orders')
        .select('status_history')
        .eq('id', orderId)
        .single()

    if (selectError) {
        console.error('[updatePaymentStatusAction] select error:', selectError)
        return { error: `Cannot read order: ${selectError.message}` }
    }

    const currentHistory: any[] = order?.status_history || []
    const newEntry = {
        status: orderStatus || paymentStatus,
        timestamp: new Date().toISOString(),
        note: paymentStatus === 'verified' ? 'Payment verified by admin'
            : paymentStatus === 'rejected' ? 'Payment rejected by admin'
            : `Payment status: ${paymentStatus}`
    }

    const updateData: any = {
        payment_status: paymentStatus,
        status_history: [...currentHistory, newEntry],
        updated_at: new Date().toISOString()
    }
    if (orderStatus) updateData.status = orderStatus

    const { error } = await adminClient
        .from('orders')
        .update(updateData)
        .eq('id', orderId)

    if (error) {
        console.error('[updatePaymentStatusAction] update error:', error)
        return { error: `Payment update failed: ${error.message}` }
    }

    revalidatePath('/admin/orders')
    return {}
}

// ─── Add Admin Note ──────────────────────────────────────────────────────────

export async function addAdminNoteAction(
    orderId: string,
    note: string
): Promise<{ error?: string }> {
    const sessionClient = await createClient()
    const authCheck = await verifyAdminUser(sessionClient)
    if (authCheck.error) return { error: authCheck.error }

    const adminClient = createAdminClient()
    const { error } = await adminClient
        .from('orders')
        .update({
            admin_notes: note,
            updated_at: new Date().toISOString()
        })
        .eq('id', orderId)

    if (error) {
        console.error(`[addAdminNoteAction] error for ${orderId}:`, error)
        return { error: error.message }
    }

    return {}
}

// ─── Approve Cancellation ────────────────────────────────────────────────────

export async function approveCancellationAction(
    orderId: string
): Promise<{ error?: string }> {
    const sessionClient = await createClient()
    const authCheck = await verifyAdminUser(sessionClient)
    if (authCheck.error) return { error: authCheck.error }

    const adminClient = createAdminClient()

    // First update status to cancelled with history
    const { data: order, error: selectError } = await adminClient
        .from('orders')
        .select('status, status_history, items:order_items(*)')
        .eq('id', orderId)
        .single()

    if (selectError) {
        return { error: `Cannot read order: ${selectError.message}` }
    }

    // Restore stock
    if (order.status !== 'cancelled' && order.items) {
        for (const item of order.items) {
            await restoreSizeStock(adminClient, item.product_id, item.size || 'Standard', item.quantity)
        }
    }

    const currentHistory: any[] = order?.status_history || []
    const newEntry = {
        status: 'cancelled',
        timestamp: new Date().toISOString(),
        note: 'Cancellation approved by admin'
    }

    const { error } = await adminClient
        .from('orders')
        .update({
            status: 'cancelled',
            cancellation_requested: false,
            status_history: [...currentHistory, newEntry],
            updated_at: new Date().toISOString()
        })
        .eq('id', orderId)

    if (error) {
        console.error(`[approveCancellationAction] error:`, error)
        return { error: error.message }
    }

    revalidatePath('/admin/orders')
    return {}
}

// ─── Stock restoration helper ────────────────────────────────────────────────

async function restoreSizeStock(adminClient: any, productId: string, size: string, quantity: number): Promise<void> {
    const { data: product } = await adminClient
        .from('products')
        .select('variants, stock')
        .eq('id', productId)
        .single()

    if (product?.variants?.sizes?.[size]) {
        const newStock = (product.variants.sizes[size].stock || 0) + quantity
        const updatedVariants = {
            ...product.variants,
            sizes: {
                ...product.variants.sizes,
                [size]: { ...product.variants.sizes[size], stock: newStock }
            }
        }
        const totalStock = Object.values(updatedVariants.sizes as Record<string, { stock: number }>)
            .reduce((sum: number, s) => sum + (s.stock || 0), 0)

        await adminClient
            .from('products')
            .update({ variants: updatedVariants, stock: totalStock })
            .eq('id', productId)
    } else {
        const newStock = (product?.stock || 0) + quantity
        await adminClient
            .from('products')
            .update({ stock: newStock })
            .eq('id', productId)
    }
}

// ─── Delete Order ────────────────────────────────────────────────────────────

export async function deleteOrderAction(
    id: string
): Promise<{ error?: string }> {
    const sessionClient = await createClient()
    const authCheck = await verifyAdminUser(sessionClient)
    if (authCheck.error) return { error: authCheck.error }

    const adminClient = createAdminClient()
    const { error } = await adminClient
        .from('orders')
        .delete()
        .eq('id', id)

    if (error) {
        console.error(`[deleteOrderAction] error:`, error)
        return { error: error.message }
    }

    revalidatePath('/admin/orders')
    return {}
}
