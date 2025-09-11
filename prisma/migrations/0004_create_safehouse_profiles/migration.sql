-- Create safehouse_profiles table for Supabase access
-- This is a copy of the existing profiles table but with safehouse_ prefix
CREATE TABLE IF NOT EXISTS public.safehouse_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE,
  full_name text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on safehouse_profiles
ALTER TABLE public.safehouse_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for safehouse_profiles
DROP POLICY IF EXISTS "Select own profile" ON public.safehouse_profiles;
CREATE POLICY "Select own profile" ON public.safehouse_profiles
  FOR SELECT USING ( auth.uid() = id );

DROP POLICY IF EXISTS "Insert own profile" ON public.safehouse_profiles;
CREATE POLICY "Insert own profile" ON public.safehouse_profiles
  FOR INSERT WITH CHECK ( auth.uid() = id );

DROP POLICY IF EXISTS "Update own profile" ON public.safehouse_profiles;
CREATE POLICY "Update own profile" ON public.safehouse_profiles
  FOR UPDATE USING ( auth.uid() = id );

-- Create updated_at trigger for safehouse_profiles
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_safehouse_profiles_updated_at ON public.safehouse_profiles;
CREATE TRIGGER set_safehouse_profiles_updated_at
BEFORE UPDATE ON public.safehouse_profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Create trigger function to auto-create profile on user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.safehouse_profiles (id, email)
  VALUES (new.id, new.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
