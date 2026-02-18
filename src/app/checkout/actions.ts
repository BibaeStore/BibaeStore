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

    // Validate stock before creating order
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
        const availableStock = sizeStock !== undefined ? sizeStock : (product.stock || 0)

        if (availableStock < item.quantity) {
            return {
                error: `Sorry, only ${availableStock} unit(s) of "${product.name}" (${size}) are in stock. Please update your cart.`
            }
        }
    }

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
        return { error: `Failed to save order items: ${itemsError.message}` }
    }

    // Deduct stock
    for (const item of orderData.items) {
        try {
            await deductSizeStock(adminClient, item.product_id, item.size || 'Standard', item.quantity)
        } catch (stockErr) {
            console.error(`[placeOrderAction] Stock deduction failed for ${item.product_id}:`, stockErr)
        }
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
    const { data: product } = await adminClient
        .from('products')
        .select('variants, stock')
        .eq('id', productId)
        .single()

    if (product?.variants?.sizes?.[size]) {
        const newStock = Math.max(0, (product.variants.sizes[size].stock || 0) - quantity)
        const updatedVariants = {
            ...product.variants,
            sizes: {
                ...product.variants.sizes,
                [size]: { ...product.variants.sizes[size], stock: newStock }
            }
        }
        const totalStock = Object.values(updatedVariants.sizes as Record<string, { stock: number }>)
            .reduce((sum: number, s) => sum + (s.stock || 0), 0)

        await adminClient
            .from('products')
            .update({ variants: updatedVariants, stock: totalStock })
            .eq('id', productId)
    } else {
        const newStock = Math.max(0, (product?.stock || 0) - quantity)
        await adminClient
            .from('products')
            .update({ stock: newStock })
            .eq('id', productId)
    }
}
