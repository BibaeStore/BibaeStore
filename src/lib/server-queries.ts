import { createClient } from '@/lib/supabase/server'
import { Product } from '@/types/product'

// ─── Server-Side Data Fetching ──────────────────────────────────────────────
// These functions run ONLY on the server (in server components / server actions).
// They use the server Supabase client which reads cookies from the request,
// avoiding browser-side fetch caching issues entirely.

export async function getProducts(): Promise<Product[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('products')
        .select(`*, category:categories(name)`)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching products:', error)
        return []
    }
    return data || []
}

export async function getProduct(id: string): Promise<Product | null> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('products')
        .select(`*, category:categories(name)`)
        .eq('id', id)
        .maybeSingle()

    if (error) {
        console.error(`Error fetching product ${id}:`, error)
        return null
    }
    return data
}

export async function getRelatedProducts(categoryId: string, excludeId: string): Promise<Product[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('products')
        .select(`*, category:categories(name)`)
        .eq('category_id', categoryId)
        .neq('id', excludeId)
        .limit(4)

    if (error) {
        console.error('Error fetching related products:', error)
        return []
    }
    return data || []
}

export async function getProductReviews(productId: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('ratings')
        .select('*, client:clients(full_name, profile_image_url)')
        .eq('product_id', productId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching reviews:', error)
        return []
    }
    return data || []
}
