import { createClient } from '../lib/supabase/client';
import { Product, ProductFormData } from '../types/product';

export class ProductService {
    private static supabase = createClient();
    private static bucketName = 'products';

    static async getProducts(): Promise<Product[]> {
        const { data, error } = await this.supabase
            .from('products')
            .select(`
                *,
                category:categories(name)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching products:', error);
            throw error;
        }

        return data || [];
    }

    static async getProduct(id: string): Promise<Product | null> {
        const { data, error } = await this.supabase
            .from('products')
            .select(`
                *,
                category:categories(name)
            `)
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    }

    static async createProduct(formData: ProductFormData): Promise<Product> {
        let imageUrls: string[] = formData.images || [];

        // Upload new images
        if (formData.newImages && formData.newImages.length > 0) {
            const uploadPromises = formData.newImages.map(async (file) => {
                const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
                const filePath = `${Date.now()}-${Math.random().toString(36).substring(7)}-${sanitizedFileName}`;

                const { data, error } = await this.supabase.storage
                    .from(this.bucketName)
                    .upload(filePath, file);

                if (error) throw error;

                const { data: publicUrlData } = this.supabase.storage
                    .from(this.bucketName)
                    .getPublicUrl(data.path);

                return publicUrlData.publicUrl;
            });

            const uploadedUrls = await Promise.all(uploadPromises);
            imageUrls = [...imageUrls, ...uploadedUrls];
        }

        const { data, error } = await this.supabase
            .from('products')
            .insert([{
                name: formData.name,
                sku: formData.sku,
                category_id: formData.category_id || null,
                images: imageUrls,
                short_description: formData.short_description,
                description: formData.description,
                price: formData.price,
                sale_price: formData.sale_price,
                stock: formData.stock,
                status: formData.status,
                is_featured: formData.is_featured,
                variants: formData.variants // Future use
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    static async updateProduct(id: string, formData: Partial<ProductFormData>): Promise<Product> {
        let imageUrls: string[] = formData.images || [];

        // Upload new images and append
        if (formData.newImages && formData.newImages.length > 0) {
            const uploadPromises = formData.newImages.map(async (file) => {
                const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
                const filePath = `${Date.now()}-${Math.random().toString(36).substring(7)}-${sanitizedFileName}`;

                const { data, error } = await this.supabase.storage
                    .from(this.bucketName)
                    .upload(filePath, file);

                if (error) throw error;

                const { data: publicUrlData } = this.supabase.storage
                    .from(this.bucketName)
                    .getPublicUrl(data.path);

                return publicUrlData.publicUrl;
            });

            const uploadedUrls = await Promise.all(uploadPromises);
            imageUrls = [...imageUrls, ...uploadedUrls];
        }

        // Prepare update object
        const updateData: any = {
            name: formData.name,
            sku: formData.sku,
            category_id: formData.category_id || null,
            images: imageUrls,
            short_description: formData.short_description,
            description: formData.description,
            price: formData.price,
            sale_price: formData.sale_price,
            stock: formData.stock,
            status: formData.status,
            is_featured: formData.is_featured,
            // variants: formData.variants // Only update variants if provided explicitly to avoid overwriting with undefined if partial
        };

        // Remove undefined keys
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

        const { data, error } = await this.supabase
            .from('products')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    static async deleteProduct(id: string): Promise<void> {
        // Logic to delete images from storage could be added here if needed

        const { error } = await this.supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
}
