import { createClient } from '@/lib/supabase/server'
import { logAdminAction } from '@/lib/admin/logger'

// ─── Helpers ────────────────────────────────────────────────────────────────

function generateSlug(name: string): string {
    return name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
}

// ─── Categories ────────────────────────────────────────────────────────────

export async function createCategoryService(categoryData: { name: string; parent_id: string | null; image_url: string | null; status: string; sort_order?: number }) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('categories')
        .insert([{ ...categoryData, slug: generateSlug(categoryData.name) }])
        .select()
        .single()

    if (error) {
        throw new Error(`[Database Error] Failed to create category: ${error.message}`)
    }

    await logAdminAction('CREATE', 'CATEGORY', data.id, { categoryDetails: data })

    return data
}

export async function updateCategoryService(id: string, categoryData: { name?: string; parent_id?: string | null; image_url?: string | null; status?: string; sort_order?: number }) {
    const supabase = await createClient()

    const updateData: any = {
        name: categoryData.name,
        parent_id: categoryData.parent_id || null,
        status: categoryData.status,
    }
    if (categoryData.name) updateData.slug = generateSlug(categoryData.name)
    if (categoryData.sort_order !== undefined) updateData.sort_order = categoryData.sort_order
    if (categoryData.image_url !== undefined) updateData.image_url = categoryData.image_url

    const { data, error } = await supabase
        .from('categories')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

    if (error) {
        throw new Error(`[Database Error] Failed to update category: ${error.message}`)
    }

    if (!data) {
        throw new Error('Category not found or access denied by RLS policy.')
    }

    await logAdminAction('UPDATE', 'CATEGORY', id, { updatedFields: updateData })

    return data
}

export async function getCategoriesService() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true })

    if (error) {
        throw new Error(`[Database Error] Failed to fetch categories: ${error.message}`)
    }

    return data || []
}

export async function deleteCategoryService(id: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)

    if (error) {
        throw new Error(`[Database Error] Failed to delete category: ${error.message}`)
    }

    await logAdminAction('DELETE', 'CATEGORY', id)

    return true
}

export async function uploadCategoryImageService(file: File) {
    if (!file || file.size === 0) {
        throw new Error('No file provided')
    }

    const supabase = await createClient()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filePath = `${Date.now()}-${sanitizedName}`

    const { error } = await supabase.storage
        .from('categories')
        .upload(filePath, file, { cacheControl: '3600', upsert: false })

    if (error) {
        throw new Error(`[Storage Error] Upload failed: ${error.message}`)
    }

    const { data } = supabase.storage.from('categories').getPublicUrl(filePath)
    return data.publicUrl
}
