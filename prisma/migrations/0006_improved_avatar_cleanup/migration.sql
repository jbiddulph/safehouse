-- Drop the old trigger and function
DROP TRIGGER IF EXISTS on_user_delete_cleanup_avatar ON auth.users;
DROP FUNCTION IF EXISTS public.delete_user_avatar();

-- Create a new function that calls the cleanup API
CREATE OR REPLACE FUNCTION public.cleanup_user_avatar()
RETURNS TRIGGER AS $$
DECLARE
  cleanup_result jsonb;
BEGIN
  -- Call the cleanup API endpoint
  -- Note: This is a simplified approach. In production, you might want to use
  -- a background job queue or direct storage API calls
  PERFORM pg_notify('avatar_cleanup', OLD.id::text);
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER on_user_delete_cleanup_avatar
  BEFORE DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.cleanup_user_avatar();
