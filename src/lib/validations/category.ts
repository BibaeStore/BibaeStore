import { z } from "zod"

export const categorySchema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    parent_id: z.string().optional().nullable(),
    image_url: z.string().optional().nullable(),
    status: z.enum(['active', 'inactive']).default('active'),
    sort_order: z.coerce.number().int().default(0),
})

export type CategoryFormValues = z.infer<typeof categorySchema>
