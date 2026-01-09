-- Create newsletter table for email signups from coming-soon page
create table if not exists public.safehouse_newsletter (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create indexes
create index if not exists safehouse_newsletter_email_idx on public.safehouse_newsletter(email);
create index if not exists safehouse_newsletter_created_at_idx on public.safehouse_newsletter(created_at);

-- Create updated_at trigger
create or replace function public.set_newsletter_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_newsletter_updated_at on public.safehouse_newsletter;
create trigger set_newsletter_updated_at
before update on public.safehouse_newsletter
for each row execute function public.set_newsletter_updated_at();

-- Enable RLS (optional - you may want to allow public inserts but restrict selects)
alter table public.safehouse_newsletter enable row level security;

-- Allow public to insert (for newsletter signups)
drop policy if exists "Allow public newsletter signups" on public.safehouse_newsletter;
create policy "Allow public newsletter signups" on public.safehouse_newsletter
  for insert with check (true);

-- Only allow authenticated users to view newsletter signups (admin access)
drop policy if exists "Allow authenticated users to view newsletter" on public.safehouse_newsletter;
create policy "Allow authenticated users to view newsletter" on public.safehouse_newsletter
  for select using (auth.uid() is not null);


