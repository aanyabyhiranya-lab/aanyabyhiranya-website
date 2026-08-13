-- Run this once in the Supabase SQL Editor for this project (Project → SQL Editor → New query).
--
-- Why: supabase-add-categories.sql added `category_id` and moved artwork
-- categorization over to the admin-managed category tree, but never relaxed
-- the original `category text not null` constraint from supabase-schema.sql.
-- The admin Artworks form only ever sends `category_id` now — it has never
-- sent `category` — so every "Add New Artwork" submission has been failing
-- at the database with "null value in column \"category\" violates not-null
-- constraint" the whole time. This is why the artworks table is currently
-- empty: there has been no way to actually save a new piece through the
-- admin panel.
--
-- Safe to re-run.

alter table artworks alter column category drop not null;

-- --- Verify afterwards ---
-- select column_name, is_nullable from information_schema.columns
-- where table_name = 'artworks' and column_name = 'category';
-- is_nullable should now be YES.
