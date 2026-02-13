-- Create clients table
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone_number TEXT,
    profile_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note: Password is managed by Supabase Auth (auth.users) for security.

-- Create cart table
CREATE TABLE IF NOT EXISTS public.cart (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(client_id, product_id)
);

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE SET NULL,
    total_amount NUMERIC NOT NULL CHECK (total_amount >= 0),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    shipping_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price NUMERIC NOT NULL CHECK (price >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ratings table
CREATE TABLE IF NOT EXISTS public.ratings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(client_id, product_id)
);

-- Enable RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Clients: Users can see and update only their own profile
CREATE POLICY "Users can view own profile" ON public.clients FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.clients FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Public profiles are viewable" ON public.clients FOR SELECT USING (true);

-- Cart: Users can manage their own cart
CREATE POLICY "Users can manage own cart" ON public.cart FOR ALL USING (auth.uid() = client_id);

-- Orders: Users can see their own orders
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Users can create own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = client_id);

-- Order Items: Users can see items of their own orders
CREATE POLICY "Users can view own order items" ON public.order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE id = public.order_items.order_id AND client_id = auth.uid())
);

-- Ratings: Everyone can see ratings, but only logged-in users can rate (once per product)
CREATE POLICY "Public view ratings" ON public.ratings FOR SELECT USING (true);
CREATE POLICY "Users can rate products" ON public.ratings FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Users can update own ratings" ON public.ratings FOR UPDATE USING (auth.uid() = client_id);

-- Storage Bucket: client-profiles
-- Note: Create the bucket 'client-profiles' manually in Supabase Storage.
-- (Or use the SQL below if you have permissions to storage schema)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('client-profiles', 'client-profiles', true);

CREATE POLICY "Public Read Profiles" ON storage.objects FOR SELECT USING (bucket_id = 'client-profiles');
CREATE POLICY "Users Upload Profile Pic" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'client-profiles' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users Update Profile Pic" ON storage.objects FOR UPDATE USING (bucket_id = 'client-profiles' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_clients BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at_orders BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger to create client on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.clients (id, full_name, email, phone_number)
    VALUES (
        NEW.id, 
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''), 
        NEW.email,
        NEW.raw_user_meta_data->>'phone_number'
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        phone_number = EXCLUDED.phone_number,
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
