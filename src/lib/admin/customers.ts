import { createClient } from '@/lib/supabase/server'
import { logAdminAction } from '@/lib/admin/logger'

// ─── Customers / Clients ───────────────────────────────────────────────────

export async function getCustomersService() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        throw new Error(`[Database Error] Failed to fetch customers: ${error.message}`)
    }

    return data || []
}

export async function updateCustomerService(id: string, updateData: { full_name?: string; phone_number?: string }) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('clients')
        .update({
            ...updateData,
            updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

    if (error) {
        throw new Error(`[Database Error] Failed to update customer: ${error.message}`)
    }

    if (!data) {
        throw new Error('Customer not found or access denied by RLS policy.')
    }

    await logAdminAction('UPDATE', 'CLIENT', id, { updatedFields: updateData })

    return data
}

export async function deleteCustomerService(id: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id)

    if (error) {
        throw new Error(`[Database Error] Failed to delete customer: ${error.message}`)
    }

    await logAdminAction('DELETE', 'CLIENT', id)

    return true
}
