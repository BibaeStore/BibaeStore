export interface Product {
    id: string;
    name: string;
    sku: string;
    category_id: string | null;
    images: string[];
    short_description?: string;
    description?: string;
    price: number;
    sale_price?: number | null;
    stock: number;
    status: 'active' | 'inactive' | 'draft';
    is_featured: boolean;
    variants?: any; // strict type later if needed
    sizes?: string[];
    colors?: string[];
    created_at?: string;
    updated_at?: string;
    category?: {
        name: string;
    };
}

export type ProductFormData = {
    name: string;
    sku: string;
    category_id: string | null;
    images?: string[]; // Existing images to keep
    newImages?: File[]; // New images to upload
    short_description?: string;
    description?: string;
    price: number;
    sale_price?: number | null;
    stock: number;
    status: 'active' | 'inactive' | 'draft';
    is_featured: boolean;
    variants?: any;
};
