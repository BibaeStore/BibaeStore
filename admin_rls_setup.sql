-- IMPORTANT: This script applies "Admin Full Access" to your store's core tables.
-- Now that you have safely deprecated the "Service Role Key" in the frontend,
-- your database is responsible for securing your data.

-- Note: We assume these tables exist: products, categories, orders, order_items, clients.
-- We also assume the `profiles` table is set up from the previous script.

-- 1. Enable RLS on core tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing Admin policies if they exist (to allow safe re-runs)
DO $$ BEGIN
  DROP POLICY IF EXISTS "Admin full access" ON public.products;
  DROP POLICY IF EXISTS "Admin full access" ON public.categories;
  DROP POLICY IF EXISTS "Admin full access" ON public.orders;
  DROP POLICY IF EXISTS "Admin full access" ON public.order_items;
  DROP POLICY IF EXISTS "Admin full access" ON public.clients;
EXCEPTION
  WHEN undefined_object THEN null;
END $$;


-- 3. Create the "Admin Full Access" Policies using the secure Profiles check
-- Products
CREATE POLICY "Admin full access" ON public.products
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Categories
CREATE POLICY "Admin full access" ON public.categories
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Orders
CREATE POLICY "Admin full access" ON public.orders
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Order Items
CREATE POLICY "Admin full access" ON public.order_items
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

-- Clients
CREATE POLICY "Admin full access" ON public.clients
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);


-- 4. Public Read Access (Crucial so customers can actually see your shop)
DO $$ BEGIN
  DROP POLICY IF EXISTS "Public can view active products" ON public.products;
  DROP POLICY IF EXISTS "Public can view active categories" ON public.categories;
EXCEPTION
  WHEN undefined_object THEN null;
END $$;

CREATE POLICY "Public can view active products" ON public.products
FOR SELECT USING (
  status = 'active'
);

CREATE POLICY "Public can view active categories" ON public.categories
FOR SELECT USING (
  status = 'active'
);

-- Note: Orders/Clients/Order Items do NOT get public access. 
-- Regular users should only see their own orders (if you have standard User Auth later),
-- but assuming your checkout is guest-based, you might configure those differently.
