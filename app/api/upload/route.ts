import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/require-admin";

export const runtime = "nodejs";

const ALLOWED_FOLDERS = new Set(["blog", "artworks", "workshops"]);
const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8MB
const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50MB — short workshop clips, not full recordings
const ALLOWED_IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "gif", "avif"]);
const ALLOWED_VIDEO_EXTENSIONS = new Set(["mp4", "webm", "mov"]);

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

    const isVideo = file.type?.startsWith("video/");
    const isImage = file.type?.startsWith("image/");
    if (!isVideo && !isImage) {
      return NextResponse.json({ error: "Only image or video uploads are allowed" }, { status: 400 });
    }

    const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
    if (file.size > maxBytes) {
      return NextResponse.json({ error: `File too large (max ${maxBytes / (1024 * 1024)}MB)` }, { status: 400 });
    }

    const extRaw = (file.name.split(".").pop() || (isVideo ? "mp4" : "jpg")).toLowerCase();
    const allowedExtensions = isVideo ? ALLOWED_VIDEO_EXTENSIONS : ALLOWED_IMAGE_EXTENSIONS;
    const ext    = allowedExtensions.has(extRaw) ? extRaw : (isVideo ? "mp4" : "jpg");
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
      // Fallback: return base64 data URL. Only viable for small image files —
      // a 50MB video as a data URL would bloat every response that uses it.
      if (isVideo) return NextResponse.json({ error: "Video upload failed: " + upErr.message }, { status: 500 });
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
