-- Create function to delete avatar when user is deleted
CREATE OR REPLACE FUNCTION public.delete_user_avatar()
RETURNS TRIGGER AS $$
DECLARE
  avatar_path text;
BEGIN
  -- Get the avatar URL from the profile
  SELECT avatar_url INTO avatar_path
  FROM public.safehouse_profiles
  WHERE id = OLD.id;
  
  -- If there's an avatar, delete it from storage
  IF avatar_path IS NOT NULL THEN
    -- Extract the file path from the URL
    -- The URL format is: https://[project].supabase.co/storage/v1/object/public/safehouse/avatar/[filename]
    -- We need to extract: avatar/[filename]
    avatar_path := substring(avatar_path from 'avatar/[^/]+$');
    
    -- Delete from storage (this requires the storage API, but we'll log it for now)
    -- In a real implementation, you'd call the Supabase storage API here
    RAISE NOTICE 'Avatar to delete: %', avatar_path;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to run when a user is deleted
DROP TRIGGER IF EXISTS on_user_delete_cleanup_avatar ON auth.users;
CREATE TRIGGER on_user_delete_cleanup_avatar
  BEFORE DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.delete_user_avatar();
