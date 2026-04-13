'use server'

import { createAdminClient } from '@/lib/supabase/server'

export async function getProfileForCheckoutAction(
    userId: string
): Promise<{ data?: any; error?: string }> {
    const adminClient = createAdminClient()
    const { data, error } = await adminClient
        .from('clients')
        .select('*')
        .eq('id', userId)
        .single()

    if (error) {
        console.error('[getProfileForCheckoutAction] error:', error)
        return { error: error.message }
    }
    return { data }
}

export async function uploadPaymentProofAction(
    formData: FormData
): Promise<{ url?: string; error?: string }> {
    const file = formData.get('file') as File
    if (!file) return { error: 'No file provided' }

    const adminClient = createAdminClient()
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const clientId = (formData.get('clientId') as string) || 'guest'
    const filePath = `${clientId}/${fileName}`

    const { error: uploadError } = await adminClient.storage
        .from('orders')
        .upload(filePath, file)

    if (uploadError) return { error: `Proof upload failed: ${uploadError.message}` }

    const { data } = adminClient.storage.from('orders').getPublicUrl(filePath)
    return { url: data.publicUrl }
}

export async function placeOrderAction(orderData: {
    clientId: string | null
    totalAmount: number
    items: { product_id: string; quantity: number; price: number; size?: string; color?: string }[]
    shippingAddress: string
    paymentMethod: 'cod' | 'online'
    paymentProofUrl?: string | null
    onlineMethod?: string
    guestInfo?: { email: string; name: string; phone: string }
}): Promise<{ data?: any; error?: string }> {
    const adminClient = createAdminClient()

    // Ensure client record exists for logged-in users (safety net if signup trigger missed)
    if (orderData.clientId) {
        const { data: existingClient } = await adminClient
            .from('clients')
            .select('id')
            .eq('id', orderData.clientId)
            .single()

        if (!existingClient) {
            // Auto-create client record from guest info or auth data
            const clientInsert: any = {
                id: orderData.clientId,
                email: orderData.guestInfo?.email || '',
                full_name: orderData.guestInfo?.name || '',
                phone_number: orderData.guestInfo?.phone || null
            }
            const { error: clientError } = await adminClient
                .from('clients')
                .insert(clientInsert)

            if (clientError) {
                console.error('[placeOrderAction] Failed to create client record, falling back to guest:', clientError)
                // Fall back to guest order
                orderData.clientId = null
                if (!orderData.guestInfo && clientInsert.email) {
                    orderData.guestInfo = {
                        email: clientInsert.email,
                        name: clientInsert.full_name,
                        phone: clientInsert.phone_number || ''
                    }
                }
            }
        }
    }

    // Validate stock before anything else
    for (const item of orderData.items) {
        const { data: product, error: stockError } = await adminClient
            .from('products')
            .select('name, stock, variants')
            .eq('id', item.product_id)
            .single()

        if (stockError || !product) {
            return { error: `Product not found: ${item.product_id}` }
        }

        const size = item.size || 'Standard'
        const sizeStock = product?.variants?.sizes?.[size]?.stock
        const hasSizeVariants = product?.variants?.sizes && Object.keys(product.variants.sizes).length > 0

        // If product has size variants but requested size doesn't exist, reject
        if (hasSizeVariants && size !== 'Standard' && sizeStock === undefined) {
            const availableSizes = Object.keys(product.variants.sizes).join(', ')
            return {
                error: `Size "${size}" is not available for "${product.name}". Available sizes: ${availableSizes}`
            }
        }

        const availableStock = sizeStock !== undefined ? sizeStock : (product.stock || 0)

        if (availableStock < item.quantity) {
            return {
                error: `Sorry, only ${availableStock} unit(s) of "${product.name}" (${size}) are in stock. Please update your cart.`
            }
        }
    }

    // Deduct stock BEFORE creating order (with rollback on failure)
    const deductedItems: { product_id: string; size: string; quantity: number }[] = []

    try {
        for (const item of orderData.items) {
            const size = item.size || 'Standard'
            await deductSizeStock(adminClient, item.product_id, size, item.quantity)
            deductedItems.push({ product_id: item.product_id, size, quantity: item.quantity })
        }
    } catch (deductErr: any) {
        // Rollback all previously deducted items
        for (const deducted of deductedItems) {
            try {
                await restoreSizeStock(adminClient, deducted.product_id, deducted.size, deducted.quantity)
            } catch (rollbackErr) {
                console.error(`[placeOrderAction] Rollback failed for ${deducted.product_id}:`, rollbackErr)
            }
        }
        return { error: `Stock deduction failed: ${deductErr.message}` }
    }

    // Create order
    const initialStatus = orderData.paymentMethod === 'online' ? 'under_review' : 'pending'
    const initialPaymentStatus = orderData.paymentMethod === 'online' ? 'under_review' : 'pending'

    const insertData: any = {
        total_amount: orderData.totalAmount,
        status: initialStatus,
        shipping_address: orderData.shippingAddress,
        payment_method: orderData.paymentMethod,
        payment_proof_url: orderData.paymentProofUrl || null,
        payment_status: initialPaymentStatus,
        status_history: [{
            status: initialStatus,
            timestamp: new Date().toISOString(),
            note: 'Order placed by customer'
        }]
    }

    if (orderData.clientId) insertData.client_id = orderData.clientId
    if (orderData.guestInfo) {
        insertData.guest_email = orderData.guestInfo.email
        insertData.guest_name = orderData.guestInfo.name
        insertData.guest_phone = orderData.guestInfo.phone
    }

    const { data: order, error: orderError } = await adminClient
        .from('orders')
        .insert(insertData)
        .select()
        .single()

    if (orderError) {
        console.error('[placeOrderAction] insert error:', orderError)
        // Rollback stock since order creation failed
        for (const deducted of deductedItems) {
            try {
                await restoreSizeStock(adminClient, deducted.product_id, deducted.size, deducted.quantity)
            } catch (rollbackErr) {
                console.error(`[placeOrderAction] Rollback failed for ${deducted.product_id}:`, rollbackErr)
            }
        }
        return { error: `Order creation failed: ${orderError.message}` }
    }

    // Create order items
    const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        size: item.size || 'Standard',
        color: item.color || null
    }))

    const { error: itemsError } = await adminClient.from('order_items').insert(orderItems)
    if (itemsError) {
        console.error('[placeOrderAction] items error:', itemsError)
        // Rollback stock since order items failed
        for (const deducted of deductedItems) {
            try {
                await restoreSizeStock(adminClient, deducted.product_id, deducted.size, deducted.quantity)
            } catch (rollbackErr) {
                console.error(`[placeOrderAction] Rollback failed for ${deducted.product_id}:`, rollbackErr)
            }
        }
        return { error: `Failed to save order items: ${itemsError.message}` }
    }

    // Clear DB cart for logged-in users
    if (orderData.clientId) {
        try {
            await adminClient.from('cart').delete().eq('client_id', orderData.clientId)
        } catch (cartErr) {
            console.error('[placeOrderAction] Cart clear failed:', cartErr)
        }
    }

    return { data: order }
}

