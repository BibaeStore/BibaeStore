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
