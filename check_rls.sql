-- Check current RLS policies on safehouse_profiles table
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
WHERE tablename = 'safehouse_profiles' 
AND schemaname = 'public';

-- Check if RLS is enabled on the table
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'safehouse_profiles' 
AND schemaname = 'public';