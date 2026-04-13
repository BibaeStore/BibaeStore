import { createClient } from '../lib/supabase/client';
import { Order, OrderItem, StatusHistoryEntry } from '../types/client';
import { CartService } from './cart.service';
import type { SupabaseClient } from '@supabase/supabase-js';

// Singleton client — one instance per browser session
let _supabaseClient: SupabaseClient | null = null;
function getClient(): SupabaseClient {
    if (!_supabaseClient) {
        _supabaseClient = createClient();
    }
    return _supabaseClient;
}

export class OrderService {
    private static get supabase() {
        return getClient();
    }

    static async placeOrder(
        clientId: string | null,
        totalAmount: number,
        items: { product_id: string, quantity: number, price: number, size?: string, color?: string }[],
        shippingAddress: string,
        paymentMethod: 'cod' | 'online' = 'cod',
        proofFile?: File,
        onlineMethod?: string,
        guestInfo?: { email: string, name: string, phone: string }
    ): Promise<Order> {
        let payment_proof_url = null;

        // Upload proof if online payment and file provided
        if (paymentMethod === 'online' && proofFile) {
            const fileExt = proofFile.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            const folder = clientId || 'guest';
            const filePath = `${folder}/${fileName}`;

            const { error: uploadError } = await this.supabase.storage
                .from('orders')
                .upload(filePath, proofFile);

            if (uploadError) throw new Error(`Proof upload failed: ${uploadError.message}`);

            const { data } = this.supabase.storage
                .from('orders')
                .getPublicUrl(filePath);

            payment_proof_url = data.publicUrl;
        }

        // Validate stock BEFORE creating the order to prevent overselling
        for (const item of items) {
            const { data: product, error: stockError } = await this.supabase
                .from('products')
                .select('name, stock, variants')
                .eq('id', item.product_id)
                .single();

            if (stockError || !product) {
                throw new Error(`Product not found: ${item.product_id}`);
            }

            const size = item.size || 'Standard';
            const sizeStock = product?.variants?.sizes?.[size]?.stock;
            const availableStock = sizeStock !== undefined ? sizeStock : (product.stock || 0);

            if (availableStock < item.quantity) {
                throw new Error(
                    `Sorry, only ${availableStock} unit(s) of "${product.name}" (${size}) are in stock. Please update your cart.`
                );
            }
        }

        const initialStatus = paymentMethod === 'online' ? 'under_review' : 'pending';
        const initialPaymentStatus = paymentMethod === 'online' ? 'under_review' : 'pending';

        // Build order data
        const orderData: any = {
            total_amount: totalAmount,
            status: initialStatus,
            shipping_address: shippingAddress,
            payment_method: paymentMethod,
            payment_proof_url: payment_proof_url,
            payment_status: initialPaymentStatus,
            status_history: [{
                status: initialStatus,
                timestamp: new Date().toISOString(),
                note: 'Order placed by customer'
            }]
        };

        if (clientId) {
            orderData.client_id = clientId;
        }

        if (guestInfo) {
            orderData.guest_email = guestInfo.email;
            orderData.guest_name = guestInfo.name;
            orderData.guest_phone = guestInfo.phone;
        }

        // Create the order
        const { data: order, error: orderError } = await this.supabase
            .from('orders')
            .insert(orderData)
            .select()
            .single();

        if (orderError) {
            console.error("Supabase Order Insert Error:", orderError);
            throw new Error(`Database Insert Failed: ${orderError.message} (${orderError.code})`);
        }

        // Create order items
        const orderItems = items.map(item => ({
            order_id: order.id,
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price,
            size: item.size || 'Standard',
            color: item.color || null
        }));

        const { error: itemsError } = await this.supabase
            .from('order_items')
            .insert(orderItems);

        if (itemsError) throw new Error(`Failed to save order items: ${itemsError.message} (code: ${itemsError.code})`);

        // Deduct stock for each item (validated above, so errors here are unexpected)
        for (const item of items) {
            try {
                await this.deductSizeStock(item.product_id, item.size || 'Standard', item.quantity);
            } catch (stockErr) {
                console.error(`[OrderService] Stock deduction failed for product ${item.product_id}:`, stockErr);
                // Order already created — log but don't throw to avoid orphaned orders
            }
        }

        // Clear the cart (only for logged-in users with DB cart)
        if (clientId) {
            try {
                await CartService.clearCart(clientId);
            } catch (cartErr) {
                // Non-critical: order already placed, just log the error
                console.error('[OrderService] Cart clear failed (order still successful):', cartErr);
            }
        }

        return order;
    }

