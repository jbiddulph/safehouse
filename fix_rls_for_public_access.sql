-- Fix RLS policies to allow public access for authentication purposes
-- This allows anonymous users to access profiles for auth state initialization

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.safehouse_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.safehouse_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.safehouse_profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.safehouse_profiles;

-- Ensure RLS is enabled
ALTER TABLE public.safehouse_profiles ENABLE ROW LEVEL SECURITY;

-- Create new policies that allow public read access but restrict writes to authenticated users
-- Policy for SELECT: Allow public read access (needed for auth state initialization)
CREATE POLICY "Public can view profiles" ON public.safehouse_profiles
  FOR SELECT USING (true);

-- Policy for INSERT: Only authenticated users can insert their own profile
CREATE POLICY "Authenticated users can insert their own profile" ON public.safehouse_profiles
  FOR INSERT WITH CHECK (auth.uid() = id AND auth.role() = 'authenticated');

-- Policy for UPDATE: Only authenticated users can update their own profile
CREATE POLICY "Authenticated users can update their own profile" ON public.safehouse_profiles
  FOR UPDATE USING (auth.uid() = id AND auth.role() = 'authenticated');

-- Policy for DELETE: Only authenticated users can delete their own profile
CREATE POLICY "Authenticated users can delete their own profile" ON public.safehouse_profiles
  FOR DELETE USING (auth.uid() = id AND auth.role() = 'authenticated');

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
