'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateOrderAction(
    id: string,
    updateData: Record<string, any>
): Promise<{ data?: any; error?: string }> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Not authenticated' }
    }

    console.log(`[updateOrderAction] Updating order ${id}:`, JSON.stringify(updateData))

    const { data, error } = await supabase
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
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Not authenticated' }
    }

    console.log(`[deleteOrderAction] Deleting order ${id}`)

    const { error } = await supabase
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
