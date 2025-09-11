-- Safely rename the existing profiles table to safehouse_profiles
-- This preserves all existing data and structure
ALTER TABLE public.profiles RENAME TO safehouse_profiles;

-- Update RLS policies to work with new table name
DROP POLICY IF EXISTS "Select own profile" ON safehouse_profiles;
CREATE POLICY "Select own profile" ON safehouse_profiles
  FOR SELECT USING ( auth.uid() = id );

DROP POLICY IF EXISTS "Insert own profile" ON safehouse_profiles;
CREATE POLICY "Insert own profile" ON safehouse_profiles
  FOR INSERT WITH CHECK ( auth.uid() = id );

DROP POLICY IF EXISTS "Update own profile" ON safehouse_profiles;
CREATE POLICY "Update own profile" ON safehouse_profiles
  FOR UPDATE USING ( auth.uid() = id );

-- Update the trigger to work with new table name
DROP TRIGGER IF EXISTS set_profiles_updated_at ON safehouse_profiles;
CREATE TRIGGER set_safehouse_profiles_updated_at
BEFORE UPDATE ON safehouse_profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Update the trigger function to work with safehouse_profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.safehouse_profiles (id, email)
  VALUES (new.id, new.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
