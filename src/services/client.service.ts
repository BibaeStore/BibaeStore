import { createClient } from '../lib/supabase/client';
import { Client as ClientType } from '../types/client';

export class ClientService {
    private static get supabase() { return createClient(); }
    private static bucketName = 'client-profiles';

    static async getProfile(id: string): Promise<ClientType | null> {
        const { data, error } = await this.supabase
            .from('clients')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching client profile:', error);
            return null;
        }
        return data;
    }

    static async getAllClients(): Promise<ClientType[]> {
        const { data, error } = await this.supabase
            .from('clients')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching all clients:', error);
            return [];
        }
        return data || [];
    }

    static async updateProfile(id: string, updates: Partial<ClientType>, profileImage?: File): Promise<ClientType> {
        let profile_image_url = updates.profile_image_url;

        if (profileImage) {
            const fileExt = profileImage.name.split('.').pop();
            const filePath = `${id}/${Math.random()}.${fileExt}`;

            const { error: uploadError } = await this.supabase.storage
                .from(this.bucketName)
                .upload(filePath, profileImage, { upsert: true });

            if (uploadError) throw uploadError;

            const { data } = this.supabase.storage
                .from(this.bucketName)
                .getPublicUrl(filePath);

            profile_image_url = data.publicUrl;
        }

        const { data, error } = await this.supabase
            .from('clients')
            .update({
                ...updates,
                profile_image_url,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    static async getRatings(productId: string) {
        const { data, error } = await this.supabase
            .from('ratings')
            .select('*, client:clients(full_name, profile_image_url)')
            .eq('product_id', productId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    }

    static async submitRating(rating: { product_id: string, client_id: string, rating: number, comment?: string }) {
        const { data, error } = await this.supabase
            .from('ratings')
            .upsert(rating, { onConflict: 'client_id, product_id' })
            .select()
            .single();

        if (error) throw error;
        return data;
    }
    static async deleteClient(id: string): Promise<void> {
        const { error } = await this.supabase
            .from('clients')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting client:', error);
            throw error;
        }
    }
}
