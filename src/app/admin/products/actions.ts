'use server'

import { requireAdmin } from '@/lib/auth'
import { isRedirectError } from '@/lib/utils'
import { revalidatePath } from 'next/cache'
import {
    createProductService,
    updateProductService,
    getProductsService,
    deleteProductService,
    uploadProductImageService
} from '@/lib/admin/products'

// Note: For full strictness, you would wrap formData in Zod validation here
// Using a loose passthrough type to ensure backwards compatibility with your existing frontend
// until the forms are refactored to specific typed models.

// ─── Read Categories (for product form dropdown) ────────────────────────────
// Moving this here temporarily to keep it working, but it belongs in lib/admin/categories.ts
import { createClient } from '@/lib/supabase/server'
export async function getCategoriesForProductsAction() {
    await requireAdmin()

    const supabase = await createClient()
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true })

    if (error) return { data: [], error: `[Categories fetch] ${error.message}` }
    return { data: data || [] }
}

// ─── Thin Server Actions ──────────────────────────────────────────────────

export async function uploadProductImage(
    formData: FormData
): Promise<{ url?: string; error?: string }> {
    try {
        await requireAdmin()

        const file = formData.get('file') as File
        const url = await uploadProductImageService(file)

        return { url }
    } catch (error) {
        if (isRedirectError(error)) throw error;
        return { error: error instanceof Error ? error.message : 'Unknown upload error' }
    }
}

export async function createProductAction(
    productData: Record<string, unknown>
): Promise<{ data?: Record<string, unknown>; error?: string }> {
    try {
        await requireAdmin()

        // Pass directly to Domain logic. (Zod parsing would go here in V2)
        const data = await createProductService(productData)

        // Surgical invalidation
        revalidatePath('/admin/products')
        revalidatePath('/shop')
        revalidatePath('/')

        return { data }
    } catch (error) {
        if (isRedirectError(error)) throw error;
        return { error: error instanceof Error ? error.message : "Creation failed" }
    }
}

export async function updateProductAction(
    id: string,
    updateData: Record<string, unknown>
): Promise<{ data?: Record<string, unknown>; error?: string }> {
    try {
        await requireAdmin()

        const data = await updateProductService(id, updateData)

        revalidatePath('/admin/products')
        revalidatePath(`/product/${id}`)
        revalidatePath('/shop')
        revalidatePath('/')

        return { data }
    } catch (error) {
        if (isRedirectError(error)) throw error;
        return { error: error instanceof Error ? error.message : "Update failed" }
    }
}

export async function getProductsAction(): Promise<{ data: Record<string, unknown>[]; error?: string }> {
    try {
        await requireAdmin()

        const data = await getProductsService()
        return { data }
    } catch (error) {
        if (isRedirectError(error)) throw error;
        return { data: [], error: error instanceof Error ? error.message : "Fetch failed" }
    }
}

export async function deleteProductAction(
    id: string
): Promise<{ error?: string }> {
    try {
        await requireAdmin()

        await deleteProductService(id)

        revalidatePath('/admin/products')
        revalidatePath('/shop')
        revalidatePath('/')

        return {}
    } catch (error) {
        if (isRedirectError(error)) throw error;
        return { error: error instanceof Error ? error.message : "Deletion failed" }
    }
}
