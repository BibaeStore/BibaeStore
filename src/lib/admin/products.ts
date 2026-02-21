import { createClient } from '@/lib/supabase/server'
import { logAdminAction } from '@/lib/admin/logger'

// ─── Products ──────────────────────────────────────────────────────────────

export async function createProductService(productData: Record<string, unknown>) {
    // 1. We no longer use createAdminClient() here
    // We use the regular createClient() which passes the authenticated admin's cookies
    // meaning this query is now securely bounded by Postgres RLS Policies.
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select(`*, category:categories(name)`)
        .single()

    if (error) {
        throw new Error(`[Database Error] Failed to create product: ${error.message}`)
    }

    await logAdminAction('CREATE', 'PRODUCT', data.id, { productDetails: data })

    return data
}

export async function updateProductService(id: string, updateData: Record<string, unknown>) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id)
        .select(`*, category:categories(name)`)
        .single()

    if (error) {
        throw new Error(`[Database Error] Failed to update product: ${error.message}`)
    }

    if (!data) {
        throw new Error('Product not found or access denied by RLS policy.')
    }

    await logAdminAction('UPDATE', 'PRODUCT', id, { updatedFields: updateData })

    return data
}

export async function getProductsService() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(id, name)')
        .order('created_at', { ascending: false })

    if (error) {
        throw new Error(`[Database Error] Failed to fetch products: ${error.message}`)
    }

    return data || []
}

export async function deleteProductService(id: string) {
    const supabase = await createClient()

    const { error, count } = await supabase
        .from('products')
        .delete({ count: 'exact' })
        .eq('id', id)

    if (error) {
        throw new Error(`[Database Error] Failed to delete product: ${error.message}`)
    }

    if (count === 0) {
        throw new Error('Product not found or access denied by RLS policy.')
    }

    await logAdminAction('DELETE', 'PRODUCT', id)

    return true
}

export async function uploadProductImageService(file: File) {
    if (!file || file.size === 0) {
        throw new Error('No file provided')
    }

    const supabase = await createClient()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filePath = `${Date.now()}-${Math.random().toString(36).substring(7)}-${sanitizedName}`

    // Ensure the bucket policy allows admins to upload images
    const { error } = await supabase.storage
        .from('products')
        .upload(filePath, file, { cacheControl: '3600', upsert: false })

    if (error) {
        throw new Error(`[Storage Error] Upload failed: ${error.message}`)
    }

    const { data } = supabase.storage.from('products').getPublicUrl(filePath)
    return data.publicUrl
}
