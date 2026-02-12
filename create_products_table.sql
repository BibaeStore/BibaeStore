-- Create 'products' table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    sku TEXT UNIQUE NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    images TEXT[] DEFAULT '{}', -- Array of image URLs
    short_description TEXT,
    description TEXT,
    price NUMERIC NOT NULL,
    sale_price NUMERIC,
    stock INTEGER DEFAULT 0,
    status TEXT DEFAULT 'draft' CHECK (status IN ('active', 'inactive', 'draft')),
    is_featured BOOLEAN DEFAULT false,
    variants JSONB DEFAULT '{}'::jsonb, -- For simple variants (size, color, etc.)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Policies for Products Table
-- Public Read Access
CREATE POLICY "Public Read Access"
ON public.products FOR SELECT
USING (true);

-- Admin Full Access
CREATE POLICY "Admin Full Access"
ON public.products FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);


-- Storage Bucket Policies for 'products' bucket
-- Note: Create the bucket 'products' manually in Supabase Storage if it doesn't exist, or use the API.
-- RLS Policies for Storage Objects in 'products' bucket

-- Allow public read access to product images
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'products' );

-- Allow authenticated users to upload/update/delete product images
CREATE POLICY "Authenticated Upload Access"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'products' );

CREATE POLICY "Authenticated Update Access"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'products' );

CREATE POLICY "Authenticated Delete Access"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'products' );
