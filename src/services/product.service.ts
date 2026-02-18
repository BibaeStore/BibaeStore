import { createClient } from '../lib/supabase/client';
import { Product } from '../types/product';
import type { SupabaseClient } from '@supabase/supabase-js';

// ProductService handles READ operations (used by public pages).
// All write operations (create, update, delete) use Server Actions
// in src/app/admin/products/actions.ts to avoid browser-side Supabase client
// auth lock issues.

// Singleton client — one instance per browser session
let _supabaseClient: SupabaseClient | null = null;
function getClient(): SupabaseClient {
    if (!_supabaseClient) {
        _supabaseClient = createClient();
    }
    return _supabaseClient;
}

export class ProductService {
    private static get supabase() {
        return getClient();
    }

    static async getProducts(): Promise<Product[]> {
        const { data, error } = await this.supabase
            .from('products')
            .select('*, category:categories(id, name, slug)')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[ProductService.getProducts] Error:', error.message, error.code);
            throw error;
        }
        return data || [];
    }

    static async getProductById(id: string): Promise<Product | null> {
        const { data, error } = await this.supabase
            .from('products')
            .select('*, category:categories(id, name, slug)')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            console.error('[ProductService.getProductById] Error:', error.message, error.code);
            throw error;
        }
        return data;
    }

    static async getProductBySlug(slug: string): Promise<Product | null> {
        const { data, error } = await this.supabase
            .from('products')
            .select('*, category:categories(id, name, slug)')
            .eq('slug', slug)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            console.error('[ProductService.getProductBySlug] Error:', error.message, error.code);
            throw error;
        }
        return data;
    }
}
