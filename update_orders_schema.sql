-- Create new migration file to update orders table
/*
  Step 1: Make client_id nullable to support Guest Checkout
  Step 2: Add payment, guest info, and status history columns
*/

-- Make client_id nullable
ALTER TABLE public.orders 
ALTER COLUMN client_id DROP NOT NULL;

-- Add Guest Information
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS guest_name TEXT,
ADD COLUMN IF NOT EXISTS guest_email TEXT,
ADD COLUMN IF NOT EXISTS guest_phone TEXT;

-- Add Payment Information
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'cod',
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_proof_url TEXT;

-- Add Order Management & History
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS status_history JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS cancellation_requested BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
ADD COLUMN IF NOT EXISTS admin_notes TEXT,
ADD COLUMN IF NOT EXISTS tracking_number TEXT;

-- Add Indexes for searching/filtering
CREATE INDEX IF NOT EXISTS idx_orders_guest_email ON public.orders(guest_email);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_tracking ON public.orders(tracking_number);

-- Update RLS Policies for Orders to allow Guest Access (by order ID/email match?)

-- Storage Bucket: orders (for payment proof)
-- Need to insert into storage.buckets if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('orders', 'orders', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users (creating order) to upload proof
CREATE POLICY "Users can upload payment proof" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'orders');

-- Also allow anon users to upload proof (guest checkout)
CREATE POLICY "Guests can upload payment proof" 
ON storage.objects FOR INSERT 
TO public 
WITH CHECK (bucket_id = 'orders');

-- Allow everyone to view proofs (since getPublicUrl is used)
-- Ideally this should be restricted, but for current implementation:
CREATE POLICY "Public view of proofs" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'orders');


DROP POLICY IF EXISTS "Users can create own orders" ON public.orders;
CREATE POLICY "Enable insert for authenticated and anon users" 
ON public.orders FOR INSERT 
WITH CHECK (
    -- Allow if authenticated user matches client_id OR if it's a guest order (client_id is null)
    (auth.uid() = client_id) OR (client_id IS NULL)
);

-- Note: Guest viewing logic usually requires a secure token or session, which is complex.
-- For now, guests can only create orders. Tracking page will need a special function or secure token.

-- Add size and color to order_items
ALTER TABLE public.order_items
ADD COLUMN IF NOT EXISTS size TEXT,
ADD COLUMN IF NOT EXISTS color TEXT;
