export interface Client {
    id: string;
    full_name: string;
    email: string;
    phone_number?: string;
    profile_image_url?: string;
    created_at?: string;
    updated_at?: string;
}

export interface CartItem {
    id: string;
    client_id: string;
    product_id: string;
    quantity: number;
    created_at?: string;
    product?: any; // For joined data
}

export interface Order {
    id: string;
    client_id: string;
    total_amount: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    shipping_address?: string;
    created_at?: string;
    updated_at?: string;
    items?: OrderItem[];
}

export interface OrderItem {
    id: string;
    order_id: string;
    product_id: string;
    quantity: number;
    price: number;
    created_at?: string;
}

export interface Rating {
    id: string;
    client_id: string;
    product_id: string;
    rating: number;
    comment?: string;
    created_at?: string;
    client?: Client;
}
