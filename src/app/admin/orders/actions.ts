'use server'

import { requireAdmin } from '@/lib/auth'
import { isRedirectError } from '@/lib/utils'
import { revalidatePath, revalidateTag } from 'next/cache'
import {
    getOrdersService,
    getOrderDetailsService,
    updateOrderService,
    updateOrderStatusService,
    updatePaymentStatusService,
    addAdminNoteService,
    approveCancellationService,
    deleteOrderService
} from '@/lib/admin/orders'

// ─── Thin Server Actions ──────────────────────────────────────────────────

export async function getOrdersAction(): Promise<{ data: any[]; error?: string }> {
    try {
        await requireAdmin()
        const data = await getOrdersService()
        return { data }
    } catch (error) {
        if (isRedirectError(error)) throw error;
        return { data: [], error: error instanceof Error ? error.message : "Fetch failed" }
    }
}

export async function getOrderDetailsAction(
    id: string
): Promise<{ data?: any; error?: string }> {
    try {
        await requireAdmin()
        const data = await getOrderDetailsService(id)
        return { data }
    } catch (error) {
        if (isRedirectError(error)) throw error;
        return { error: error instanceof Error ? error.message : "Fetch failed" }
    }
}

export async function updateOrderAction(
    id: string,
    updateData: Record<string, any>
): Promise<{ data?: any; error?: string }> {
    try {
        await requireAdmin()
        const data = await updateOrderService(id, updateData)

        revalidatePath('/admin/orders')
        return { data }
    } catch (error) {
        if (isRedirectError(error)) throw error;
        return { error: error instanceof Error ? error.message : "Update failed" }
    }
}

export async function updateOrderStatusAction(
    orderId: string,
    status: string,
    note?: string
): Promise<{ error?: string }> {
    try {
        await requireAdmin()
        await updateOrderStatusService(orderId, status, note)

        revalidatePath('/admin/orders')
        revalidatePath('/admin') // Ensures dashboard stats refresh
        return {}
    } catch (error) {
        if (isRedirectError(error)) throw error;
        return { error: error instanceof Error ? error.message : "Status update failed" }
    }
}

export async function updatePaymentStatusAction(
    orderId: string,
    paymentStatus: string,
    orderStatus?: string
): Promise<{ error?: string }> {
    try {
        await requireAdmin()
        await updatePaymentStatusService(orderId, paymentStatus, orderStatus)

        revalidatePath('/admin/orders')
        revalidatePath('/admin')
        return {}
    } catch (error) {
        if (isRedirectError(error)) throw error;
        return { error: error instanceof Error ? error.message : "Payment update failed" }
    }
}

export async function addAdminNoteAction(
    orderId: string,
    note: string
): Promise<{ error?: string }> {
    try {
        await requireAdmin()
        await addAdminNoteService(orderId, note)

        revalidatePath('/admin/orders')
        return {}
    } catch (error) {
        if (isRedirectError(error)) throw error;
        return { error: error instanceof Error ? error.message : "Failed to add note" }
    }
}

export async function approveCancellationAction(
    orderId: string
): Promise<{ error?: string }> {
    try {
        await requireAdmin()
        await approveCancellationService(orderId)

        revalidatePath('/admin/orders')
        revalidatePath('/admin/products') // Since stock is restored
        revalidatePath('/shop')
        return {}
    } catch (error) {
        if (isRedirectError(error)) throw error;
        return { error: error instanceof Error ? error.message : "Cancellation failed" }
    }
}

export async function deleteOrderAction(
    id: string
): Promise<{ error?: string }> {
    try {
        await requireAdmin()
        await deleteOrderService(id)

        revalidatePath('/admin/orders')
        revalidatePath('/admin')
        return {}
    } catch (error) {
        if (isRedirectError(error)) throw error;
        return { error: error instanceof Error ? error.message : "Deletion failed" }
    }
}
