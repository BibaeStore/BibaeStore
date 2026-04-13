import { createClient } from '@/lib/supabase/server'
import { logAdminAction } from '@/lib/admin/logger'

// ─── Orders ────────────────────────────────────────────────────────────────

export async function getOrdersService() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('orders')
        .select('*, items:order_items(*, product:products(name, images))')
        .order('created_at', { ascending: false })

    if (error) throw new Error(`[Database Error] Failed to fetch orders: ${error.message}`)

    return data || []
}

export async function getOrderDetailsService(id: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('orders')
        .select('*, items:order_items(*, product:products(*))')
        .eq('id', id)
        .single()

    if (error) throw new Error(`[Database Error] Failed to fetch order details: ${error.message}`)

    return data
}

export async function updateOrderService(id: string, updateData: Record<string, any>) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', id)
        .select(`*`)
        .single()

    if (error) throw new Error(`[Database Error] Failed to update order: ${error.message}`)
    if (!data) throw new Error(`Order not found or access denied.`)

    await logAdminAction('UPDATE', 'ORDER', id, { updatedFields: updateData })

    return data
}

export async function deleteOrderService(id: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id)

    if (error) throw new Error(`[Database Error] Failed to delete order: ${error.message}`)

    await logAdminAction('DELETE', 'ORDER', id)

    return true
}

export async function addAdminNoteService(orderId: string, note: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('orders')
        .update({
            admin_notes: note,
            updated_at: new Date().toISOString()
        })
        .eq('id', orderId)

    if (error) throw new Error(`[Database Error] Failed to add note: ${error.message}`)

    return true
}

// ─── Complex Interactions (Status, Payments, Cancellation) ─────────────────

export async function updateOrderStatusService(orderId: string, status: string, note?: string) {
    const supabase = await createClient()

    // Get current order
    const { data: order, error: selectError } = await supabase
        .from('orders')
        .select('status, status_history, items:order_items(*)')
        .eq('id', orderId)
        .single()

    if (selectError) throw new Error(`Cannot read order: ${selectError.message}`)

    // If cancelling, restore stock
    if (status === 'cancelled' && order.status !== 'cancelled' && order.items) {
        for (const item of order.items) {
            await restoreSizeStock(supabase, item.product_id, item.size || 'Standard', item.quantity)
        }
    }

    const currentHistory: any[] = order?.status_history || []
    const newEntry = {
        status,
        timestamp: new Date().toISOString(),
        note: note || `Status changed to ${status}`
    }

    const { error } = await supabase
        .from('orders')
        .update({
            status,
            status_history: [...currentHistory, newEntry],
            updated_at: new Date().toISOString()
        })
        .eq('id', orderId)

    if (error) throw new Error(`Status update failed: ${error.message}`)

    await logAdminAction('UPDATE', 'ORDER', orderId, { updatedStatus: status, note })

    return true
}

export async function updatePaymentStatusService(orderId: string, paymentStatus: string, orderStatus?: string) {
    const supabase = await createClient()

    const { data: order, error: selectError } = await supabase
        .from('orders')
        .select('status_history')
        .eq('id', orderId)
        .single()

    if (selectError) throw new Error(`Cannot read order: ${selectError.message}`)

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

    const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)

    if (error) throw new Error(`Payment update failed: ${error.message}`)

    await logAdminAction('UPDATE', 'ORDER', orderId, { paymentStatus, orderStatus })

    return true
}

export async function approveCancellationService(orderId: string) {
    const supabase = await createClient()

    // First update status to cancelled with history
    const { data: order, error: selectError } = await supabase
        .from('orders')
        .select('status, status_history, items:order_items(*)')
        .eq('id', orderId)
        .single()

    if (selectError) throw new Error(`Cannot read order: ${selectError.message}`)

    // Restore stock
    if (order.status !== 'cancelled' && order.items) {
        for (const item of order.items) {
            await restoreSizeStock(supabase, item.product_id, item.size || 'Standard', item.quantity)
        }
    }

    const currentHistory: any[] = order?.status_history || []
    const newEntry = {
        status: 'cancelled',
        timestamp: new Date().toISOString(),
        note: 'Cancellation approved by admin'
    }

    const { error } = await supabase
        .from('orders')
        .update({
            status: 'cancelled',
            cancellation_requested: false,
            status_history: [...currentHistory, newEntry],
            updated_at: new Date().toISOString()
        })
        .eq('id', orderId)

    if (error) throw new Error(`Failed to approve cancellation: ${error.message}`)

    await logAdminAction('APPROVE', 'ORDER', orderId, { action: 'Cancellation approved' })

    return true
}

// ─── Helpers ───────────────────────────────────────────────────────────────

async function restoreSizeStock(supabase: any, productId: string, size: string, quantity: number): Promise<void> {
    const { data: product } = await supabase
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

        await supabase
            .from('products')
            .update({ variants: updatedVariants, stock: totalStock })
            .eq('id', productId)
    } else {
        const newStock = (product?.stock || 0) + quantity
        await supabase
            .from('products')
            .update({ stock: newStock })
            .eq('id', productId)
    }
}
