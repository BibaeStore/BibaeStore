import { createClient } from '../lib/supabase/client';
import { Order, OrderItem } from '../types/client';
import { CartService } from './cart.service';

export class OrderService {
    private static supabase = createClient();

    static async placeOrder(clientId: string, totalAmount: number, items: { product_id: string, quantity: number, price: number }[], shippingAddress: string): Promise<Order> {
        // 1. Create the order
        const { data: order, error: orderError } = await this.supabase
            .from('orders')
            .insert({
                client_id: clientId,
                total_amount: totalAmount,
                status: 'pending',
                shipping_address: shippingAddress
            })
            .select()
            .single();

        if (orderError) throw orderError;

        // 2. Create order items
        const orderItems = items.map(item => ({
            order_id: order.id,
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price
        }));

        const { error: itemsError } = await this.supabase
            .from('order_items')
            .insert(orderItems);

        if (itemsError) throw itemsError;

        // 3. Clear the cart
        await CartService.clearCart(clientId);

        return order;
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
            .select('*, items:order_items(*, product:products(*))')
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

        if (error) throw error;
        return data || [];
    }

    static async updateOrderStatus(orderId: string, status: string): Promise<void> {
        const { error } = await this.supabase
            .from('orders')
            .update({
                status,
                updated_at: new Date().toISOString()
            })
            .eq('id', orderId);

        if (error) throw error;
    }
}
