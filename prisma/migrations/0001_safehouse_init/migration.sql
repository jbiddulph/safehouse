-- Create schema
create schema if not exists safehouse;

-- Profiles table tied to Supabase auth.users
create table if not exists safehouse.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Ensure updated_at is maintained
create or replace function safehouse.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_profiles_updated_at on safehouse.profiles;
create trigger set_profiles_updated_at
before update on safehouse.profiles
for each row execute function safehouse.set_updated_at();

-- Enable RLS and policies
alter table safehouse.profiles enable row level security;

-- Allow users to select their own profile
drop policy if exists "Select own profile" on safehouse.profiles;
create policy "Select own profile" on safehouse.profiles
  for select using ( auth.uid() = id );

-- Allow users to insert their own profile (id must match auth.uid())
drop policy if exists "Insert own profile" on safehouse.profiles;
create policy "Insert own profile" on safehouse.profiles
  for insert with check ( auth.uid() = id );

-- Allow users to update their own profile
drop policy if exists "Update own profile" on safehouse.profiles;
create policy "Update own profile" on safehouse.profiles
  for update using ( auth.uid() = id );

-- Upsert helper: when a new user signs up, insert profile row if missing
create or replace function safehouse.handle_new_user()
returns trigger as $$
begin
  insert into safehouse.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function safehouse.handle_new_user();


