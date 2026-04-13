-- 1. Create the admin_logs table to track all administrative actions
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- e.g., 'CREATE', 'UPDATE', 'DELETE', 'APPROVE'
  entity TEXT NOT NULL,      -- e.g., 'PRODUCT', 'ORDER', 'CATEGORY', 'CLIENT'
  entity_id TEXT NOT NULL,   -- The ID of the item being modified
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB             -- Useful for storing "before" and "after" states or specific notes
);

-- 2. Enable Row Level Security
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies if any
DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins can read all logs" ON public.admin_logs;
  DROP POLICY IF EXISTS "Admins can insert logs" ON public.admin_logs;
EXCEPTION
  WHEN undefined_object THEN null;
END $$;

-- 4. Create Policies: Only admins can view the logs, but they can't modify/delete them once created (append-only)
CREATE POLICY "Admins can read all logs" ON public.admin_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert logs" ON public.admin_logs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- No UPDATE or DELETE policies. Audit logs must be immutable!
