-- Add property_image_url field to safehouse_properties table
ALTER TABLE public.safehouse_properties 
ADD COLUMN property_image_url text NULL;

COMMENT ON COLUMN public.safehouse_properties.property_image_url IS 'URL of the property image stored in Supabase storage';

