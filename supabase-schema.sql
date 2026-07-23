-- Run this in your Supabase SQL Editor

create table artworks (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  category text not null,
  medium text,
  price numeric,
  availability text default 'Available',
  description text,
  image_url text,
  featured boolean default false,
  show_in_hero boolean default false,
  created_at timestamptz default now()
);

create table blog_posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text unique not null,
  excerpt text,
  cover_image_url text,
  content text,
  published boolean default false,
  created_at timestamptz default now()
);

create table orders (
  id uuid default gen_random_uuid() primary key,
  buyer_name text,
  buyer_email text,
  artwork_id uuid references artworks(id),
  artwork_title text,
  amount numeric,
  status text default 'Pending',
  created_at timestamptz default now()
);

-- Allow public read on artworks and published blog posts.
-- Everything else (insert/update/delete on any of these tables, and all access to
-- `orders`) is intentionally left with NO policy. RLS defaults to deny when a table
-- has RLS enabled and no matching policy — and the service role key (used only by
-- server-side API routes, never shipped to the browser) bypasses RLS entirely, so it
-- doesn't need a policy to do admin writes.
--
-- Do NOT add a "USING (true) WITH CHECK (true)" policy without a `TO service_role`
-- clause — without it, the policy applies to the public anon role too (this is what
-- caused the original vulnerability: anyone with the public anon key could read/write
-- every table, including customer PII in `orders`).
alter table artworks enable row level security;
alter table blog_posts enable row level security;
alter table orders enable row level security;

create policy "Public read artworks" on artworks for select using (true);
create policy "Public read published posts" on blog_posts for select using (published = true);
