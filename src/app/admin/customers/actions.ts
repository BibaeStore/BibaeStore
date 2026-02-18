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

// ─── Read Customers ──────────────────────────────────────────────────────────

export async function getCustomersAction(): Promise<{ data: any[]; error?: string }> {
    const sessionClient = await createClient()
    const authCheck = await verifyAdminUser(sessionClient)
    if (authCheck.error) return { data: [], error: authCheck.error }

    const adminClient = createAdminClient()
    const { data, error } = await adminClient
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('[getCustomersAction] Supabase error:', error)
        return { data: [], error: error.message }
    }

    return { data: data || [] }
}

// ─── Update Customer ─────────────────────────────────────────────────────────

export async function updateCustomerAction(
    id: string,
    updateData: { full_name?: string; phone_number?: string }
): Promise<{ data?: any; error?: string }> {
    const sessionClient = await createClient()
    const authCheck = await verifyAdminUser(sessionClient)
    if (authCheck.error) return { error: authCheck.error }

    const adminClient = createAdminClient()
    const { data, error } = await adminClient
        .from('clients')
        .update({
            ...updateData,
            updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

    if (error) {
        console.error(`[updateCustomerAction] error for ${id}:`, error)
        return { error: error.message }
    }

    revalidatePath('/admin/customers')
    return { data }
}

// ─── Delete Customer ─────────────────────────────────────────────────────────

export async function deleteCustomerAction(
    id: string
): Promise<{ error?: string }> {
    const sessionClient = await createClient()
    const authCheck = await verifyAdminUser(sessionClient)
    if (authCheck.error) return { error: authCheck.error }

    const adminClient = createAdminClient()
    const { error } = await adminClient
        .from('clients')
        .delete()
        .eq('id', id)

    if (error) {
        console.error(`[deleteCustomerAction] error for ${id}:`, error)
        return { error: error.message }
    }

    revalidatePath('/admin/customers')
    return {}
}
