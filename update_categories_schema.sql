-- Add new columns to categories table
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Update existing rows if any to have valid defaults (already handled by DEFAULT, but good to be safe)
UPDATE public.categories SET status = 'active' WHERE status IS NULL;
UPDATE public.categories SET sort_order = 0 WHERE sort_order IS NULL;
