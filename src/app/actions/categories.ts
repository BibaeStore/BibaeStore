'use server'

import { createClient } from '@/lib/supabase/server'

export type NavCategory = {
    id: string
    name: string
    slug: string
    subcategories: { id: string; name: string; slug: string; href: string }[]
}

export async function getNavCategoriesAction(): Promise<NavCategory[]> {
    const supabase = await createClient()

    const { data: categories, error } = await supabase
        .from('categories')
        .select('id, name, slug, parent_id, sort_order')
        .eq('status', 'active')
        .order('sort_order', { ascending: true })

    if (error || !categories) return []

    const roots = categories.filter((c) => !c.parent_id)
    return roots.map((root) => {
        const parentSlug = root.slug || root.name.toLowerCase().replace(/\s+/g, '-')
        return {
            id: root.id,
            name: root.name,
            slug: parentSlug,
            subcategories: categories
                .filter((c) => c.parent_id === root.id)
                .map((sub) => {
                    const subSlug = sub.slug || sub.name.toLowerCase().replace(/\s+/g, '-')
                    return {
                        id: sub.id,
                        name: sub.name,
                        slug: subSlug,
                        href: `/shop/category/${parentSlug}/${subSlug}/`,
                    }
                }),
        }
    })
}
