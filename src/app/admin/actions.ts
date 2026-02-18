'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { SupabaseClient } from '@supabase/supabase-js'

async function verifyAdminUser(supabase: SupabaseClient): Promise<{ error?: string }> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated' }
    const adminEmail = process.env.ADMIN_EMAIL
    if (adminEmail && user.email !== adminEmail) return { error: 'Not authorized' }
    return {}
}

// ─── Dashboard Data ──────────────────────────────────────────────────────────

export async function getDashboardDataAction(): Promise<{
    orders: any[];
    stats: {
        totalRevenue: number;
        activeOrders: number;
        totalCustomers: number;
        avgOrderValue: number;
        todayOrders: number;
        todayRevenue: number;
    };
    statusCounts: Record<string, number>;
    error?: string;
}> {
    const sessionClient = await createClient()
    const authCheck = await verifyAdminUser(sessionClient)
    if (authCheck.error) {
        return {
            orders: [],
            stats: { totalRevenue: 0, activeOrders: 0, totalCustomers: 0, avgOrderValue: 0, todayOrders: 0, todayRevenue: 0 },
            statusCounts: {},
            error: authCheck.error
        }
    }

    const adminClient = createAdminClient()

    try {
        // Fetch recent orders (last 5) with client info
        const { data: ordersData, error: ordersError } = await adminClient
            .from('orders')
            .select('*, client:clients(full_name, email, phone_number)')
            .order('created_at', { ascending: false })
            .limit(5)

        if (ordersError) throw new Error(`Failed to load orders: ${ordersError.message}`)

        // Stats queries in parallel
        const [
            { data: deliveredOrders },
            { count: activeOrders },
            { count: totalCustomers },
            { data: allOrders },
            { data: todayOrdersData },
            { data: allOrderStatuses }
        ] = await Promise.all([
            adminClient
                .from('orders')
                .select('total_amount')
                .eq('status', 'delivered'),
            adminClient
                .from('orders')
                .select('*', { count: 'exact', head: true })
                .not('status', 'in', '(delivered,cancelled)'),
            adminClient
                .from('clients')
                .select('*', { count: 'exact', head: true }),
            adminClient
                .from('orders')
                .select('total_amount')
                .neq('status', 'cancelled'),
            adminClient
                .from('orders')
                .select('total_amount')
                .gte('created_at', (() => {
                    const d = new Date()
                    d.setHours(0, 0, 0, 0)
                    return d.toISOString()
                })()),
            adminClient
                .from('orders')
                .select('status')
        ])

        const totalRevenue = (deliveredOrders || []).reduce(
            (sum: number, o: any) => sum + Number(o.total_amount), 0
        )
        const avgOrderValue = allOrders && allOrders.length > 0
            ? allOrders.reduce((sum: number, o: any) => sum + Number(o.total_amount), 0) / allOrders.length
            : 0
        const todayOrders = todayOrdersData?.length || 0
        const todayRevenue = (todayOrdersData || []).reduce(
            (sum: number, o: any) => sum + Number(o.total_amount), 0
        )

        // Compute status counts from ALL orders
        const statusCounts: Record<string, number> = {}
        for (const o of (allOrderStatuses || [])) {
            statusCounts[o.status] = (statusCounts[o.status] || 0) + 1
        }

        return {
            orders: ordersData || [],
            stats: {
                totalRevenue,
                activeOrders: activeOrders || 0,
                totalCustomers: totalCustomers || 0,
                avgOrderValue,
                todayOrders,
                todayRevenue
            },
            statusCounts
        }
    } catch (err: any) {
        console.error('[getDashboardDataAction] error:', err)
        return {
            orders: [],
            stats: { totalRevenue: 0, activeOrders: 0, totalCustomers: 0, avgOrderValue: 0, todayOrders: 0, todayRevenue: 0 },
            statusCounts: {},
            error: err?.message || 'Failed to load dashboard data'
        }
    }
}
