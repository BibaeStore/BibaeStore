'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function getProfileDataAction(): Promise<{
    profile?: any
    orders?: any[]
    userId?: string
    error?: string
}> {
    const sessionClient = await createClient()
    const { data: { user } } = await sessionClient.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const adminClient = createAdminClient()
    const [profileResult, ordersResult] = await Promise.all([
        adminClient.from('clients').select('*').eq('id', user.id).single(),
        adminClient
            .from('orders')
            .select('*, items:order_items(*, product:products(name, images))')
            .eq('client_id', user.id)
            .order('created_at', { ascending: false })
    ])

    return {
        profile: profileResult.data,
        orders: ordersResult.data || [],
        userId: user.id
    }
}

export async function updateProfileAction(
    formData: FormData
): Promise<{ data?: any; error?: string }> {
    const sessionClient = await createClient()
    const { data: { user } } = await sessionClient.auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    const adminClient = createAdminClient()

    const fullName = formData.get('full_name') as string
    const phone = formData.get('phone_number') as string
    const imageFile = formData.get('image') as File | null

    let profile_image_url: string | undefined

    if (imageFile && imageFile.size > 0) {
        const fileExt = imageFile.name.split('.').pop()
        const filePath = `${user.id}/${Math.random()}.${fileExt}`

        const { error: uploadError } = await adminClient.storage
            .from('client-profiles')
            .upload(filePath, imageFile, { upsert: true })

        if (uploadError) return { error: `Image upload failed: ${uploadError.message}` }

        const { data } = adminClient.storage.from('client-profiles').getPublicUrl(filePath)
        profile_image_url = data.publicUrl
    }

    const updateData: any = {
        full_name: fullName,
        phone_number: phone,
        updated_at: new Date().toISOString()
    }
    if (profile_image_url) updateData.profile_image_url = profile_image_url

    const { data, error } = await adminClient
        .from('clients')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single()

    if (error) return { error: error.message }
    return { data }
}
