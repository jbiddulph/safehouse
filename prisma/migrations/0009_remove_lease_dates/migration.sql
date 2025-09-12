-- Remove lease date columns from safehouse_contacts
ALTER TABLE public.safehouse_contacts 
DROP COLUMN IF EXISTS lease_start_date,
DROP COLUMN IF EXISTS lease_end_date;