async function deductSizeStock(
    adminClient: any,
    productId: string,
    size: string,
    quantity: number
): Promise<void> {
    const { data: product, error: fetchError } = await adminClient
        .from('products')
        .select('variants, stock')
        .eq('id', productId)
        .single()

    if (fetchError || !product) {
        throw new Error(`Failed to fetch product ${productId} for stock deduction`)
    }

    const hasSizeVariants = product.variants?.sizes && Object.keys(product.variants.sizes).length > 0

    if (hasSizeVariants && product.variants.sizes[size]) {
        const currentStock = product.variants.sizes[size].stock || 0
        if (currentStock < quantity) {
            throw new Error(`Insufficient stock for size ${size}: have ${currentStock}, need ${quantity}`)
        }
        const newStock = currentStock - quantity
        const updatedVariants = {
            ...product.variants,
            sizes: {
                ...product.variants.sizes,
                [size]: { ...product.variants.sizes[size], stock: newStock }
            }
        }
        const totalStock = Object.values(updatedVariants.sizes as Record<string, { stock: number }>)
            .reduce((sum: number, s) => sum + (s.stock || 0), 0)

        const { error: updateError } = await adminClient
            .from('products')
            .update({ variants: updatedVariants, stock: totalStock })
            .eq('id', productId)
            .select()

        if (updateError) {
            throw new Error(`Failed to update stock for product ${productId}: ${updateError.message}`)
        }
    } else if (hasSizeVariants && !product.variants.sizes[size]) {
        // Product has size variants but the requested size doesn't exist — error
        const availableSizes = Object.keys(product.variants.sizes).join(', ')
        throw new Error(`Size "${size}" not found in product variants. Available: ${availableSizes}`)
    } else {
        // No size variants — use global stock
        const currentStock = product.stock || 0
        if (currentStock < quantity) {
            throw new Error(`Insufficient global stock: have ${currentStock}, need ${quantity}`)
        }
        const newStock = currentStock - quantity
        const { error: updateError } = await adminClient
            .from('products')
            .update({ stock: newStock })
            .eq('id', productId)
            .select()

        if (updateError) {
            throw new Error(`Failed to update global stock for product ${productId}: ${updateError.message}`)
        }
    }
}

async function restoreSizeStock(
    adminClient: any,
    productId: string,
    size: string,
    quantity: number
): Promise<void> {
    const { data: product, error: fetchError } = await adminClient
        .from('products')
        .select('variants, stock')
        .eq('id', productId)
        .single()

    if (fetchError || !product) {
        throw new Error(`Failed to fetch product ${productId} for stock restoration`)
    }

    const hasSizeVariants = product.variants?.sizes && Object.keys(product.variants.sizes).length > 0

    if (hasSizeVariants && product.variants.sizes[size]) {
        const restoredStock = (product.variants.sizes[size].stock || 0) + quantity
        const updatedVariants = {
            ...product.variants,
            sizes: {
                ...product.variants.sizes,
                [size]: { ...product.variants.sizes[size], stock: restoredStock }
            }
        }
        const totalStock = Object.values(updatedVariants.sizes as Record<string, { stock: number }>)
            .reduce((sum: number, s) => sum + (s.stock || 0), 0)

        await adminClient
            .from('products')
            .update({ variants: updatedVariants, stock: totalStock })
            .eq('id', productId)
    } else {
        // No size variants — restore global stock
        const restoredStock = (product.stock || 0) + quantity
        await adminClient
            .from('products')
            .update({ stock: restoredStock })
            .eq('id', productId)
    }
}
