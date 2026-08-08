-- Run this in your Supabase SQL Editor after supabase-add-hero-flag.sql.
-- Adds an admin-managed category tree (main / sub / sub-sub, 3 levels) to replace
-- the hardcoded category strings + hand-coded portfolio routes.

create table categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null,
  parent_id uuid references categories(id) on delete restrict,
  sort_order int not null default 0,
  show_on_homepage boolean not null default false,
  created_at timestamptz default now(),
  unique (parent_id, slug)
);

alter table categories enable row level security;
create policy "Public read categories" on categories for select using (true);

-- New FK on artworks. The old `category` text column is left in place (unused by
-- the app going forward) rather than dropped, so nothing is destroyed if this
-- migration needs to be rolled back.
alter table artworks add column category_id uuid references categories(id) on delete set null;

-- Seed the category tree matching today's hardcoded taxonomy, so existing URLs/data
-- have a home in the new system immediately.
insert into categories (id, name, slug, parent_id, sort_order, show_on_homepage) values
  ('00000000-0000-0000-0000-000000000001', 'Resin Art',            'resin',      null, 0, true),
  ('00000000-0000-0000-0000-000000000002', 'Paintings',            'paintings',  null, 1, true),
  ('00000000-0000-0000-0000-000000000003', 'Uncategorized',        'uncategorized', null, 99, false);

insert into categories (id, name, slug, parent_id, sort_order, show_on_homepage) values
  ('00000000-0000-0000-0000-000000000011', 'Artifacts', 'artifacts', '00000000-0000-0000-0000-000000000001', 0, false),
  ('00000000-0000-0000-0000-000000000012', 'Jewellery', 'jewellery', '00000000-0000-0000-0000-000000000001', 1, false),
  ('00000000-0000-0000-0000-000000000021', 'Oil Pastels', 'oil-pastels',  '00000000-0000-0000-0000-000000000002', 0, false),
  ('00000000-0000-0000-0000-000000000022', 'Acrylic Art', 'acrylic-art',  '00000000-0000-0000-0000-000000000002', 1, false);

insert into categories (id, name, slug, parent_id, sort_order, show_on_homepage) values
  ('00000000-0000-0000-0000-000000000111', 'Flower', 'flower', '00000000-0000-0000-0000-000000000012', 0, false),
  ('00000000-0000-0000-0000-000000000112', 'Pearl',  'pearl',  '00000000-0000-0000-0000-000000000012', 1, false);

-- Backfill category_id on existing artworks from the old free-text `category` column,
-- so nothing becomes orphaned when the app switches over to category_id.
update artworks set category_id = '00000000-0000-0000-0000-000000000011' where category = 'Resin / Artifacts';
update artworks set category_id = '00000000-0000-0000-0000-000000000111' where category = 'Resin / Jewellery / Flower';
update artworks set category_id = '00000000-0000-0000-0000-000000000112' where category = 'Resin / Jewellery / Pearl';
update artworks set category_id = '00000000-0000-0000-0000-000000000021' where category = 'Oil Pastels';
update artworks set category_id = '00000000-0000-0000-0000-000000000022' where category = 'Acrylic Art';
update artworks set category_id = '00000000-0000-0000-0000-000000000003' where category_id is null;
