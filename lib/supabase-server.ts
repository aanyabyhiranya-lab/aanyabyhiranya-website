import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  // Use anon key for public reads — works fine with RLS policies
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";
  return createSupabaseClient(url, key);
}
