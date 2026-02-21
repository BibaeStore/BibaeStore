import { z } from "zod"

const sizeStockSchema = z.object({
    stock: z.coerce.number().int().min(0, "Stock cannot be negative."),
    enabled: z.boolean(),
})

const variantsSchema = z.object({
    sizes: z.record(z.string(), sizeStockSchema).optional(),
    colors: z.array(z.string()).optional(),
}).optional()

const sizeGuideSchema = z.object({
    headers: z.array(z.string()),
    rows: z.array(z.array(z.string())),
}).optional().nullable()

export const productSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    sku: z.string().min(2, "SKU is required."),
    category_id: z.string().optional().nullable(),
    short_description: z.string().optional(),
    description: z.string().optional(),
    price: z.coerce.number().min(0, "Price must be positive."),
    sale_price: z.coerce.number().optional().nullable(),
    cost_price: z.coerce.number().optional().nullable(),
    stock: z.coerce.number().int().min(0, "Stock cannot be negative."),
    status: z.enum(['active', 'inactive', 'draft']).default('draft'),
    is_featured: z.boolean().default(false),
    slug: z.string().optional(),
    meta_title: z.string().optional(),
    meta_description: z.string().optional(),
    keywords: z.string().optional(), // Comma-separated string in form
    variants: variantsSchema,
    size_guide: sizeGuideSchema,
})

export type ProductFormValues = z.infer<typeof productSchema>
