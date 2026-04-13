export interface Category {
    id: string;
    name: string;
    slug: string | null;
    parent_id: string | null;
    image_url: string | null;
    description: string | null;
    meta_title: string | null;
    meta_description: string | null;
    status: 'active' | 'inactive';
    sort_order: number;
    created_at?: string;
    updated_at?: string;
    subcategories?: Category[]; // For frontend tree structure
}

export type CategoryFormData = {
    name: string;
    parent_id: string | null;
    image_url: string | null;
    imageFile?: File | null;
    status: 'active' | 'inactive';
    sort_order: number;
};
