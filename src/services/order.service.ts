import { createClient } from '../lib/supabase/client';
import { Order, OrderItem } from '../types/client';
import { CartService } from './cart.service';

export class OrderService {
    private static supabase = createClient();

    static async placeOrder(
        clientId: string,
        totalAmount: number,
        items: { product_id: string, quantity: number, price: number }[],
        shippingAddress: string,
        paymentMethod: 'cod' | 'online' = 'cod',
        proofFile?: File
    ): Promise<Order> {
        let payment_proof_url = null;

        // Upload proof if online payment and file provided
        if (paymentMethod === 'online' && proofFile) {
            const fileExt = proofFile.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `${clientId}/${fileName}`;

            const { error: uploadError } = await this.supabase.storage
                .from('orders') // Ensure this bucket exists
                .upload(filePath, proofFile);

            if (uploadError) throw new Error(`Proof upload failed: ${uploadError.message}`);

            const { data } = this.supabase.storage
                .from('orders')
                .getPublicUrl(filePath);

            payment_proof_url = data.publicUrl;
        }

        // Try using RPC for atomic transaction (Faster)
        try {
            const { data: orderId, error: rpcError } = await this.supabase
                .rpc('place_order', {
                    p_client_id: clientId,
                    p_total_amount: totalAmount,
                    p_items: items,
                    p_shipping_address: shippingAddress,
                    p_payment_method: paymentMethod,
                    p_payment_proof_url: payment_proof_url
                });

            if (!rpcError && orderId) {
                // Return the created order details
                return { id: orderId.id } as Order;
            }
            // If RPC doesn't exist or fails, fall through to legacy method
            console.warn("RPC failed or returned no ID, falling back to sequential. Error:", rpcError);
        } catch (e) {
            console.warn("RPC attempt failed with exception:", e);
        }

        // Legacy Method (Fallback)
        // 1. Create the order
        const { data: order, error: orderError } = await this.supabase
            .from('orders')
            .insert({
                client_id: clientId,
                total_amount: totalAmount,
                status: 'pending',
                shipping_address: shippingAddress,
                payment_method: paymentMethod,
                payment_proof_url: payment_proof_url
            })
            .select()
            .single();

        if (orderError) {
            console.error("Supabase Order Insert Error:", orderError);
            // alert(`Debug: Insert failed - ${orderError.message}`); // Temporary for debugging
            throw new Error(`Database Insert Failed: ${orderError.message} (${orderError.code})`);
        }

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
