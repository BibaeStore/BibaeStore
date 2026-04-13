-- Run this in Supabase SQL Editor to add missing SEO columns to the products table.
-- These columns are required by the product creation form on the SEO branch.

ALTER TABLE products ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS meta_title text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS meta_description text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS keywords text[];

-- Unique index on slug for SEO-friendly URLs (only non-null slugs)
CREATE UNIQUE INDEX IF NOT EXISTS products_slug_unique ON products(slug) WHERE slug IS NOT NULL;
