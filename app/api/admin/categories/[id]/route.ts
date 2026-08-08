import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { createAdminClient } from "@/lib/supabase-admin";
import { UNCATEGORIZED_ID } from "@/lib/categories";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const body = await req.json();
  // Only these fields are ever editable — slug/parent are set at creation time
  // so existing portfolio URLs under this node never shift underneath it.
  const payload: Record<string, unknown> = {};
  if (typeof body.name === "string") payload.name = body.name;
  if (typeof body.sort_order === "number") payload.sort_order = body.sort_order;
  if (typeof body.show_on_homepage === "boolean") payload.show_on_homepage = body.show_on_homepage;

  const { data, error } = await createAdminClient()
    .from("categories")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  const { id } = await params;
  if (id === UNCATEGORIZED_ID) {
    return NextResponse.json({ error: "The Uncategorized bucket can't be deleted" }, { status: 400 });
  }
  const admin = createAdminClient();

  const { count: childCount } = await admin
    .from("categories")
    .select("id", { count: "exact", head: true })
    .eq("parent_id", id);
  if (childCount) {
    return NextResponse.json(
      { error: "Delete or move its subcategories first — this category still has children." },
      { status: 400 }
    );
  }

  // Reassign any artworks under this category to Uncategorized before deleting,
  // per the client's choice: no cascading deletes, no orphaned artworks.
  const { error: reassignError } = await admin
    .from("artworks")
    .update({ category_id: UNCATEGORIZED_ID })
    .eq("category_id", id);
  if (reassignError) return NextResponse.json({ error: reassignError.message }, { status: 500 });

  const { error } = await admin.from("categories").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
