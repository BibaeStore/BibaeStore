export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    // Allows to automatically instantiate createClient with right options
    // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
    __InternalSupabase: {
        PostgrestVersion: "14.1"
    }
    public: {
        Tables: {
            blog_posts: {
                Row: {
                    author: string | null
                    category: string | null
                    content: string | null
                    cover_image: string | null
                    created_at: string | null
                    excerpt: string | null
                    id: string
                    keywords: string[] | null
                    meta_description: string | null
                    meta_title: string | null
                    published_at: string | null
                    slug: string
                    status: string | null
                    title: string
                    updated_at: string | null
                }
                Insert: {
                    author?: string | null
                    category?: string | null
                    content?: string | null
                    cover_image?: string | null
                    created_at?: string | null
                    excerpt?: string | null
                    id?: string
                    keywords?: string[] | null
                    meta_description?: string | null
                    meta_title?: string | null
                    published_at?: string | null
                    slug: string
                    status?: string | null
                    title: string
                    updated_at?: string | null
                }
                Update: {
                    author?: string | null
                    category?: string | null
                    content?: string | null
                    cover_image?: string | null
                    created_at?: string | null
                    excerpt?: string | null
                    id?: string
                    keywords?: string[] | null
                    meta_description?: string | null
                    meta_title?: string | null
                    published_at?: string | null
                    slug?: string
                    status?: string | null
                    title?: string
                    updated_at?: string | null
                }
                Relationships: []
            }
            cart: {
                Row: {
                    client_id: string
                    created_at: string | null
                    id: string
                    product_id: string
                    quantity: number
                }
                Insert: {
                    client_id: string
                    created_at?: string | null
                    id?: string
                    product_id: string
                    quantity?: number
                }
                Update: {
                    client_id?: string
                    created_at?: string | null
                    id?: string
                    product_id?: string
                    quantity?: number
                }
                Relationships: [
                    {
                        foreignKeyName: "cart_client_id_fkey"
                        columns: ["client_id"]
                        isOneToOne: false
                        referencedRelation: "clients"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "cart_product_id_fkey"
                        columns: ["product_id"]
                        isOneToOne: false
                        referencedRelation: "products"
                        referencedColumns: ["id"]
                    },
                ]
            }
            categories: {
                Row: {
                    created_at: string | null
                    description: string | null
                    id: string
                    image_url: string | null
                    meta_description: string | null
                    meta_title: string | null
                    name: string
                    parent_id: string | null
                    slug: string | null
                    sort_order: number | null
                    status: string | null
                    updated_at: string | null
                }
                Insert: {
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    image_url?: string | null
                    meta_description?: string | null
                    meta_title?: string | null
                    name: string
                    parent_id?: string | null
                    slug?: string | null
                    sort_order?: number | null
                    status?: string | null
                    updated_at?: string | null
                }
                Update: {
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    image_url?: string | null
                    meta_description?: string | null
                    meta_title?: string | null
                    name?: string
                    parent_id?: string | null
                    slug?: string | null
                    sort_order?: number | null
                    status?: string | null
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "categories_parent_id_fkey"
                        columns: ["parent_id"]
                        isOneToOne: false
                        referencedRelation: "categories"
                        referencedColumns: ["id"]
                    },
                ]
            }
            clients: {
                Row: {
                    created_at: string | null
                    email: string
                    full_name: string
                    id: string
                    phone_number: string | null
                    profile_image_url: string | null
                    updated_at: string | null
                }
                Insert: {
                    created_at?: string | null
                    email: string
                    full_name: string
                    id: string
                    phone_number?: string | null
                    profile_image_url?: string | null
                    updated_at?: string | null
                }
                Update: {
                    created_at?: string | null
                    email?: string
                    full_name?: string
                    id?: string
                    phone_number?: string | null
                    profile_image_url?: string | null
                    updated_at?: string | null
                }
                Relationships: []
            }
            order_items: {
                Row: {
                    color: string | null
                    created_at: string | null
                    id: string
                    order_id: string
                    price: number
                    product_id: string
                    quantity: number
                    size: string | null
                }
                Insert: {
                    color?: string | null
                    created_at?: string | null
                    id?: string
                    order_id: string
                    price: number
                    product_id: string
                    quantity: number
                    size?: string | null
                }
                Update: {
                    color?: string | null
                    created_at?: string | null
                    id?: string
                    order_id?: string
                    price?: number
                    product_id?: string
                    quantity?: number
                    size?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "order_items_order_id_fkey"
                        columns: ["order_id"]
                        isOneToOne: false
                        referencedRelation: "orders"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "order_items_product_id_fkey"
                        columns: ["product_id"]
                        isOneToOne: false
                        referencedRelation: "products"
                        referencedColumns: ["id"]
                    },
                ]
            }
            orders: {
                Row: {
                    admin_notes: string | null
                    cancellation_reason: string | null
                    cancellation_requested: boolean | null
                    client_id: string | null
                    coupon_code: string | null
                    created_at: string | null
                    discount_amount: number | null
                    guest_email: string | null
                    guest_name: string | null
                    guest_phone: string | null
                    id: string
                    payment_method: string | null
                    payment_proof_url: string | null
                    payment_status: string | null
                    shipping_address: string | null
                    status: string
                    status_history: Json | null
                    total_amount: number
                    tracking_number: string | null
                    updated_at: string | null
                }
                Insert: {
                    admin_notes?: string | null
                    cancellation_reason?: string | null
                    cancellation_requested?: boolean | null
                    client_id?: string | null
                    coupon_code?: string | null
                    created_at?: string | null
                    discount_amount?: number | null
                    guest_email?: string | null
                    guest_name?: string | null
                    guest_phone?: string | null
                    id?: string
                    payment_method?: string | null
                    payment_proof_url?: string | null
                    payment_status?: string | null
                    shipping_address?: string | null
                    status?: string
                    status_history?: Json | null
                    total_amount: number
                    tracking_number?: string | null
                    updated_at?: string | null
                }
                Update: {
                    admin_notes?: string | null
                    cancellation_reason?: string | null
                    cancellation_requested?: boolean | null
                    client_id?: string | null
                    coupon_code?: string | null
                    created_at?: string | null
                    discount_amount?: number | null
                    guest_email?: string | null
                    guest_name?: string | null
                    guest_phone?: string | null
                    id?: string
                    payment_method?: string | null
                    payment_proof_url?: string | null
                    payment_status?: string | null
                    shipping_address?: string | null
                    status?: string
                    status_history?: Json | null
                    total_amount?: number
                    tracking_number?: string | null
                    updated_at?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "orders_client_id_fkey"
                        columns: ["client_id"]
                        isOneToOne: false
                        referencedRelation: "clients"
                        referencedColumns: ["id"]
                    },
                ]
            }
            products: {
                Row: {
                    category_id: string | null
                    created_at: string | null
                    description: string | null
                    id: string
                    images: string[] | null
                    is_featured: boolean | null
                    keywords: string[] | null
                    meta_description: string | null
                    meta_title: string | null
                    name: string
                    price: number
                    sale_price: number | null
                    short_description: string | null
                    size_guide: Json | null
                    sku: string
                    slug: string | null
                    status: string | null
                    stock: number | null
                    updated_at: string | null
                    variants: Json | null
                }
                Insert: {
                    category_id?: string | null
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    images?: string[] | null
                    is_featured?: boolean | null
                    keywords?: string[] | null
                    meta_description?: string | null
                    meta_title?: string | null
                    name: string
                    price: number
                    sale_price?: number | null
                    short_description?: string | null
                    size_guide?: Json | null
                    sku: string
                    slug?: string | null
                    status?: string | null
                    stock?: number | null
                    updated_at?: string | null
                    variants?: Json | null
                }
                Update: {
                    category_id?: string | null
                    created_at?: string | null
                    description?: string | null
                    id?: string
                    images?: string[] | null
                    is_featured?: boolean | null
                    keywords?: string[] | null
                    meta_description?: string | null
                    meta_title?: string | null
                    name?: string
                    price?: number
                    sale_price?: number | null
                    short_description?: string | null
                    size_guide?: Json | null
                    sku?: string
                    slug?: string | null
                    status?: string | null
                    stock?: number | null
                    updated_at?: string | null
                    variants?: Json | null
                }
                Relationships: [
                    {
                        foreignKeyName: "products_category_id_fkey"
                        columns: ["category_id"]
                        isOneToOne: false
                        referencedRelation: "categories"
                        referencedColumns: ["id"]
                    },
                ]
            }
            ratings: {
                Row: {
                    client_id: string
                    comment: string | null
                    created_at: string | null
                    id: string
                    product_id: string
                    rating: number
                }
                Insert: {
                    client_id: string
                    comment?: string | null
                    created_at?: string | null
                    id?: string
                    product_id: string
                    rating: number
                }
                Update: {
                    client_id?: string
                    comment?: string | null
                    created_at?: string | null
                    id?: string
                    product_id?: string
                    rating?: number
                }
                Relationships: [
                    {
                        foreignKeyName: "ratings_client_id_fkey"
                        columns: ["client_id"]
                        isOneToOne: false
                        referencedRelation: "clients"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "ratings_product_id_fkey"
                        columns: ["product_id"]
                        isOneToOne: false
                        referencedRelation: "products"
                        referencedColumns: ["id"]
                    },
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            place_order: {
                Args: {
                    p_client_id: string
                    p_items: Json
                    p_payment_method?: string
                    p_payment_proof_url?: string
                    p_shipping_address: string
                    p_total_amount: number
                }
                Returns: Json
            }
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
    DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
    }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
}
    ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
            Row: infer R
        }
    ? R
    : never
    : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
            Row: infer R
        }
    ? R
    : never
    : never

export type TablesInsert<
    DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
    }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
}
    ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Insert: infer I
    }
    ? I
    : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
    }
    ? I
    : never
    : never

export type TablesUpdate<
    DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
    TableName extends DefaultSchemaTableNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
    }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
}
    ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Update: infer U
    }
    ? U
    : never
    : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
    }
    ? U
    : never
    : never

export type Enums<
    DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
    EnumName extends DefaultSchemaEnumNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
    }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
}
    ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
    PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
    CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
        schema: keyof DatabaseWithoutInternals
    }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
}
    ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
    : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
    public: {
        Enums: {},
    },
} as const
