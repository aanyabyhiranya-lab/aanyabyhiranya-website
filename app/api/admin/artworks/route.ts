import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { createAdminClient } from "@/lib/supabase-admin";
import { getCategoryTree, flatten } from "@/lib/categories";

export async function GET(req: NextRequest) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  const { data, error } = await createAdminClient()
    .from("artworks")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  const body = await req.json();
  // `category` (legacy text column) is still NOT NULL in the db, but the admin
  // form only ever sets category_id now — derive it so inserts don't fail.
  // TODO: drop once supabase-fix-artworks-category-null.sql has been run.
  let legacyCategory = body.category;
  if (!legacyCategory && body.category_id) {
    const tree = await getCategoryTree();
    legacyCategory = flatten(tree).find(n => n.id === body.category_id)?.name || "";
  }
  const payload = { ...body, category: legacyCategory || "", price: Number(body.price) || 0 };
  const { data, error } = await createAdminClient().from("artworks").insert(payload).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
