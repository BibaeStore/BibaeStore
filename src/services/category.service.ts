import { createClient } from '../lib/supabase/client';
import { Category, CategoryFormData } from '../types/category';

export class CategoryService {
    private static supabase = createClient();
    private static bucketName = 'categories';

    static async getCategories(): Promise<Category[]> {
        const { data, error } = await this.supabase
            .from('categories')
            .select('*')
            .order('sort_order', { ascending: true })
            .order('name');

        if (error) {
            console.error('Error fetching categories:', error);
            throw error;
        }

        // Transform flat list to hierarchy if needed on frontend, or return flat list
        return data || [];
    }

    static async getCategoryHierarchy(): Promise<Category[]> {
        const categories = await this.getCategories();
        const map = new Map<string, Category>();
        const roots: Category[] = [];

        categories.forEach(cat => {
            map.set(cat.id, { ...cat, subcategories: [] });
        });

        categories.forEach(cat => {
            if (cat.parent_id) {
                const parent = map.get(cat.parent_id);
                if (parent) {
                    parent.subcategories?.push(map.get(cat.id)!);
                }
            } else {
                roots.push(map.get(cat.id)!);
            }
        });

        return roots;
    }

    static async createCategory(formData: CategoryFormData): Promise<Category> {
        let imageUrl = formData.image_url;

        if (formData.imageFile) {
            const sanitizedFileName = formData.imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const { data, error } = await this.supabase.storage
                .from(this.bucketName)
                .upload(`${Date.now()}-${sanitizedFileName}`, formData.imageFile);

            if (error) throw error;

            const { data: publicUrlData } = this.supabase.storage
                .from(this.bucketName)
                .getPublicUrl(data.path);

            imageUrl = publicUrlData.publicUrl;
        }

        const { data, error } = await this.supabase
            .from('categories')
            .insert([{
                name: formData.name,
                parent_id: formData.parent_id || null, // Ensure explicit null if undefined/empty string
                image_url: imageUrl,
                status: formData.status,
                sort_order: formData.sort_order || 0
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    static async updateCategory(id: string, formData: Partial<CategoryFormData>): Promise<Category> {
        let imageUrl = formData.image_url;

        if (formData.imageFile) {
            // Upload new image
            const sanitizedFileName = formData.imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const { data, error } = await this.supabase.storage
                .from(this.bucketName)
                .upload(`${Date.now()}-${sanitizedFileName}`, formData.imageFile);

            if (error) throw error;

            const { data: publicUrlData } = this.supabase.storage
                .from(this.bucketName)
                .getPublicUrl(data.path);

            imageUrl = publicUrlData.publicUrl;
        }

        const updateData: any = {
            name: formData.name,
            parent_id: formData.parent_id || null, // Allow clearing parent
            status: formData.status,
            sort_order: formData.sort_order
        };
        if (imageUrl !== undefined) updateData.image_url = imageUrl;

        const { data, error } = await this.supabase
            .from('categories')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    static async deleteCategory(id: string): Promise<void> {
        // Delete image if needed (optional logic could delete from storage)

        // Delete record (cascading delete for subcategories should be handled by DB constraints ideally, or check for children first)
        const { error } = await this.supabase
            .from('categories')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
}
