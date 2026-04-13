
import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function createClient() {
    const cookieStore = await cookies()

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    )
}

/**
 * Admin client using Service Role Key — bypasses RLS entirely.
 * Use ONLY in server actions after verifying admin identity.
 */
export function createAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!serviceRoleKey) {
        console.warn('[createAdminClient] SUPABASE_SERVICE_ROLE_KEY is not set! Falling back to anon key — admin operations may fail due to RLS.')
        return createSupabaseClient(url, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    }

    return createSupabaseClient(url, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    })
}
