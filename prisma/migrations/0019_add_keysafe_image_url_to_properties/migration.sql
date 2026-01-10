-- Add keysafe_image_url field to safehouse_properties table
ALTER TABLE public.safehouse_properties 
ADD COLUMN keysafe_image_url text NULL;

COMMENT ON COLUMN public.safehouse_properties.keysafe_image_url IS 'URL of the keysafe location image stored in Supabase storage';

