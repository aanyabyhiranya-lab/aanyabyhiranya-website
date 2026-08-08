import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/require-admin";

// Mints a signed Supabase Storage upload URL so the browser can PUT the file
// bytes directly to Supabase, instead of routing them through this server's
// own request body — Vercel serverless functions cap that at ~4.5MB, well
// under a short workshop video's size. Only needed for files too big for the
// simple POST-through-our-API path that /api/upload still uses for images.
const ALLOWED_FOLDERS = new Set(["workshops"]);
const ALLOWED_EXTENSIONS = new Set(["mp4", "webm", "mov"]);

function sb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  try {
    const { folder: folderRaw, filename } = await req.json();
    const folder = ALLOWED_FOLDERS.has(folderRaw) ? folderRaw : "workshops";
    const extRaw = String(filename || "").split(".").pop()?.toLowerCase() || "mp4";
    const ext = ALLOWED_EXTENSIONS.has(extRaw) ? extRaw : "mp4";
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const client = sb();
    const { data: buckets } = await client.storage.listBuckets();
    if (!buckets?.some((b: any) => b.name === "images")) {
      await client.storage.createBucket("images", { public: true });
    }

    const { data, error } = await client.storage.from("images").createSignedUploadUrl(path);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const { data: pub } = client.storage.from("images").getPublicUrl(path);
    return NextResponse.json({ path: data.path, token: data.token, publicUrl: pub.publicUrl });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
