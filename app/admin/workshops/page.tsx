"use client";
export const dynamic = 'force-dynamic';
import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { adminFetch } from "@/lib/admin-fetch";
import { createBrowserClient } from "@/lib/supabase-browser";

const EMPTY_FORM = {
  title: "", slug: "", description: "",
  cover_image_url: "", images: [] as string[],
  instagram_reel_url: "", video_url: "", video_cover_url: "",
  published: false,
};

const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

export default function AdminWorkshops() {
  const router = useRouter();
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [form, setForm] = useState<any>(EMPTY_FORM);
  const [editing, setEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const coverRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const videoCoverRef = useRef<HTMLInputElement>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const res = await adminFetch("/api/admin/workshops");
    const { data, error } = await res.json();
    if (error) setErr(error);
    setWorkshops(data || []);
  };

  const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  // Small images (cover, gallery, video poster) go through our own API — well
  // under Vercel's serverless body-size limit either way.
  const uploadImage = async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "workshops");
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (!res.ok) throw new Error(await res.text());
    const json = await res.json();
    if (json.error) throw new Error(json.error);
    return json.url;
  };

  // Video files can run well past that same limit, so the browser uploads the
  // bytes straight to Supabase Storage using a short-lived signed URL — our
  // server only ever handles the small JSON request that mints the URL.
  const uploadVideo = async (file: File): Promise<string> => {
    if (file.size > MAX_VIDEO_BYTES) throw new Error(`Video too large (max ${MAX_VIDEO_BYTES / (1024 * 1024)}MB)`);
    const res = await adminFetch("/api/admin/upload-url", {
      method: "POST",
      body: JSON.stringify({ folder: "workshops", filename: file.name }),
    });
    const { path, token, publicUrl, error } = await res.json();
    if (error) throw new Error(error);
    const client = createBrowserClient();
    const { error: upErr } = await client.storage.from("images").uploadToSignedUrl(path, token, file);
    if (upErr) throw new Error(upErr.message);
    return publicUrl;
  };

  const handleCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading("cover"); setErr("");
    try {
      const url = await uploadImage(file);
      setForm((f: any) => ({ ...f, cover_image_url: url }));
    } catch (ex: any) { setErr("Cover upload failed: " + ex.message); }
    setUploading(null); e.target.value = "";
  };

  const handleGallery = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []); if (!files.length) return;
    setUploading("gallery"); setErr("");
    try {
      const urls = await Promise.all(files.map(uploadImage));
      setForm((f: any) => ({ ...f, images: [...(f.images || []), ...urls] }));
    } catch (ex: any) { setErr("Image upload failed: " + ex.message); }
    setUploading(null); e.target.value = "";
  };

  const removeGalleryImage = (i: number) =>
    setForm((f: any) => ({ ...f, images: f.images.filter((_: any, idx: number) => idx !== i) }));

  const handleVideo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading("video"); setErr("");
    try {
      const url = await uploadVideo(file);
      setForm((f: any) => ({ ...f, video_url: url }));
    } catch (ex: any) { setErr("Video upload failed: " + ex.message); }
    setUploading(null); e.target.value = "";
  };

  const handleVideoCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading("video_cover"); setErr("");
    try {
      const url = await uploadImage(file);
      setForm((f: any) => ({ ...f, video_cover_url: url }));
    } catch (ex: any) { setErr("Video cover upload failed: " + ex.message); }
    setUploading(null); e.target.value = "";
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { setErr("Title is required."); return; }
    setLoading(true); setMsg(""); setErr("");
    const slug = form.slug || slugify(form.title);
    const payload = { ...form, slug };
    try {
      const res = editing
        ? await adminFetch(`/api/admin/workshops/${editing}`, { method: "PUT", body: JSON.stringify(payload) })
        : await adminFetch("/api/admin/workshops", { method: "POST", body: JSON.stringify(payload) });
      const json = await res.json();
      if (!res.ok) setErr("Save failed: " + (json.error || "unknown error"));
      else {
        setMsg(editing ? "✓ Workshop updated." : "✓ Workshop added.");
        setForm(EMPTY_FORM); setEditing(null); load();
      }
    } catch (ex: any) { setErr("Unexpected error: " + ex.message); }
    setLoading(false);
  };

  const del = async (id: string) => {
    if (!confirm("Delete this workshop? This cannot be undone.")) return;
    const res = await adminFetch(`/api/admin/workshops/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) setErr(json.error); else load();
  };

  const togglePublish = async (w: any) => {
    await adminFetch(`/api/admin/workshops/${w.id}`, { method: "PATCH", body: JSON.stringify({ published: !w.published }) });
    load();
  };

  const startEdit = (w: any) => {
    setForm({
      title: w.title, slug: w.slug, description: w.description || "",
      cover_image_url: w.cover_image_url || "", images: w.images || [],
      instagram_reel_url: w.instagram_reel_url || "",
      video_url: w.video_url || "", video_cover_url: w.video_cover_url || "",
      published: w.published,
    });
    setEditing(w.id); setMsg(""); setErr(""); window.scrollTo(0, 0);
  };

  const busy = !!uploading;

  return (
    <div className="min-h-screen bg-beige dark:bg-dark pt-16">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="flex items-center gap-4 mb-10">
          <button onClick={() => router.push("/admin/dashboard")} className="text-xs text-dark/50 dark:text-beige/50 hover:text-forest dark:hover:text-rose">← Back</button>
          <p className="font-serif text-4xl text-forest dark:text-beige">Workshops</p>
        </div>

        {err && <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 text-sm rounded-lg">⚠ {err}</div>}
        {msg && <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 text-sm rounded-lg">{msg}</div>}

        <form onSubmit={save} className="border border-forest/20 dark:border-beige/20 p-8 mb-12">
          <p className="font-serif text-2xl text-forest dark:text-beige mb-6">{editing ? "Edit Workshop" : "New Workshop"}</p>

          <div className="flex flex-col gap-6">
            <div>
              <label className="text-xs tracking-widest uppercase text-dark/50 dark:text-beige/50 block mb-1">Title *</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required
                className="w-full bg-transparent border-b border-forest/30 dark:border-beige/30 py-2 text-dark dark:text-beige focus:outline-none text-sm" />
            </div>

            <div>
              <label className="text-xs tracking-widest uppercase text-dark/50 dark:text-beige/50 block mb-1">Description</label>
              <textarea rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="What happens in this workshop, who it's for, etc."
                className="w-full bg-transparent border border-forest/15 dark:border-beige/15 focus:border-forest dark:focus:border-rose p-3 text-dark dark:text-beige text-sm leading-relaxed resize-none focus:outline-none transition-colors placeholder:opacity-30" />
            </div>

            {/* Cover image */}
            <div>
              <label className="text-xs tracking-widest uppercase text-dark/50 dark:text-beige/50 block mb-3">Cover Image <span className="normal-case text-dark/30 dark:text-beige/30">(shown on the workshops listing page)</span></label>
              {form.cover_image_url && (
                <div className="relative w-full max-w-sm aspect-video overflow-hidden rounded-lg mb-3 border border-forest/20 dark:border-beige/20">
                  <Image src={form.cover_image_url} alt="cover" fill className="object-cover" />
                  <button type="button" onClick={() => setForm((f: any) => ({ ...f, cover_image_url: "" }))}
                    className="absolute top-2 right-2 bg-dark/70 text-white text-xs px-2 py-1 rounded hover:bg-red-600 transition-colors">
                    Remove
                  </button>
                </div>
              )}
              <button type="button" onClick={() => coverRef.current?.click()} disabled={busy}
                className="text-xs tracking-widest uppercase border border-forest/40 dark:border-beige/30 text-forest dark:text-beige px-5 py-2.5 hover:bg-forest hover:text-white transition-all disabled:opacity-50">
                {uploading === "cover" ? "Uploading…" : form.cover_image_url ? "Change Cover Image" : "📷 Upload Cover Image"}
              </button>
              <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={handleCover} />
            </div>

            {/* Gallery images */}
            <div>
              <label className="text-xs tracking-widest uppercase text-dark/50 dark:text-beige/50 block mb-3">Gallery Images</label>
              <div className="flex flex-wrap gap-3 mb-3">
                {(form.images || []).map((url: string, i: number) => (
                  <div key={i} className="relative w-20 h-24 flex-shrink-0 overflow-hidden group">
                    <Image src={url} alt={`gallery ${i}`} fill className="object-cover" />
                    <button type="button" onClick={() => removeGalleryImage(i)}
                      className="absolute inset-0 bg-dark/50 opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs flex items-center justify-center">
                      Remove
                    </button>
                  </div>
                ))}
                <button type="button" onClick={() => galleryRef.current?.click()} disabled={busy}
                  className="w-20 h-24 border border-dashed border-forest/30 dark:border-beige/30 text-dark/40 dark:text-beige/40 text-2xl flex items-center justify-center hover:border-forest hover:text-forest transition-all disabled:opacity-50">
                  {uploading === "gallery" ? "…" : "+"}
                </button>
              </div>
              <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden" onChange={handleGallery} />
            </div>

            {/* Instagram Reel */}
            <div>
              <label className="text-xs tracking-widest uppercase text-dark/50 dark:text-beige/50 block mb-1">
                Instagram Reel URL <span className="normal-case text-dark/30 dark:text-beige/30">(optional — embeds Instagram's own player)</span>
              </label>
              <input value={form.instagram_reel_url} onChange={e => setForm({ ...form, instagram_reel_url: e.target.value })}
                placeholder="https://www.instagram.com/reel/…"
                className="w-full bg-transparent border-b border-forest/30 dark:border-beige/30 py-2 text-dark dark:text-beige focus:outline-none text-sm placeholder:opacity-30" />
            </div>

            {/* Video + its cover */}
            <div>
              <label className="text-xs tracking-widest uppercase text-dark/50 dark:text-beige/50 block mb-3">
                Video <span className="normal-case text-dark/30 dark:text-beige/30">(optional — plays only on this workshop's own page, not on the listing)</span>
              </label>
              <div className="flex flex-wrap items-center gap-4 mb-4">
                {form.video_url && (
                  <video src={form.video_url} className="w-32 h-20 object-cover rounded border border-forest/20 dark:border-beige/20" muted />
                )}
                <button type="button" onClick={() => videoRef.current?.click()} disabled={busy}
                  className="text-xs tracking-widest uppercase border border-forest/40 dark:border-beige/30 text-forest dark:text-beige px-5 py-2.5 hover:bg-forest hover:text-white transition-all disabled:opacity-50">
                  {uploading === "video" ? "Uploading…" : form.video_url ? "Change Video" : "🎬 Upload Video"}
                </button>
                {form.video_url && (
                  <button type="button" onClick={() => setForm((f: any) => ({ ...f, video_url: "" }))}
                    className="text-xs text-red-400 hover:text-red-600">Remove video</button>
                )}
              </div>
              <input ref={videoRef} type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" onChange={handleVideo} />

              <div className="flex items-center gap-4">
                {form.video_cover_url && (
                  <div className="relative w-20 h-14 flex-shrink-0 overflow-hidden rounded border border-forest/20 dark:border-beige/20">
                    <Image src={form.video_cover_url} alt="video cover" fill className="object-cover" />
                  </div>
                )}
                <button type="button" onClick={() => videoCoverRef.current?.click()} disabled={busy}
                  className="text-xs tracking-widest uppercase border border-forest/40 dark:border-beige/30 text-forest dark:text-beige px-5 py-2.5 hover:bg-forest hover:text-white transition-all disabled:opacity-50">
                  {uploading === "video_cover" ? "Uploading…" : form.video_cover_url ? "Change Video Cover" : "Upload Video Cover Image"}
                </button>
              </div>
              <input ref={videoCoverRef} type="file" accept="image/*" className="hidden" onChange={handleVideoCover} />
            </div>

            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input type="checkbox" checked={form.published} onChange={e => setForm({ ...form, published: e.target.checked })}
                className="w-4 h-4 accent-forest" />
              <span className="text-sm text-dark/70 dark:text-beige/70">Published (visible on the site)</span>
            </label>
          </div>

          <div className="mt-8 flex gap-4 flex-wrap items-center">
            <button type="submit" disabled={loading || busy}
              className="text-xs tracking-widest uppercase bg-forest text-white px-8 py-3 hover:bg-teal transition-colors disabled:opacity-50 flex items-center gap-2">
              {loading && <span className="animate-spin">⟳</span>}
              {loading ? "Saving…" : editing ? "Update Workshop" : "Create Workshop"}
            </button>
            {editing && (
              <button type="button" onClick={() => { setForm(EMPTY_FORM); setEditing(null); setErr(""); setMsg(""); }}
                className="text-xs tracking-widest uppercase border border-forest/30 dark:border-beige/30 text-dark/60 dark:text-beige/60 px-6 py-3 hover:border-forest transition-colors">
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="flex flex-col gap-3">
          {workshops.length === 0 && <p className="text-dark/40 dark:text-beige/40 text-sm">No workshops yet. Create your first one above.</p>}
          {workshops.map(w => (
            <div key={w.id} className="border border-forest/10 dark:border-beige/10 p-5 flex items-center gap-4 flex-wrap hover:border-forest/30 dark:hover:border-beige/30 transition-colors">
              {w.cover_image_url && (
                <div className="relative w-16 h-12 overflow-hidden rounded flex-shrink-0">
                  <Image src={w.cover_image_url} alt={w.title} fill className="object-cover" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-serif text-xl text-dark dark:text-beige truncate">{w.title}</p>
                <p className="text-xs mt-0.5">
                  <span className={w.published ? "text-forest dark:text-rose font-medium" : "text-dark/40 dark:text-beige/40"}>
                    {w.published ? "● Published" : "○ Draft"}
                  </span>
                  {w.video_url && <span className="text-dark/40 dark:text-beige/40"> · 🎬 video</span>}
                  {w.instagram_reel_url && <span className="text-dark/40 dark:text-beige/40"> · 📷 reel</span>}
                </p>
              </div>
              <div className="flex gap-4 items-center flex-shrink-0">
                <button onClick={() => togglePublish(w)} className="text-xs text-dark/50 dark:text-beige/50 hover:text-forest dark:hover:text-rose transition-colors">
                  {w.published ? "Unpublish" : "Publish"}
                </button>
                <button onClick={() => startEdit(w)} className="text-xs text-dark/50 dark:text-beige/50 hover:text-forest dark:hover:text-rose transition-colors">Edit</button>
                <button onClick={() => del(w.id)} className="text-xs text-red-400 hover:text-red-600 transition-colors">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
