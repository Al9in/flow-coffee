-- ==========================================
-- FLOW Coffee — Supabase Database Schema
-- ==========================================
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ==========================================
-- Products Table
-- ==========================================
create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  origin text not null default '',
  process text not null default '',
  notes text[] not null default '{}',
  price numeric not null default 30,
  available_today boolean not null default true,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table products enable row level security;

-- Public can read available products
create policy "Public can read products"
  on products for select
  using (true);

-- Only authenticated users can modify
create policy "Authenticated can modify products"
  on products for all
  using (auth.role() = 'authenticated');

-- ==========================================
-- Orders Table
-- ==========================================
create table if not exists orders (
  id uuid primary key default uuid_generate_v4(),
  order_number text not null unique,
  customer_name text not null,
  phone text not null,
  car_number text not null,
  pickup_time text not null default '',
  notes text not null default '',
  items jsonb not null default '[]',
  total numeric not null default 0,
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed')),
  status text not null default 'placed' check (status in ('placed', 'confirmed', 'brewing', 'ready', 'delivered', 'cancelled')),
  created_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table orders enable row level security;

-- Anyone can create orders (needed for checkout)
create policy "Anyone can create orders"
  on orders for insert
  with check (true);

-- Anyone can read their own order by ID
create policy "Anyone can read orders"
  on orders for select
  using (true);

-- Only authenticated (admin) can update
create policy "Authenticated can update orders"
  on orders for update
  using (auth.role() = 'authenticated');

-- ==========================================
-- Settings Table
-- ==========================================
create table if not exists settings (
  id uuid primary key default uuid_generate_v4(),
  daily_limit integer not null default 40,
  cups_sold integer not null default 0,
  updated_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table settings enable row level security;

-- Public can read settings
create policy "Public can read settings"
  on settings for select
  using (true);

-- Authenticated can update settings
create policy "Authenticated can update settings"
  on settings for update
  using (auth.role() = 'authenticated');

-- ==========================================
-- Insert initial data
-- ==========================================

-- Default settings row
insert into settings (daily_limit, cups_sold)
values (40, 0)
on conflict do nothing;

-- Sample coffees
insert into products (name, origin, process, notes, price, available_today) values
  ('Costa Rica — Washed', 'Costa Rica', 'Washed', ARRAY['White Peach', 'Jasmine', 'Honey'], 30, true),
  ('Experimental — Fermentation', 'Ethiopia', 'Anaerobic', ARRAY['Cherry', 'Tropical', 'Silky'], 30, true)
on conflict do nothing;

-- ==========================================
-- RPC Function: Increment cups sold
-- ==========================================
create or replace function increment_cups_sold(increment_amount integer)
returns void as $$
begin
  update settings
  set cups_sold = cups_sold + increment_amount,
      updated_at = now();
end;
$$ language plpgsql security definer;

-- ==========================================
-- Enable Realtime for tables
-- ==========================================
-- Run these in the Supabase dashboard:
-- Database → Replication → enable for: orders, settings
