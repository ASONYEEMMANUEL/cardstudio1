create extension if not exists "pgcrypto";

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  phone text not null,
  email text not null,
  template text not null,
  color text not null,
  pattern text not null,
  card_label text,
  image_url text,
  status text not null default 'pending'
    check (
      status in (
        'pending',
        'in_production',
        'completed',
        'cancelled'
      )
    ),
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;

grant insert on table public.orders to anon;

drop policy if exists "Anyone can submit an order"
on public.orders;

create policy "Anyone can submit an order"
on public.orders
for insert
to anon
with check (true);