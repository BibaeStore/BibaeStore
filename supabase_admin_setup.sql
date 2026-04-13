-- 1. Create the profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'staff')),
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Activating Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Creating security policies to ensure security is not exposed
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- 4. Admin full access across the system (Example: enable this for your other tables!)
-- CREATE POLICY "Admin full access" ON products
-- FOR ALL USING (
--   EXISTS (
--     SELECT 1 FROM profiles 
--     WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
--   )
-- );

-- 5. Auto-Create Profile Trigger (Optional but recommended)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 6. Important: Force inject your current admin email into the profiles table so you have access!
-- Warning: Replace 'bibaestore@gmail.com' with your exact login email if different
INSERT INTO public.profiles (id, role, full_name)
SELECT id, 'admin', 'Store Admin'
FROM auth.users
WHERE email = 'bibaestore@gmail.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';
