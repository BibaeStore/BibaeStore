'use server'

import { createClient } from '@/lib/supabase/server'
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
// Uploads a single product image via server-side Supabase client.
// Receives a FormData with a 'file' field.

export async function uploadProductImage(
    formData: FormData
): Promise<{ url?: string; error?: string }> {
    const supabase = await createClient()

    const authCheck = await verifyAdminUser(supabase)
    if (authCheck.error) return { error: authCheck.error }

    const file = formData.get('file') as File
    if (!file || file.size === 0) {
        console.error('[uploadProductImage] No file provided or file is empty')
        return { error: 'No file provided' }
    }

    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filePath = `${Date.now()}-${Math.random().toString(36).substring(7)}-${sanitizedName}`

    const { error } = await supabase.storage
        .from('products')
        .upload(filePath, file, { cacheControl: '3600', upsert: false })

    if (error) {
        console.error(`[uploadProductImage] Upload failed for ${file.name}:`, error)
        return { error: `Upload "${file.name}" failed: ${error.message}` }
    }

    const { data } = supabase.storage.from('products').getPublicUrl(filePath)
    return { url: data.publicUrl }
}

// ─── Create Product ──────────────────────────────────────────────────────────

export async function createProductAction(
    productData: Record<string, unknown>
): Promise<{ data?: Record<string, unknown>; error?: string; code?: string }> {
    const supabase = await createClient()

    const authCheck = await verifyAdminUser(supabase)
    if (authCheck.error) return { error: authCheck.error }

    const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select(`*, category:categories(name)`)
        .single()

    if (error) {
        console.error('[createProductAction] Supabase error:', error)
        return { error: error.message, code: error.code }
    }

    // Refresh SSR cache for public pages
    revalidatePath('/')
    revalidatePath('/shop')

    return { data }
}

// ─── Update Product ──────────────────────────────────────────────────────────

export async function updateProductAction(
    id: string,
    updateData: Record<string, unknown>
): Promise<{ data?: Record<string, unknown>; error?: string; code?: string }> {
    const supabase = await createClient()

    const authCheck = await verifyAdminUser(supabase)
    if (authCheck.error) return { error: authCheck.error }

    const { data, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id)
        .select(`*, category:categories(name)`)

    if (error) {
        console.error(`[updateProductAction] Supabase error for ${id}:`, error)
        return { error: error.message, code: error.code }
    }

    if (!data || data.length === 0) {
        console.error(`[updateProductAction] Product with ID ${id} not found for update`)
        return { error: 'Product not found. It may have been deleted.' }
    }

    const updatedProduct = data[0]

    // Refresh SSR cache for public pages
    revalidatePath('/')
    revalidatePath('/shop')
    revalidatePath(`/product/${id}`)

    return { data: updatedProduct }
}

// ─── Delete Product ──────────────────────────────────────────────────────────

export async function deleteProductAction(
    id: string
): Promise<{ error?: string; code?: string }> {
    const supabase = await createClient()

    const authCheck = await verifyAdminUser(supabase)
    if (authCheck.error) return { error: authCheck.error }

    const { error, count } = await supabase
        .from('products')
        .delete({ count: 'exact' })
        .eq('id', id)

    if (error) {
        console.error(`[deleteProductAction] Supabase error for ${id}:`, error)
        return { error: error.message, code: error.code }
    }

    if (count === 0) {
        console.error(`[deleteProductAction] No product found with ID ${id} to delete`)
        return { error: 'Product not found or already deleted.' }
    }

    // Refresh SSR cache for public pages
    revalidatePath('/')
    revalidatePath('/shop')

    return {}
}
