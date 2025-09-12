-- Drop all existing RLS policies on safehouse_profiles
DROP POLICY IF EXISTS "Users can view their own profile." ON public.safehouse_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.safehouse_profiles;
DROP POLICY IF EXISTS "Users can update own profile." ON public.safehouse_profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.safehouse_profiles;

-- Ensure RLS is enabled
ALTER TABLE public.safehouse_profiles ENABLE ROW LEVEL SECURITY;

-- Create comprehensive RLS policies
-- Policy for SELECT: Users can view their own profile
CREATE POLICY "Users can view their own profile" ON public.safehouse_profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy for INSERT: Users can insert their own profile
CREATE POLICY "Users can insert their own profile" ON public.safehouse_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Policy for UPDATE: Users can update their own profile
CREATE POLICY "Users can update their own profile" ON public.safehouse_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policy for DELETE: Users can delete their own profile (if needed)
CREATE POLICY "Users can delete their own profile" ON public.safehouse_profiles
  FOR DELETE USING (auth.uid() = id);

-- Verify the policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'safehouse_profiles' 
AND schemaname = 'public';
