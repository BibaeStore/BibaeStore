'use server'

import { requireAdmin } from '@/lib/auth'
import { isRedirectError } from '@/lib/utils'
import { revalidatePath } from 'next/cache'
import {
    getCustomersService,
    updateCustomerService,
    deleteCustomerService
} from '@/lib/admin/customers'

// ─── Thin Server Actions ──────────────────────────────────────────────────

export async function getCustomersAction(): Promise<{ data: any[]; error?: string }> {
    try {
        await requireAdmin()

        const data = await getCustomersService()
        return { data }
    } catch (error) {
        if (isRedirectError(error)) throw error;
        return { data: [], error: error instanceof Error ? error.message : "Fetch failed" }
    }
}

export async function updateCustomerAction(
    id: string,
    updateData: { full_name?: string; phone_number?: string }
): Promise<{ data?: any; error?: string }> {
    try {
        await requireAdmin()

        const data = await updateCustomerService(id, updateData)

        revalidatePath('/admin/customers')
        return { data }
    } catch (error) {
        return { error: error instanceof Error ? error.message : "Update failed" }
    }
}

export async function deleteCustomerAction(
    id: string
): Promise<{ error?: string }> {
    try {
        await requireAdmin()

        await deleteCustomerService(id)

        revalidatePath('/admin/customers')
        return {}
    } catch (error) {
        return { error: error instanceof Error ? error.message : "Deletion failed" }
    }
}
