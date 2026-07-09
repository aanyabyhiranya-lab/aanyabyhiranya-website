import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { createAdminClient } from "@/lib/supabase-admin";
import { blocksToHtml } from "@/lib/blog-content";

export async function GET(req: NextRequest) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  const { data, error } = await createAdminClient()
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  const body = await req.json();
  if (!body.title?.trim()) return NextResponse.json({ error: "Title is required." }, { status: 400 });

  const { blocks, ...rest } = body;
  const payload = { ...rest, content: blocksToHtml(blocks || []) };
  const { data, error } = await createAdminClient().from("blog_posts").insert(payload).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
