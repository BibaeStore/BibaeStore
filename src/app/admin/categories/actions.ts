'use server'

import { requireAdmin } from '@/lib/auth'
import { isRedirectError } from '@/lib/utils'
import { revalidatePath } from 'next/cache'
import {
    createCategoryService,
    updateCategoryService,
    getCategoriesService,
    deleteCategoryService,
    uploadCategoryImageService
} from '@/lib/admin/categories'

// ─── Thin Server Actions ──────────────────────────────────────────────────

export async function getCategoriesAction(): Promise<{ data: any[]; error?: string }> {
    try {
        await requireAdmin()
        const data = await getCategoriesService()
        return { data }
    } catch (error) {
        if (isRedirectError(error)) throw error;
        return { data: [], error: error instanceof Error ? error.message : "Fetch failed" }
    }
}

export async function createCategoryAction(
    categoryData: { name: string; parent_id: string | null; image_url: string | null; status: string; sort_order?: number }
): Promise<{ data?: any; error?: string }> {
    try {
        await requireAdmin()

        const data = await createCategoryService(categoryData)

        revalidatePath('/admin/categories')
        revalidatePath('/admin/products') // Sub-dep invalidate
        return { data }
    } catch (error) {
        if (isRedirectError(error)) throw error;
        return { error: error instanceof Error ? error.message : "Creation failed" }
    }
}

export async function updateCategoryAction(
    id: string,
    categoryData: { name?: string; parent_id?: string | null; image_url?: string | null; status?: string; sort_order?: number }
): Promise<{ data?: any; error?: string }> {
    try {
        await requireAdmin()

        const data = await updateCategoryService(id, categoryData)

        revalidatePath('/admin/categories')
        revalidatePath('/admin/products')
        return { data }
    } catch (error) {
        if (isRedirectError(error)) throw error;
        return { error: error instanceof Error ? error.message : "Update failed" }
    }
}

export async function deleteCategoryAction(
    id: string
): Promise<{ error?: string }> {
    try {
        await requireAdmin()

        await deleteCategoryService(id)

        revalidatePath('/admin/categories')
        revalidatePath('/admin/products')
        return {}
    } catch (error) {
        if (isRedirectError(error)) throw error;
        return { error: error instanceof Error ? error.message : "Deletion failed" }
    }
}

export async function uploadCategoryImageAction(
    formData: FormData
): Promise<{ url?: string; error?: string }> {
    try {
        await requireAdmin()

        const file = formData.get('file') as File
        const url = await uploadCategoryImageService(file)

        return { url }
    } catch (error) {
        if (isRedirectError(error)) throw error;
        return { error: error instanceof Error ? error.message : "Upload failed" }
    }
}
