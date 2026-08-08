-- Run this in your Supabase SQL Editor after supabase-add-categories.sql.
-- Lets the admin add/edit workshops: gallery images, an optional tagged Instagram
-- Reel, and an optional uploaded video with its own cover/poster image.

create table workshops (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text unique not null,
  description text,
  cover_image_url text,
  images text[] default '{}',
  instagram_reel_url text,
  video_url text,
  video_cover_url text,
  published boolean not null default false,
  created_at timestamptz default now()
);

alter table workshops enable row level security;
create policy "Public read published workshops" on workshops for select using (published = true);
