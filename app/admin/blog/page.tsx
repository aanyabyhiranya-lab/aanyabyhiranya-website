"use client";
export const dynamic = 'force-dynamic';
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/lib/admin-fetch";
import type { Block, ImageBlock } from "@/lib/blog-content";
import Image from "next/image";

const uid       = () => Math.random().toString(36).slice(2);
const emptyText = (): Block => ({ id: uid(), type: "text", content: "" });
const EMPTY_FORM = { title: "", slug: "", excerpt: "", cover_image_url: "", medium_url: "", published: false };

export default function AdminBlog() {
  const router = useRouter();
  const [posts, setPosts]         = useState<any[]>([]);
  const [form, setForm]           = useState<any>(EMPTY_FORM);
  const [blocks, setBlocks]       = useState<Block[]>([emptyText()]);
  const [editing, setEditing]     = useState<string | null>(null);
  const [loading, setLoading]     = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [msg, setMsg]             = useState("");
  const [err, setErr]             = useState("");
  const coverInputRef             = useRef<HTMLInputElement>(null);
  const insertRefs                = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await adminFetch("/api/admin/blog");
    const { data, error } = await res.json();
    if (error) setErr(error);
    setPosts(data || []);
  };

  const slugify = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  // Upload via server-side API route — avoids CORS issues
  const uploadFile = async (file: File, folder = "blog"): Promise<string> => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", folder);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (!res.ok) throw new Error(await res.text());
    const json = await res.json();
    if (json.error) throw new Error(json.error);
    return json.url;
  };

  // Cover upload
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploadingId("cover"); setErr("");
    try {
      const url = await uploadFile(file);
      setForm((f: any) => ({ ...f, cover_image_url: url }));
    } catch (ex: any) { setErr("Cover upload failed: " + ex.message); }
    setUploadingId(null);
    e.target.value = "";
  };

  // Insert image after a block
  const handleInsertImage = async (afterId: string, file: File) => {
    setUploadingId(afterId); setErr("");
    try {
      const url = await uploadFile(file);
      const newImg: Block  = { id: uid(), type: "image", url, caption: "" };
      const newText: Block = emptyText();
      setBlocks(bs => {
        const idx = bs.findIndex(b => b.id === afterId);
        const next = [...bs];
        next.splice(idx + 1, 0, newImg, newText);
        return next;
      });
    } catch (ex: any) { setErr("Image upload failed: " + ex.message); }
    setUploadingId(null);
  };

  const updateBlock = (id: string, patch: Partial<Block>) =>
    setBlocks(bs => bs.map(b => b.id === id ? { ...b, ...patch } as Block : b));

  const removeBlock = (id: string) =>
    setBlocks(bs => bs.length > 1 ? bs.filter(b => b.id !== id) : [emptyText()]);

  // Note: HTML for storage is built server-side (lib/blog-content.ts) from these blocks —
  // the client only ever sends the block list, never pre-rendered HTML, so a tampered
  // request can't smuggle in raw markup.
  const htmlToBlocks = (html: string): Block[] => {
    if (!html) return [emptyText()];
    const doc = new DOMParser().parseFromString(html, "text/html");
    const result: Block[] = [];
    doc.body.childNodes.forEach(node => {
      const el = node as Element;
      if (el.nodeName === "FIGURE") {
        const img = el.querySelector("img");
        const cap = el.querySelector("figcaption");
        if (img) result.push({ id: uid(), type: "image", url: img.getAttribute("src") || "", caption: cap?.textContent || "" });
      } else if (el.nodeName === "P") {
        result.push({ id: uid(), type: "text", content: el.textContent || "" });
      }
    });
    return result.length ? result : [emptyText()];
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) { setErr("Title is required."); return; }
    setLoading(true); setMsg(""); setErr("");
    const slug    = form.slug || slugify(form.title);
    const payload = { ...form, blocks, slug };
    try {
      const res = editing
        ? await adminFetch(`/api/admin/blog/${editing}`, { method: "PUT", body: JSON.stringify(payload) })
        : await adminFetch("/api/admin/blog", { method: "POST", body: JSON.stringify(payload) });
      const json = await res.json();
      if (!res.ok) {
        setErr("Save failed: " + (json.error || "unknown error"));
      } else {
        setMsg(editing ? "✓ Post updated successfully." : "✓ Post created successfully.");
        setForm(EMPTY_FORM);
        setBlocks([emptyText()]);
        setEditing(null);
        load();
      }
    } catch (ex: any) {
      setErr("Unexpected error: " + ex.message);
    }
    setLoading(false);
  };

  const del = async (id: string) => {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    const res = await adminFetch(`/api/admin/blog/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) setErr(json.error); else load();
  };

  const togglePublish = async (post: any) => {
    await adminFetch(`/api/admin/blog/${post.id}`, {
      method: "PATCH",
      body: JSON.stringify({ published: !post.published }),
    });
    load();
  };

  const startEdit = (p: any) => {
    setForm({ title: p.title, slug: p.slug, excerpt: p.excerpt || "", cover_image_url: p.cover_image_url || "", medium_url: p.medium_url || "", published: p.published });
    setBlocks(htmlToBlocks(p.content || ""));
    setEditing(p.id);
    setMsg(""); setErr("");
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-beige dark:bg-dark pt-16">
      <div className="max-w-4xl mx-auto px-6 py-16">

        <div className="flex items-center gap-4 mb-10">
          <button onClick={() => router.push("/admin/dashboard")}
            className="text-xs text-dark/50 dark:text-beige/50 hover:text-forest dark:hover:text-rose">
            ← Back
          </button>
          <p className="font-serif text-4xl text-forest dark:text-beige">Blog Posts</p>
        </div>

        {err && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 text-sm rounded-lg">
            ⚠ {err}
          </div>
        )}
        {msg && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-400 text-sm rounded-lg">
            {msg}
          </div>
        )}

        <form onSubmit={save} className="border border-forest/20 dark:border-beige/20 p-8 mb-12">
          <p className="font-serif text-2xl text-forest dark:text-beige mb-6">
            {editing ? "Edit Post" : "New Post"}
          </p>

          <div className="flex flex-col gap-6">

            {/* Title */}
            <div>
              <label className="text-xs tracking-widest uppercase text-dark/50 dark:text-beige/50 block mb-1">Title *</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required
                className="w-full bg-transparent border-b border-forest/30 dark:border-beige/30 py-2 text-dark dark:text-beige focus:outline-none focus:border-forest text-sm transition-colors" />
            </div>

            {/* Excerpt */}
            <div>
              <label className="text-xs tracking-widest uppercase text-dark/50 dark:text-beige/50 block mb-1">Short Summary</label>
              <input value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })}
                placeholder="Shown on the blog listing page"
                className="w-full bg-transparent border-b border-forest/30 dark:border-beige/30 py-2 text-dark dark:text-beige focus:outline-none focus:border-forest text-sm placeholder:opacity-30 transition-colors" />
            </div>

            {/* Medium URL */}
            <div>
              <label className="text-xs tracking-widest uppercase text-dark/50 dark:text-beige/50 block mb-1">Medium Article URL <span className="normal-case text-dark/30 dark:text-beige/30">(optional — if set, clicking the post opens Medium)</span></label>
              <input value={form.medium_url} onChange={e => setForm({ ...form, medium_url: e.target.value })}
                placeholder="https://medium.com/@yourhandle/article-title"
                className="w-full bg-transparent border-b border-forest/30 dark:border-beige/30 py-2 text-dark dark:text-beige focus:outline-none focus:border-forest text-sm placeholder:opacity-30 transition-colors" />
            </div>

            {/* Cover image */}
            <div>
              <label className="text-xs tracking-widest uppercase text-dark/50 dark:text-beige/50 block mb-3">Cover Image</label>
              {uploadingId === "cover" && (
                <div className="flex items-center gap-2 mb-3 text-sm text-forest dark:text-rose">
                  <span className="animate-spin">⟳</span> Uploading cover image…
                </div>
              )}
              {form.cover_image_url && uploadingId !== "cover" && (
                <div className="relative w-full max-w-sm aspect-video overflow-hidden rounded-lg mb-3 border border-forest/20 dark:border-beige/20">
                  <Image src={form.cover_image_url} alt="cover" fill className="object-cover" />
                  <div className="absolute top-2 right-2">
                    <button type="button" onClick={() => setForm((f: any) => ({ ...f, cover_image_url: "" }))}
                      className="bg-dark/70 text-white text-xs px-2 py-1 rounded hover:bg-red-600 transition-colors">
                      Remove
                    </button>
                  </div>
                </div>
              )}
              <button type="button" onClick={() => coverInputRef.current?.click()}
                disabled={uploadingId === "cover"}
                className="text-xs tracking-widest uppercase border border-forest/40 dark:border-beige/30 text-forest dark:text-beige px-5 py-2.5 hover:bg-forest hover:text-white transition-all disabled:opacity-50">
                {uploadingId === "cover" ? "Uploading…" : form.cover_image_url ? "Change Cover Image" : "📷 Upload Cover Image"}
              </button>
              <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
            </div>

            {!form.medium_url && <>{/* Block editor */}
            <div>
              <label className="text-xs tracking-widest uppercase text-dark/50 dark:text-beige/50 block mb-3">Content</label>
              <div className="flex flex-col gap-0">
                {blocks.map((block, idx) => (
                  <div key={block.id}>

                    {/* Text block */}
                    {block.type === "text" && (
                      <div className="relative group/block">
                        <textarea
                          rows={3}
                          value={block.content}
                          onChange={e => {
                            updateBlock(block.id, { content: e.target.value });
                            e.target.style.height = "auto";
                            e.target.style.height = e.target.scrollHeight + "px";
                          }}
                          placeholder={idx === 0 ? "Start writing your post here…" : "Continue writing…"}
                          className="w-full bg-transparent border border-forest/15 dark:border-beige/15 focus:border-forest dark:focus:border-rose p-3 text-dark dark:text-beige text-sm leading-relaxed resize-none focus:outline-none transition-colors placeholder:opacity-30"
                        />
                        {blocks.length > 1 && (
                          <button type="button" onClick={() => removeBlock(block.id)}
                            className="absolute top-2 right-2 opacity-0 group-hover/block:opacity-100 bg-red-100 dark:bg-red-900/30 text-red-500 text-xs px-2 py-0.5 rounded transition-all">
                            remove
                          </button>
                        )}
                      </div>
                    )}

                    {/* Image block */}
                    {block.type === "image" && (
                      <div className="relative group/block border border-forest/15 dark:border-beige/15 p-3 bg-forest/3 dark:bg-beige/3">
                        <div className="relative w-full max-w-lg aspect-video overflow-hidden rounded-lg mb-2 mx-auto">
                          <Image src={(block as ImageBlock).url} alt={(block as ImageBlock).caption} fill className="object-cover" />
                        </div>
                        <input
                          value={(block as ImageBlock).caption}
                          onChange={e => updateBlock(block.id, { caption: e.target.value })}
                          placeholder="Add a caption (optional)"
                          className="w-full bg-transparent text-xs text-center text-dark/60 dark:text-beige/60 focus:outline-none placeholder:opacity-40 border-b border-forest/20 dark:border-beige/20 py-1"
                        />
                        <button type="button" onClick={() => removeBlock(block.id)}
                          className="absolute top-2 right-2 opacity-0 group-hover/block:opacity-100 bg-red-100 dark:bg-red-900/30 text-red-500 text-xs px-2 py-0.5 rounded transition-all">
                          remove
                        </button>
                      </div>
                    )}

                    {/* Insert image between blocks */}
                    <div className="relative flex items-center gap-2 py-1 group/insert">
                      <div className="flex-1 h-px bg-forest/8 dark:bg-beige/8" />
                      {uploadingId === block.id ? (
                        <span className="text-xs text-forest dark:text-rose flex items-center gap-1">
                          <span className="animate-spin inline-block">⟳</span> Uploading…
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => insertRefs.current[block.id]?.click()}
                          className="opacity-0 group-hover/insert:opacity-100 focus:opacity-100 flex items-center gap-1.5 text-[10px] tracking-widest uppercase text-forest/70 dark:text-beige/50 border border-forest/25 dark:border-beige/25 px-3 py-1 hover:bg-forest hover:text-white hover:border-forest transition-all rounded-full whitespace-nowrap">
                          📷 Insert image here
                        </button>
                      )}
                      <div className="flex-1 h-px bg-forest/8 dark:bg-beige/8" />
                      <input
                        type="file" accept="image/*" className="hidden"
                        ref={el => { insertRefs.current[block.id] = el; }}
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) handleInsertImage(block.id, file);
                          e.target.value = "";
                        }}
                      />
                    </div>

                  </div>
                ))}

                <button type="button"
                  onClick={() => setBlocks(bs => [...bs, emptyText()])}
                  className="mt-1 text-xs tracking-widest uppercase text-dark/40 dark:text-beige/40 border border-dashed border-forest/20 dark:border-beige/20 py-3 hover:border-forest hover:text-forest dark:hover:border-rose dark:hover:text-rose transition-all">
                  + Add text block
                </button>
              </div>
            </div></>}

            {/* Published */}
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input type="checkbox" checked={form.published}
                onChange={e => setForm({ ...form, published: e.target.checked })}
                className="w-4 h-4 accent-forest" />
              <span className="text-sm text-dark/70 dark:text-beige/70">
                Published — visible on the site
              </span>
            </label>
          </div>

          <div className="mt-8 flex gap-4 flex-wrap items-center">
            <button type="submit" disabled={loading || !!uploadingId}
              className="text-xs tracking-widest uppercase bg-forest text-white px-8 py-3 hover:bg-teal transition-colors disabled:opacity-50 flex items-center gap-2">
              {loading && <span className="animate-spin">⟳</span>}
              {loading ? "Saving…" : editing ? "Update Post" : "Create Post"}
            </button>
            {editing && (
              <button type="button"
                onClick={() => { setForm(EMPTY_FORM); setBlocks([emptyText()]); setEditing(null); setErr(""); setMsg(""); }}
                className="text-xs tracking-widest uppercase border border-forest/30 dark:border-beige/30 text-dark/60 dark:text-beige/60 px-6 py-3 hover:border-forest transition-colors">
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Post list */}
        <div className="flex flex-col gap-3">
          {posts.length === 0 && (
            <p className="text-dark/40 dark:text-beige/40 text-sm">No posts yet. Create your first one above.</p>
          )}
          {posts.map(p => (
            <div key={p.id} className="border border-forest/10 dark:border-beige/10 p-5 flex items-center gap-4 flex-wrap hover:border-forest/30 dark:hover:border-beige/30 transition-colors">
              {p.cover_image_url && (
                <div className="relative w-16 h-12 overflow-hidden rounded flex-shrink-0">
                  <Image src={p.cover_image_url} alt={p.title} fill className="object-cover" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-serif text-xl text-dark dark:text-beige truncate">{p.title}</p>
                <p className="text-xs mt-0.5">
                  <span className={p.published ? "text-forest dark:text-rose font-medium" : "text-dark/40 dark:text-beige/40"}>
                    {p.published ? "● Published" : "○ Draft"}
                  </span>
                  {p.excerpt && <span className="text-dark/40 dark:text-beige/40"> · {p.excerpt.slice(0, 55)}{p.excerpt.length > 55 ? "…" : ""}</span>}
                </p>
              </div>
              <div className="flex gap-4 items-center flex-shrink-0">
                <button onClick={() => togglePublish(p)}
                  className="text-xs text-dark/50 dark:text-beige/50 hover:text-forest dark:hover:text-rose transition-colors">
                  {p.published ? "Unpublish" : "Publish"}
                </button>
                <button onClick={() => startEdit(p)}
                  className="text-xs text-dark/50 dark:text-beige/50 hover:text-forest dark:hover:text-rose transition-colors">
                  Edit
                </button>
                <button onClick={() => del(p.id)}
                  className="text-xs text-red-400 hover:text-red-600 transition-colors">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
