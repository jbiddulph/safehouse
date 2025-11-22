-- Add photo_url column to safehouse_properties table
ALTER TABLE public.safehouse_properties 
ADD COLUMN photo_url text;

