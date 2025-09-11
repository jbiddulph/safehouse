-- Rename profiles table to safehouse_profiles
alter table public.profiles rename to safehouse_profiles;

-- Update RLS policies to work with new table name
drop policy if exists "Select own profile" on safehouse_profiles;
create policy "Select own profile" on safehouse_profiles
  for select using ( auth.uid() = id );

drop policy if exists "Insert own profile" on safehouse_profiles;
create policy "Insert own profile" on safehouse_profiles
  for insert with check ( auth.uid() = id );

drop policy if exists "Update own profile" on safehouse_profiles;
create policy "Update own profile" on safehouse_profiles
  for update using ( auth.uid() = id );

-- Update the trigger to work with new table name
drop trigger if exists set_profiles_updated_at on safehouse_profiles;
create trigger set_safehouse_profiles_updated_at
before update on safehouse_profiles
for each row execute function public.set_updated_at();

-- Update the trigger function to work with safehouse_profiles
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.safehouse_profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;
