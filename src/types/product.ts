export interface SizeStock {
    stock: number;
    enabled: boolean;
}

export interface ProductVariants {
    sizes?: Record<string, SizeStock>;
    colors?: string[];
}

export const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const;
export type SizeName = typeof ALL_SIZES[number];

export interface SizeGuide {
    headers: string[];
    rows: string[][];
}

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
    variants?: ProductVariants;
    size_guide?: SizeGuide | null;
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
    images?: string[];
    newImages?: File[];
    short_description?: string;
    description?: string;
    price: number;
    sale_price?: number | null;
    stock: number;
    status: 'active' | 'inactive' | 'draft';
    is_featured: boolean;
    variants?: ProductVariants;
    size_guide?: SizeGuide | null;
};
