-- Fix RLS policies for safehouse_profiles table
-- First, let's see what policies exist
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'safehouse_profiles';

-- Drop existing policies and recreate them
DROP POLICY IF EXISTS "Select own profile" ON public.safehouse_profiles;
DROP POLICY IF EXISTS "Insert own profile" ON public.safehouse_profiles;
DROP POLICY IF EXISTS "Update own profile" ON public.safehouse_profiles;

-- Create new RLS policies
CREATE POLICY "Select own profile" ON public.safehouse_profiles
  FOR SELECT USING ( auth.uid() = id );

CREATE POLICY "Insert own profile" ON public.safehouse_profiles
  FOR INSERT WITH CHECK ( auth.uid() = id );

CREATE POLICY "Update own profile" ON public.safehouse_profiles
  FOR UPDATE USING ( auth.uid() = id );

-- Verify the policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'safehouse_profiles';
