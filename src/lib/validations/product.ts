import { z } from "zod"

export const productSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    sku: z.string().min(2, "SKU is required."),
    category_id: z.string().optional().nullable(),
    short_description: z.string().optional(),
    description: z.string().optional(),
    price: z.coerce.number().min(0, "Price must be positive."),
    sale_price: z.coerce.number().optional().nullable(),
    stock: z.coerce.number().int().min(0, "Stock cannot be negative."),
    status: z.enum(['active', 'inactive', 'draft']).default('draft'),
    is_featured: z.boolean().default(false),
})

export type ProductFormValues = z.infer<typeof productSchema>
