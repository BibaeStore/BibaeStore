import { createClient } from '@/lib/supabase/server'

export async function getDashboardDataService() {
    const supabase = await createClient()

    // Fetch recent orders (last 5)
    const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

    if (ordersError) throw new Error(`[Database Error] Failed to load orders: ${ordersError.message}`)

    // Stats queries in parallel
    const [
        { data: deliveredOrders },
        { count: activeOrders },
        { count: totalCustomers },
        { data: allOrders },
        { data: todayOrdersData },
        { data: allOrderStatuses }
    ] = await Promise.all([
        supabase
            .from('orders')
            .select('total_amount')
            .eq('status', 'delivered'),
        supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .not('status', 'in', '(delivered,cancelled)'),
        supabase
            .from('clients')
            .select('*', { count: 'exact', head: true }),
        supabase
            .from('orders')
            .select('total_amount')
            .neq('status', 'cancelled'),
        supabase
            .from('orders')
            .select('total_amount')
            .gte('created_at', (() => {
                const d = new Date()
                d.setHours(0, 0, 0, 0)
                return d.toISOString()
            })()),
        supabase
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
}
