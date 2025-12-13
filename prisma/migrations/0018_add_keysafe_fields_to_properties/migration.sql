-- Add keysafe fields to safehouse_properties table
alter table public.safehouse_properties
  add column if not exists keysafe_location text,
  add column if not exists keysafe_code text,
  add column if not exists keysafe_notes text,
  add column if not exists keysafe_code_updated_at timestamptz(6),
  add column if not exists keysafe_what3words text,
  add column if not exists keysafe_latitude decimal(10, 8),
  add column if not exists keysafe_longitude decimal(11, 8);

-- Add comment to explain the fields
comment on column public.safehouse_properties.keysafe_location is 'Location description of the keysafe (e.g., "Front door", "Garage")';
comment on column public.safehouse_properties.keysafe_code is 'The code to access the keysafe';
comment on column public.safehouse_properties.keysafe_notes is 'Additional notes about the keysafe';
comment on column public.safehouse_properties.keysafe_code_updated_at is 'When the keysafe code was last updated';
comment on column public.safehouse_properties.keysafe_what3words is 'What 3 Words location for the keysafe (e.g., "///filled.count.soap")';
comment on column public.safehouse_properties.keysafe_latitude is 'Latitude of the keysafe location';
comment on column public.safehouse_properties.keysafe_longitude is 'Longitude of the keysafe location';

