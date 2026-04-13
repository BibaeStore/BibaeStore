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

export interface StatusHistoryEntry {
    status: string;
    timestamp: string;
    note?: string;
}

export interface Order {
    id: string;
    client_id: string | null;
    total_amount: number;
    status: 'pending' | 'under_review' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    payment_method?: 'cod' | 'online';
    payment_proof_url?: string;
    shipping_address?: string;
    tracking_number?: string;
    payment_status?: 'pending' | 'under_review' | 'verified' | 'rejected';
    admin_notes?: string;
    status_history?: StatusHistoryEntry[];
    cancellation_requested?: boolean;
    cancellation_reason?: string;
    discount_amount?: number;
    coupon_code?: string;
    guest_email?: string;
    guest_name?: string;
    guest_phone?: string;
    created_at?: string;
    updated_at?: string;
    items?: OrderItem[];
    client?: {
        full_name: string;
        email: string;
        phone_number?: string;
    };
}

export interface OrderItem {
    id: string;
    order_id: string;
    product_id: string;
    quantity: number;
    price: number;
    size?: string;
    color?: string;
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
