'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ─── Image Upload ────────────────────────────────────────────────────────────
// Uploads a single product image via server-side Supabase client.
// Receives a FormData with a 'file' field.

export async function uploadProductImage(
    formData: FormData
): Promise<{ url?: string; error?: string }> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated. Please log in again.' }

    const file = formData.get('file') as File
    if (!file || file.size === 0) return { error: 'No file provided' }

    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filePath = `${Date.now()}-${Math.random().toString(36).substring(7)}-${sanitizedName}`

    const { error } = await supabase.storage
        .from('products')
        .upload(filePath, file, { cacheControl: '3600', upsert: false })

    if (error) return { error: `Upload "${file.name}" failed: ${error.message}` }

    const { data } = supabase.storage.from('products').getPublicUrl(filePath)
    return { url: data.publicUrl }
}

// ─── Create Product ──────────────────────────────────────────────────────────

export async function createProductAction(
    productData: Record<string, unknown>
): Promise<{ data?: Record<string, unknown>; error?: string; code?: string }> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated. Please log in again.' }

    const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select(`*, category:categories(name)`)
        .single()

    if (error) return { error: error.message, code: error.code }

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

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated. Please log in again.' }

    const { data, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id)
        .select(`*, category:categories(name)`)
        .single()

    if (error) return { error: error.message, code: error.code }

    // Refresh SSR cache for public pages
    revalidatePath('/')
    revalidatePath('/shop')
    revalidatePath(`/product/${id}`)

    return { data }
}

// ─── Delete Product ──────────────────────────────────────────────────────────

export async function deleteProductAction(
    id: string
): Promise<{ error?: string; code?: string }> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated. Please log in again.' }

    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

    if (error) return { error: error.message, code: error.code }

    // Refresh SSR cache for public pages
    revalidatePath('/')
    revalidatePath('/shop')

    return {}
}
