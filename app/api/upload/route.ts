import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/require-admin";

export const runtime = "nodejs";

const ALLOWED_FOLDERS = new Set(["blog", "artworks"]);
const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8MB
const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif", "avif"]);

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
    const data = await req.formData();
    const file       = data.get("file") as File;
    const folderRaw  = (data.get("folder") as string) || "blog";
    const folder     = ALLOWED_FOLDERS.has(folderRaw) ? folderRaw : "blog";

    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
    if (!file.type?.startsWith("image/")) {
      return NextResponse.json({ error: "Only image uploads are allowed" }, { status: 400 });
    }
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: "File too large (max 8MB)" }, { status: 400 });
    }

    const extRaw = (file.name.split(".").pop() || "jpg").toLowerCase();
    const ext    = ALLOWED_EXTENSIONS.has(extRaw) ? extRaw : "jpg";
    const path   = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const buf    = Buffer.from(await file.arrayBuffer());

    const client = sb();

    // Ensure bucket exists
    const { data: buckets } = await client.storage.listBuckets();
    const exists = buckets?.some((b: any) => b.name === "images");
    if (!exists) {
      await client.storage.createBucket("images", { public: true });
    }

    const { error: upErr } = await client.storage
      .from("images")
      .upload(path, buf, { contentType: file.type, upsert: true });

    if (upErr) {
      // Fallback: return base64 data URL
      const b64 = buf.toString("base64");
      const dataUrl = `data:${file.type};base64,${b64}`;
      return NextResponse.json({ url: dataUrl });
    }

    const { data: pub } = client.storage.from("images").getPublicUrl(path);
    return NextResponse.json({ url: pub.publicUrl });

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