    private static async deductSizeStock(productId: string, size: string, quantity: number): Promise<void> {
        const { data: product } = await this.supabase
            .from('products')
            .select('variants, stock')
            .eq('id', productId)
            .single();

        if (product?.variants?.sizes?.[size]) {
            const newStock = Math.max(0, (product.variants.sizes[size].stock || 0) - quantity);
            const updatedVariants = {
                ...product.variants,
                sizes: {
                    ...product.variants.sizes,
                    [size]: { ...product.variants.sizes[size], stock: newStock }
                }
            };

            // Calculate total stock from all sizes
            const totalStock = Object.values(updatedVariants.sizes as Record<string, { stock: number }>)
                .reduce((sum, s) => sum + (s.stock || 0), 0);

            await this.supabase
                .from('products')
                .update({ variants: updatedVariants, stock: totalStock })
                .eq('id', productId);
        } else {
            // Fallback: deduct from global stock
            const newStock = Math.max(0, (product?.stock || 0) - quantity);
            await this.supabase
                .from('products')
                .update({ stock: newStock })
                .eq('id', productId);
        }
    }

    static async restoreSizeStock(productId: string, size: string, quantity: number): Promise<void> {
        const { data: product } = await this.supabase
            .from('products')
            .select('variants, stock')
            .eq('id', productId)
            .single();

        if (product?.variants?.sizes?.[size]) {
            const newStock = (product.variants.sizes[size].stock || 0) + quantity;
            const updatedVariants = {
                ...product.variants,
                sizes: {
                    ...product.variants.sizes,
                    [size]: { ...product.variants.sizes[size], stock: newStock }
                }
            };

            const totalStock = Object.values(updatedVariants.sizes as Record<string, { stock: number }>)
                .reduce((sum, s) => sum + (s.stock || 0), 0);

            await this.supabase
                .from('products')
                .update({ variants: updatedVariants, stock: totalStock })
                .eq('id', productId);
        } else {
            const newStock = (product?.stock || 0) + quantity;
            await this.supabase
                .from('products')
                .update({ stock: newStock })
                .eq('id', productId);
        }
    }

    static async getOrders(clientId: string): Promise<Order[]> {
        const { data, error } = await this.supabase
            .from('orders')
            .select('*, items:order_items(*, product:products(name, images))')
            .eq('client_id', clientId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    }

    static async getOrderDetails(orderId: string): Promise<Order> {
        const { data, error } = await this.supabase
            .from('orders')
            .select('*, items:order_items(*, product:products(*)), client:clients(full_name, email, phone_number)')
            .eq('id', orderId)
            .single();

        if (error) throw error;
        return data;
    }

    static async getAllOrders(): Promise<Order[]> {
        const { data, error } = await this.supabase
            .from('orders')
            .select('*, client:clients(full_name, email, phone_number), items:order_items(*, product:products(name, images))')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[OrderService.getAllOrders] Error:', error.message, error.code);
            throw error;
        }
        return data || [];
    }

