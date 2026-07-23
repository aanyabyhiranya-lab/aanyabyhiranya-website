-- Run this once in the Supabase SQL Editor for this project.
-- Adds the "Use this image in the homepage hero collage" checkbox field.
-- Safe to re-run.

alter table artworks add column if not exists show_in_hero boolean default false;
