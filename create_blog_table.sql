/*
  Step 1: Create 'blog_posts' table for TOFU content
*/
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT, -- Rich text content (HTML/MarkDown)
    cover_image TEXT,
    author TEXT DEFAULT 'Bibae Team',
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    
    -- SEO Fields
    meta_title TEXT,
    meta_description TEXT,
    keywords TEXT[],
    
    -- Funnel/Category Mapping
    category TEXT DEFAULT 'General', -- e.g., 'Guides', 'News', 'Tips'
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public Read Access"
ON public.blog_posts FOR SELECT
USING (status = 'published');

CREATE POLICY "Admin Full Access"
ON public.blog_posts FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_blog_slug ON public.blog_posts(slug);
