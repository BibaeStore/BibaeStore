import { createClient } from '../lib/supabase/client';
import { Product } from '../types/product';

// ProductService now only handles READ operations (used by public pages).
// All write operations (create, update, delete) use Server Actions
// in src/app/admin/products/actions.ts to avoid browser-side Supabase client
// auth lock issues.

export class ProductService {
    private static get supabase() {
        return createClient();
    }

    static async getProducts(): Promise<Product[]> {
        const { data, error } = await this.supabase
            .from('products')
            .select(`*, category:categories(name)`)
            .order('created_at', { ascending: false });

        if (error) { console.error('Error fetching products:', error); throw error; }
        return data || [];
    }

    static async getProduct(id: string): Promise<Product | null> {
        const { data, error } = await this.supabase
            .from('products')
            .select(`*, category:categories(name)`)
            .eq('id', id)
            .maybeSingle();

        if (error) { console.error(`Error fetching product ${id}:`, error); throw error; }
        return data;
    }
}