    static async getOrderByTracking(trackingNumber: string): Promise<Order | null> {
        const { data, error } = await this.supabase
            .from('orders')
            .select('*')
            .eq('tracking_number', trackingNumber)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }
        return data;
    }

    static async updateOrderStatus(orderId: string, status: string, note?: string): Promise<void> {
        // Always delegate to updateStatusWithHistory to maintain audit trail
        await this.updateStatusWithHistory(orderId, status, note);
    }

    static async updateStatusWithHistory(orderId: string, status: string, note?: string): Promise<void> {
        // Get current status history and items (in case we need to restore stock)
        const { data: order, error: selectError } = await this.supabase
            .from('orders')
            .select('status, status_history, items:order_items(*)')
            .eq('id', orderId)
            .single();

        if (selectError) {
            console.error('Failed to read order for status update:', selectError.message, selectError.code);
            throw new Error(`Cannot read order: ${selectError.message}`);
        }

        // If status is changing to cancelled, restore stock
        if (status === 'cancelled' && order.status !== 'cancelled') {
            if (order.items) {
                for (const item of order.items) {
                    await this.restoreSizeStock(item.product_id, item.size || 'Standard', item.quantity);
                }
            }
        }

        const currentHistory: StatusHistoryEntry[] = order?.status_history || [];
        const newEntry: StatusHistoryEntry = {
            status,
            timestamp: new Date().toISOString(),
            note: note || `Status changed to ${status}`
        };

        const { error } = await this.supabase
            .from('orders')
            .update({
                status,
                status_history: [...currentHistory, newEntry],
                updated_at: new Date().toISOString()
            })
            .eq('id', orderId);

        if (error) {
            console.error('Failed to update order status:', error.message, error.code);
            throw new Error(`Status update failed: ${error.message}`);
        }
    }

    static async updatePaymentStatus(orderId: string, paymentStatus: string, orderStatus?: string): Promise<void> {
        const updateData: any = {
            payment_status: paymentStatus,
            updated_at: new Date().toISOString()
        };
        if (orderStatus) {
            updateData.status = orderStatus;
        }

        // Also update status history
        const { data: order, error: selectError } = await this.supabase
            .from('orders')
            .select('status_history')
            .eq('id', orderId)
            .single();

        if (selectError) {
            console.error('Failed to read order for payment update:', selectError.message, selectError.code);
            throw new Error(`Cannot read order: ${selectError.message}`);
        }

        const currentHistory: StatusHistoryEntry[] = order?.status_history || [];
        const newEntry: StatusHistoryEntry = {
            status: orderStatus || paymentStatus,
            timestamp: new Date().toISOString(),
            note: paymentStatus === 'verified' ? 'Payment verified by admin' : paymentStatus === 'rejected' ? 'Payment rejected by admin' : `Payment status: ${paymentStatus}`
        };
        updateData.status_history = [...currentHistory, newEntry];

        const { error } = await this.supabase
            .from('orders')
            .update(updateData)
            .eq('id', orderId);

        if (error) {
            console.error('Failed to update payment status:', error.message, error.code);
            throw new Error(`Payment update failed: ${error.message}`);
        }
    }

    static async addAdminNote(orderId: string, note: string): Promise<void> {
        const { error } = await this.supabase
            .from('orders')
            .update({
                admin_notes: note,
                updated_at: new Date().toISOString()
            })
            .eq('id', orderId);

        if (error) throw error;
    }

    static async requestCancellation(orderId: string, reason: string): Promise<void> {
        const { data: order, error: selectError } = await this.supabase
            .from('orders')
            .select('status_history')
            .eq('id', orderId)
            .single();

        if (selectError) {
            console.error('Failed to read order for cancellation:', selectError.message);
            throw new Error(`Cannot read order: ${selectError.message}`);
        }

        const currentHistory: StatusHistoryEntry[] = order?.status_history || [];
        const newEntry: StatusHistoryEntry = {
            status: 'cancellation_requested',
            timestamp: new Date().toISOString(),
            note: `Cancellation requested: ${reason}`
        };

        const { error } = await this.supabase
            .from('orders')
            .update({
                cancellation_requested: true,
                cancellation_reason: reason,
                status_history: [...currentHistory, newEntry],
                updated_at: new Date().toISOString()
            })
            .eq('id', orderId);

        if (error) throw error;
    }

    static async approveCancellation(orderId: string): Promise<void> {
        await this.updateStatusWithHistory(orderId, 'cancelled', 'Cancellation approved by admin');

        const { error } = await this.supabase
            .from('orders')
            .update({
                cancellation_requested: false,
                updated_at: new Date().toISOString()
            })
            .eq('id', orderId);

        if (error) throw error;
    }

    static async getOrderStats(): Promise<{
        totalRevenue: number;
        activeOrders: number;
        totalCustomers: number;
        avgOrderValue: number;
        todayOrders: number;
        todayRevenue: number;
    }> {
        // Total revenue from delivered orders
        const { data: deliveredOrders } = await this.supabase
            .from('orders')
            .select('total_amount')
            .eq('status', 'delivered');

        const totalRevenue = (deliveredOrders || []).reduce((sum, o) => sum + Number(o.total_amount), 0);

        // Active orders (not delivered, not cancelled)
        const { count: activeOrders } = await this.supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .not('status', 'in', '(delivered,cancelled)');

        // Total customers
        const { count: totalCustomers } = await this.supabase
            .from('clients')
            .select('*', { count: 'exact', head: true });

        // All orders for avg calculation
        const { data: allOrders } = await this.supabase
            .from('orders')
            .select('total_amount')
            .neq('status', 'cancelled');

        const avgOrderValue = allOrders && allOrders.length > 0
            ? allOrders.reduce((sum, o) => sum + Number(o.total_amount), 0) / allOrders.length
            : 0;

        // Today's orders
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const { data: todayOrdersData } = await this.supabase
            .from('orders')
            .select('total_amount')
            .gte('created_at', today.toISOString());

        const todayOrders = todayOrdersData?.length || 0;
        const todayRevenue = (todayOrdersData || []).reduce((sum, o) => sum + Number(o.total_amount), 0);

        return {
            totalRevenue,
            activeOrders: activeOrders || 0,
            totalCustomers: totalCustomers || 0,
            avgOrderValue,
            todayOrders,
            todayRevenue
        };
    }

    static exportOrdersCSV(orders: Order[]): string {
        const headers = ['Order ID', 'Tracking #', 'Customer', 'Email', 'Phone', 'Total', 'Status', 'Payment', 'Payment Status', 'Address', 'Date'];
        const rows = orders.map(order => [
            order.id.slice(0, 8).toUpperCase(),
            order.tracking_number || '',
            order.client?.full_name || 'Unknown',
            order.client?.email || '',
            order.client?.phone_number || '',
            order.total_amount,
            order.status,
            order.payment_method || 'cod',
            order.payment_status || 'pending',
            (order.shipping_address || '').replace(/,/g, ';'),
            order.created_at ? new Date(order.created_at).toLocaleDateString() : ''
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        return csvContent;
    }
}
