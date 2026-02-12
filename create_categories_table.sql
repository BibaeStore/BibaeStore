-- Create 'categories' table
CREATE TABLE public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Create Policies (Adjust these based on your needs)

-- Allow public read access (everyone can see categories)
CREATE POLICY "Public Read Access"
ON public.categories FOR SELECT
USING (true);

-- Allow authenticated users to create/update/delete (admins)
CREATE POLICY "Admin Full Access"
ON public.categories FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Create storage bucket if it doesn't exist (you already did this, but good for completeness)
insert into storage.buckets (id, name, public)
values ('categories', 'categories', true)
on conflict (id) do nothing;
