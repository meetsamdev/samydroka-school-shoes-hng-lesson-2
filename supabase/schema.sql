-- Run this in Supabase SQL Editor.
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  customer_email text not null,
  phone text not null,
  address text not null,
  items jsonb not null,
  total numeric(12,2) not null check (total >= 0),
  status text not null default 'confirmed',
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;

drop policy if exists "Users can read own orders" on public.orders;
create policy "Users can read own orders" on public.orders for select using (auth.uid() = user_id);

drop policy if exists "Users can create own orders" on public.orders;
create policy "Users can create own orders" on public.orders for insert with check (auth.uid() = user_id);

create index if not exists orders_user_id_created_at_idx on public.orders(user_id, created_at desc);
