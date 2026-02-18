'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { SupabaseClient } from '@supabase/supabase-js'

async function verifyAdminUser(supabase: SupabaseClient): Promise<{ error?: string }> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated. Please log in again.' }
    const adminEmail = process.env.ADMIN_EMAIL
    if (adminEmail && user.email !== adminEmail) return { error: 'Not authorized. Admin access required.' }
    return {}
}

// ─── Image Upload ────────────────────────────────────────────────────────────
// Verify admin via session client, then upload using admin client (bypasses RLS).

export async function uploadProductImage(
    formData: FormData
): Promise<{ url?: string; error?: string }> {
    // 1. Verify admin identity using session-based client
    const sessionClient = await createClient()
    const authCheck = await verifyAdminUser(sessionClient)
    if (authCheck.error) return { error: authCheck.error }

    const file = formData.get('file') as File
    if (!file || file.size === 0) {
        console.error('[uploadProductImage] No file provided or file is empty')
        return { error: 'No file provided' }
    }

    // 2. Use admin client for storage upload (bypasses bucket RLS policies)
    const adminClient = createAdminClient()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filePath = `${Date.now()}-${Math.random().toString(36).substring(7)}-${sanitizedName}`

    const { error } = await adminClient.storage
        .from('products')
        .upload(filePath, file, { cacheControl: '3600', upsert: false })

    if (error) {
        console.error(`[uploadProductImage] Upload failed for ${file.name}:`, error)
        return { error: `Upload "${file.name}" failed: ${error.message}` }
    }

    const { data } = adminClient.storage.from('products').getPublicUrl(filePath)
    return { url: data.publicUrl }
}

// ─── Create Product ──────────────────────────────────────────────────────────

export async function createProductAction(
    productData: Record<string, unknown>
): Promise<{ data?: Record<string, unknown>; error?: string; code?: string }> {
    const sessionClient = await createClient()
    const authCheck = await verifyAdminUser(sessionClient)
    if (authCheck.error) return { error: authCheck.error }

    const adminClient = createAdminClient()
    const { data, error } = await adminClient
        .from('products')
        .insert(productData)
        .select(`*, category:categories(name)`)
        .single()

    if (error) {
        console.error('[createProductAction] Supabase error:', error)
        return { error: error.message, code: error.code }
    }

    revalidatePath('/')
    revalidatePath('/shop')

    return { data }
}

// ─── Update Product ──────────────────────────────────────────────────────────

export async function updateProductAction(
    id: string,
    updateData: Record<string, unknown>
): Promise<{ data?: Record<string, unknown>; error?: string; code?: string }> {
    const sessionClient = await createClient()
    const authCheck = await verifyAdminUser(sessionClient)
    if (authCheck.error) return { error: authCheck.error }

    const adminClient = createAdminClient()
    const { data, error } = await adminClient
        .from('products')
        .update(updateData)
        .eq('id', id)
        .select(`*, category:categories(name)`)
        .single()

    if (error) {
        console.error(`[updateProductAction] Supabase error for ${id}:`, error)
        return { error: error.message, code: error.code }
    }

    if (!data) {
        return { error: 'Product not found. It may have been deleted.' }
    }

    revalidatePath('/')
    revalidatePath('/shop')
    revalidatePath(`/product/${id}`)

    return { data }
}

// ─── Read Products (admin) ───────────────────────────────────────────────────

export async function getProductsAction(): Promise<{ data: Record<string, unknown>[]; error?: string }> {
    const sessionClient = await createClient()
    const authCheck = await verifyAdminUser(sessionClient)
    if (authCheck.error) return { data: [], error: authCheck.error }

    const adminClient = createAdminClient()
    const { data, error } = await adminClient
        .from('products')
        .select('*, category:categories(id, name)')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('[getProductsAction] Supabase error:', error)
        return { data: [], error: error.message }
    }

    return { data: data || [] }
}

// ─── Read Categories (for product form dropdown) ────────────────────────────

export async function getCategoriesForProductsAction(): Promise<{ data: Record<string, unknown>[]; error?: string }> {
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
        console.error('[getCategoriesForProductsAction] Supabase error:', error)
        return { data: [], error: error.message }
    }

    return { data: data || [] }
}

// ─── Delete Product ──────────────────────────────────────────────────────────

export async function deleteProductAction(
    id: string
): Promise<{ error?: string; code?: string }> {
    const sessionClient = await createClient()
    const authCheck = await verifyAdminUser(sessionClient)
    if (authCheck.error) return { error: authCheck.error }

    const adminClient = createAdminClient()
    const { error, count } = await adminClient
        .from('products')
        .delete({ count: 'exact' })
        .eq('id', id)

    if (error) {
        console.error(`[deleteProductAction] Supabase error for ${id}:`, error)
        return { error: error.message, code: error.code }
    }

    if (count === 0) {
        return { error: 'Product not found or already deleted.' }
    }

    revalidatePath('/')
    revalidatePath('/shop')

    return {}
}
