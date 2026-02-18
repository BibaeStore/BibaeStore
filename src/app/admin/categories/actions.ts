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

// ─── Read Categories ─────────────────────────────────────────────────────────

export async function getCategoriesAction(): Promise<{ data: any[]; error?: string }> {
    const sessionClient = await createClient()
    const authCheck = await verifyAdminUser(sessionClient)
    if (authCheck.error) return { data: [], error: authCheck.error }

    const adminClient = createAdminClient()
    const { data, error } = await adminClient
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('name')

    if (error) {
        console.error('[getCategoriesAction] Supabase error:', error)
        return { data: [], error: error.message }
    }

    return { data: data || [] }
}

// ─── Create Category ─────────────────────────────────────────────────────────

export async function createCategoryAction(
    categoryData: { name: string; parent_id: string | null; image_url: string | null; status: string; sort_order: number }
): Promise<{ data?: any; error?: string }> {
    const sessionClient = await createClient()
    const authCheck = await verifyAdminUser(sessionClient)
    if (authCheck.error) return { error: authCheck.error }

    const adminClient = createAdminClient()
    const { data, error } = await adminClient
        .from('categories')
        .insert([{
            name: categoryData.name,
            parent_id: categoryData.parent_id || null,
            image_url: categoryData.image_url,
            status: categoryData.status,
            sort_order: categoryData.sort_order || 0
        }])
        .select()
        .single()

    if (error) {
        console.error('[createCategoryAction] Supabase error:', error)
        return { error: error.message }
    }

    revalidatePath('/admin/categories')
    return { data }
}

// ─── Update Category ─────────────────────────────────────────────────────────

export async function updateCategoryAction(
    id: string,
    categoryData: { name?: string; parent_id?: string | null; image_url?: string | null; status?: string; sort_order?: number }
): Promise<{ data?: any; error?: string }> {
    const sessionClient = await createClient()
    const authCheck = await verifyAdminUser(sessionClient)
    if (authCheck.error) return { error: authCheck.error }

    const adminClient = createAdminClient()
    const updateData: any = {
        name: categoryData.name,
        parent_id: categoryData.parent_id || null,
        status: categoryData.status,
        sort_order: categoryData.sort_order
    }
    if (categoryData.image_url !== undefined) updateData.image_url = categoryData.image_url

    const { data, error } = await adminClient
        .from('categories')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

    if (error) {
        console.error(`[updateCategoryAction] error for ${id}:`, error)
        return { error: error.message }
    }

    revalidatePath('/admin/categories')
    return { data }
}

// ─── Delete Category ─────────────────────────────────────────────────────────

export async function deleteCategoryAction(
    id: string
): Promise<{ error?: string }> {
    const sessionClient = await createClient()
    const authCheck = await verifyAdminUser(sessionClient)
    if (authCheck.error) return { error: authCheck.error }

    const adminClient = createAdminClient()
    const { error } = await adminClient
        .from('categories')
        .delete()
        .eq('id', id)

    if (error) {
        console.error(`[deleteCategoryAction] error for ${id}:`, error)
        return { error: error.message }
    }

    revalidatePath('/admin/categories')
    return {}
}

// ─── Upload Category Image ───────────────────────────────────────────────────

export async function uploadCategoryImageAction(
    formData: FormData
): Promise<{ url?: string; error?: string }> {
    const sessionClient = await createClient()
    const authCheck = await verifyAdminUser(sessionClient)
    if (authCheck.error) return { error: authCheck.error }

    const file = formData.get('file') as File
    if (!file || file.size === 0) {
        return { error: 'No file provided' }
    }

    const adminClient = createAdminClient()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filePath = `${Date.now()}-${sanitizedName}`

    const { error } = await adminClient.storage
        .from('categories')
        .upload(filePath, file, { cacheControl: '3600', upsert: false })

    if (error) {
        console.error('[uploadCategoryImageAction] Upload failed:', error)
        return { error: `Upload failed: ${error.message}` }
    }

    const { data } = adminClient.storage.from('categories').getPublicUrl(filePath)
    return { url: data.publicUrl }
}
