export interface SizeStock {
    stock: number;
    enabled: boolean;
}

export interface ProductVariants {
    sizes?: Record<string, SizeStock>;
    colors?: string[];
}

export const ADULT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const;
export const KIDS_SIZES = ['0-3 M', '3-6 M', '6-12 M', '1-2 Yrs', '2-3 Yrs', '3-4 Yrs', '4-5 Yrs', '5-6 Yrs', '7-8 Yrs', '9-10 Yrs', '11-12 Yrs'] as const;

export const ALL_SIZES = [...ADULT_SIZES, ...KIDS_SIZES] as const;
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
    cost_price?: number | null;
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
        slug?: string;
    };
    slug?: string;
    meta_title?: string;
    meta_description?: string;
    keywords?: string[];
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
    cost_price?: number | null;
    stock: number;
    status: 'active' | 'inactive' | 'draft';
    is_featured: boolean;
    variants?: ProductVariants;
    size_guide?: SizeGuide | null;
};
