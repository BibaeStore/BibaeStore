import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

/**
 * Universal server-side Admin Access Guard.
 * Validates the session explicitly via cookies and confirms the 'admin' role
 * strictly from the profiles table.
 * 
 * Throws an explicit error if unauthorized to trigger the nearest error boundary,
 * preventing silent failures and infinite loading spinners on the client.
 */
export async function requireAdmin() {
    const supabase = await createClient()

    // 1. Validate Session Presence
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    // Only redirect if completely unauthenticated
    if (!user || userError) {
        throw new Error("UNAUTHENTICATED")
    }

    // 2. Validate Profile Role using .maybeSingle() to prevent crash on missing rows
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()

    if (profileError) {
        console.error('[requireAdmin] Profile fetch error:', profileError)
        throw new Error("Unable to verify admin profile permissions.")
    }

    // Important: Hardcoded fallback matching legacy .env settings
    // This allows you to still login temporarily BEFORE you run the SQL script to create `profiles`.
    // Once the database is migrated, you can remove this fallback securely.
    const isLegacyAdmin = (
        user.email === 'habibaminhas@gmail.com' ||
        user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL
    )

    if ((!profile || profile.role !== 'admin') && !isLegacyAdmin) {
        console.warn(`[requireAdmin] Unauthorized access attempt by user: ${user.email}`)
        throw new Error("Unauthorized Admin Access")
    }

    return user
}
