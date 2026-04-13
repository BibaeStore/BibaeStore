'use server'

import { requireAdmin } from '@/lib/auth'
import { getDashboardDataService } from '@/lib/admin/dashboard'
import { isRedirectError } from '@/lib/utils'

export async function getDashboardDataAction() {
    try {
        await requireAdmin()

        const data = await getDashboardDataService()
        return { ...data, error: undefined }

    } catch (error) {
        if (isRedirectError(error)) throw error;
        return {
            orders: [],
            stats: { totalRevenue: 0, activeOrders: 0, totalCustomers: 0, avgOrderValue: 0, todayOrders: 0, todayRevenue: 0 },
            statusCounts: {},
            error: error instanceof Error ? error.message : 'Failed to load dashboard data'
        }
    }
}
