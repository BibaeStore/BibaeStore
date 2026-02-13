import { createClient } from '../lib/supabase/client';
import { CartItem } from '../types/client';

export class CartService {
    private static supabase = createClient();

    static async getCart(clientId: string): Promise<CartItem[]> {
        const { data, error } = await this.supabase
            .from('cart')
            .select('*, product:products(*)')
            .eq('client_id', clientId);

        if (error) throw error;
        return data || [];
    }

    static async addToCart(clientId: string, productId: string, quantity: number = 1) {
        const { data, error } = await this.supabase
            .from('cart')
            .upsert({
                client_id: clientId,
                product_id: productId,
                quantity
            }, { onConflict: 'client_id, product_id' })
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    static async updateQuantity(clientId: string, productId: string, quantity: number) {
        if (quantity <= 0) {
            return this.removeFromCart(clientId, productId);
        }

        const { data, error } = await this.supabase
            .from('cart')
            .update({ quantity })
            .eq('client_id', clientId)
            .eq('product_id', productId)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    static async removeFromCart(clientId: string, productId: string) {
        const { error } = await this.supabase
            .from('cart')
            .delete()
            .eq('client_id', clientId)
            .eq('product_id', productId);

        if (error) throw error;
    }

    static async clearCart(clientId: string) {
        const { error } = await this.supabase
            .from('cart')
            .delete()
            .eq('client_id', clientId);

        if (error) throw error;
    }
}
