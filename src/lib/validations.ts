import { z } from 'zod'

// --- Products ---
export const productSchema = z.object({
    name: z.string().min(1, "Name is required"),
    slug: z.string().optional(),
    description: z.string().optional(),
    price: z.number().min(0, "Price must be a positive number"),
    sale_price: z.number().nullable().optional(),
    stock_quantity: z.number().int().min(0, "Stock must be 0 or greater"),
    category_id: z.string().nullable().optional(),
    status: z.enum(['active', 'draft', 'archived']).default('draft'),
    is_featured: z.boolean().default(false),
    image_url: z.string().nullable().optional(),
    images: z.array(z.string()).optional(),
    seo_title: z.string().nullable().optional(),
    seo_description: z.string().nullable().optional(),
    seo_keywords: z.string().nullable().optional(),
})
export type ProductInput = z.infer<typeof productSchema>

export const productUpdateSchema = productSchema.partial()
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>

// --- Categories ---
export const categorySchema = z.object({
    name: z.string().min(1, "Name is required"),
    parent_id: z.string().nullable().optional(),
    image_url: z.string().nullable().optional(),
    status: z.enum(['active', 'draft', 'archived']).default('draft'),
})
export type CategoryInput = z.infer<typeof categorySchema>
export const categoryUpdateSchema = categorySchema.partial()
