'use server'

import { createAdminClient } from '@/lib/supabase/server'

export async function checkStockAction(
    productId: string,
    size: string,
    quantity: number
): Promise<{ available: boolean; availableStock: number; productName: string }> {
    const adminClient = createAdminClient()
    const { data: product, error } = await adminClient
        .from('products')
        .select('name, stock, variants')
        .eq('id', productId)
        .single()

    if (error || !product) {
        return { available: false, availableStock: 0, productName: 'Unknown product' }
    }

    const variantSizes = product.variants?.sizes
    const hasSizeVariants = variantSizes && Object.keys(variantSizes).length > 0

    let availableStock: number

    if (hasSizeVariants && size && size !== 'Standard' && variantSizes[size]) {
        availableStock = variantSizes[size].stock ?? 0
    } else if (hasSizeVariants && size && size !== 'Standard' && !variantSizes[size]) {
        // Requested size doesn't exist in variants
        availableStock = 0
    } else {
        availableStock = product.stock ?? 0
    }

    return {
        available: availableStock >= quantity,
        availableStock,
        productName: product.name
    }
}
