create extension if not exists "pgcrypto";

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null,
  price numeric not null check (price >= 0),
  listing_type text not null check (listing_type in ('Sale', 'Rent')),
  property_type text not null check (property_type in ('House', 'Apartment', 'Land', 'Commercial')),
  status text not null default 'Available' check (status in ('Available', 'Under Offer', 'Sold', 'Rented')),
  location text not null,
  city text not null,
  area_size text not null,
  bedrooms integer not null default 0 check (bedrooms >= 0),
  bathrooms integer not null default 0 check (bathrooms >= 0),
  floors integer not null default 0 check (floors >= 0),
  parking_spaces integer not null default 0 check (parking_spaces >= 0),
  road_access text,
  facing_direction text,
  amenities text[] not null default '{}',
  image_urls text[] not null default '{}',
  featured_image text,
  is_featured boolean not null default false,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  name text not null,
  phone text not null,
  email text,
  message text not null,
  status text not null default 'New' check (status in ('New', 'Contacted', 'Closed')),
  created_at timestamptz not null default now()
);

create index if not exists properties_listing_lookup_idx on public.properties (is_published, property_type, listing_type, price);
create index if not exists properties_location_idx on public.properties (location);
create index if not exists inquiries_status_created_idx on public.inquiries (status, created_at desc);

alter table public.properties enable row level security;
alter table public.inquiries enable row level security;

drop policy if exists "Public can view published properties" on public.properties;
create policy "Public can view published properties"
  on public.properties for select
  to anon, authenticated
  using (is_published = true);

drop policy if exists "Public can create inquiries" on public.inquiries;
create policy "Public can create inquiries"
  on public.inquiries for insert
  to anon, authenticated
  with check (true);

create or replace function public.set_updated_at()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists properties_set_updated_at on public.properties;
create trigger properties_set_updated_at
  before update on public.properties
  for each row execute procedure public.set_updated_at();
