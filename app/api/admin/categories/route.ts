import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { createAdminClient } from "@/lib/supabase-admin";
import { slugify } from "@/lib/categories";

export async function GET(req: NextRequest) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  const { data, error } = await createAdminClient()
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  const body = await req.json();
  const name = String(body.name || "").trim();
  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
  const parent_id = body.parent_id || null;
  const admin = createAdminClient();

  // Only 3 levels deep (main / sub / sub-sub) — reject a 4th.
  if (parent_id) {
    const { data: parent, error: parentError } = await admin
      .from("categories")
      .select("parent_id")
      .eq("id", parent_id)
      .single();
    if (parentError || !parent) return NextResponse.json({ error: "Parent category not found" }, { status: 400 });
    if (parent.parent_id) {
      const { data: grandparent } = await admin
        .from("categories")
        .select("parent_id")
        .eq("id", parent.parent_id)
        .single();
      if (grandparent?.parent_id) {
        return NextResponse.json({ error: "Categories can only go 3 levels deep" }, { status: 400 });
      }
    }
  }

  // Siblings sort after whatever's already under the same parent.
  const { data: siblings } = await admin
    .from("categories")
    .select("sort_order")
    .is("parent_id", parent_id)
    .order("sort_order", { ascending: false })
    .limit(1);
  const sort_order = (siblings?.[0]?.sort_order ?? -1) + 1;

  const { data, error } = await admin
    .from("categories")
    .insert({ name, slug: slugify(name), parent_id, sort_order, show_on_homepage: !!body.show_on_homepage })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
