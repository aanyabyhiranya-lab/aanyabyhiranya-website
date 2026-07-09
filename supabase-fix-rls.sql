-- Run this once in the Supabase SQL Editor for this project (Project → SQL Editor → New query).
--
-- Why: the original "Service role full access" policies were created without a
-- `TO service_role` clause. In Postgres, a policy with no `TO` clause applies to
-- EVERY role, not just the one implied by its name — so these actually granted full
-- insert/update/delete on artworks, blog_posts, and orders (including customer names,
-- emails, and order amounts) to anyone using the public anon key, which is visible to
-- any visitor in the site's client-side JS. This script removes them.
--
-- The service role key doesn't need a policy to keep working — it bypasses RLS
-- entirely by design, which is why all admin writes now go through server-side API
-- routes (app/api/admin/**) that use that key, never through the browser.
--
-- Safe to re-run.

drop policy if exists "Service role full access artworks" on artworks;
drop policy if exists "Service role full access blog" on blog_posts;
drop policy if exists "Service role full access orders" on orders;

-- Re-assert the intended public-read policies (no-op if they're already correct).
drop policy if exists "Public read artworks" on artworks;
create policy "Public read artworks" on artworks for select using (true);

drop policy if exists "Public read published posts" on blog_posts;
create policy "Public read published posts" on blog_posts for select using (published = true);

-- orders intentionally gets NO policy. With RLS enabled and zero matching policies,
-- Postgres denies all access by default for anon/authenticated — only the service
-- role (server-only) can read or write it.

-- --- Verify afterwards ---
-- select * from pg_policies where tablename in ('artworks','blog_posts','orders');
-- You should see exactly: "Public read artworks" and "Public read published posts".
-- Nothing should remain on `orders`.
