import { createClient } from '@/lib/supabase/server'

export type AdminActionType = 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT' | 'RESTORE'
export type AdminEntityType = 'PRODUCT' | 'ORDER' | 'CATEGORY' | 'CLIENT' | 'SYSTEM'

/**
 * Enterprise Grade Logging System
 * Tracks every mutation made by an Admin, securely storing it in an Append-Only Postgres table. 
 * Provides accountability, debugging tracking, and compliance logs.
 */
export async function logAdminAction(
    actionType: AdminActionType,
    entity: AdminEntityType,
    entityId: string,
    metadata?: Record<string, any>
) {
    try {
        const supabase = await createClient()

        // 1. Get the current admin's ID directly from their active secure session cookie
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            console.warn('[Admin Logger] Attempted to log action but no user was authenticated in context.')
            return
        }

        // 2. Insert into the locked append-only table
        const { error } = await supabase
            .from('admin_logs')
            .insert({
                admin_id: user.id,
                action_type: actionType,
                entity: entity,
                entity_id: entityId,
                metadata: metadata || {}
            })

        if (error) {
            console.error('[Admin Logger] Failed to securely log admin mutation to database:', error.message)
            // Note: We deliberately do not throw this error up to the UI. 
            // A logging system failure shouldn't necessarily block a successful business transaction 
            // from completing, but it MUST be logged to a 3rd party service (like Sentry/Datadog) in production.
        }

    } catch (err) {
        console.error('[Admin Logger] Unhandled exception during logging:', err)
    }
}
