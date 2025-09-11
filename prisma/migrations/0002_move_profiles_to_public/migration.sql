-- Move profiles table from safehouse schema to public schema
-- First, create the table in public schema
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Copy data from safehouse.profiles to public.profiles
insert into public.profiles (id, email, full_name, avatar_url, created_at, updated_at)
select id, email, full_name, avatar_url, created_at, updated_at
from safehouse.profiles
on conflict (id) do update set
  email = excluded.email,
  full_name = excluded.full_name,
  avatar_url = excluded.avatar_url,
  updated_at = excluded.updated_at;

-- Enable RLS on public.profiles
alter table public.profiles enable row level security;

-- Create RLS policies for public.profiles
drop policy if exists "Select own profile" on public.profiles;
create policy "Select own profile" on public.profiles
  for select using ( auth.uid() = id );

drop policy if exists "Insert own profile" on public.profiles;
create policy "Insert own profile" on public.profiles
  for insert with check ( auth.uid() = id );

drop policy if exists "Update own profile" on public.profiles;
create policy "Update own profile" on public.profiles
  for update using ( auth.uid() = id );

-- Create updated_at trigger for public.profiles
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- Update the trigger function to work with public.profiles
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
