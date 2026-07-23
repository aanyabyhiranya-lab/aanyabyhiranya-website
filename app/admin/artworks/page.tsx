"use client";
export const dynamic = 'force-dynamic';
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/lib/admin-fetch";
import Image from "next/image";

const EMPTY = { title:"", category:"Resin / Artifacts", medium:"", price:"", availability:"Available", description:"", image_url:"", images:[] as string[], featured:false, show_in_hero:false };

export default function AdminArtworks() {
  const router = useRouter();
  const [artworks, setArtworks] = useState<any[]>([]);
  const [form, setForm] = useState<any>(EMPTY);
  const [editing, setEditing] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");
  const mainInputRef = useRef<HTMLInputElement>(null);
  const extraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await adminFetch("/api/admin/artworks");
    const { data } = await res.json();
    setArtworks(data || []);
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("folder", "artworks");
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (!res.ok) throw new Error(await res.text());
    const json = await res.json();
    if (json.error) throw new Error(json.error);
    return json.url;
  };

  const handleMainUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setForm((f: any) => ({ ...f, image_url: url }));
    } catch { setMsg("Upload failed. Try again."); }
    setUploading(false);
  };

  const handleExtraUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const urls = await Promise.all(files.map(uploadImage));
      setForm((f: any) => ({ ...f, images: [...(f.images || []), ...urls] }));
    } catch { setMsg("Upload failed. Try again."); }
    setUploading(false);
  };

  const removeExtraImage = (i: number) => {
    setForm((f: any) => ({ ...f, images: f.images.filter((_: any, idx: number) => idx !== i) }));
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setMsg("");
    const payload = { ...form, price: Number(form.price) };
    if (editing) {
      await adminFetch(`/api/admin/artworks/${editing}`, { method: "PUT", body: JSON.stringify(payload) });
      setMsg("Artwork updated.");
    } else {
      await adminFetch("/api/admin/artworks", { method: "POST", body: JSON.stringify(payload) });
      setMsg("Artwork added.");
    }
    setForm(EMPTY); setEditing(null); setLoading(false); load();
  };

  const del = async (id: string) => {
    if (!confirm("Delete this artwork?")) return;
    await adminFetch(`/api/admin/artworks/${id}`, { method: "DELETE" });
    load();
  };

  const edit = (art: any) => { setForm({ ...art, price: String(art.price) }); setEditing(art.id); window.scrollTo(0, 0); };

  return (
    <div className="min-h-screen bg-beige dark:bg-dark pt-16">
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="flex items-center gap-4 mb-10">
          <button onClick={() => router.push("/admin/dashboard")} className="text-xs text-dark/50 dark:text-beige/50 hover:text-forest dark:hover:text-rose">← Back</button>
          <p className="font-serif text-4xl text-forest dark:text-beige">Artworks</p>
        </div>

        <form onSubmit={save} className="border border-forest/20 dark:border-beige/20 p-8 mb-12">
          <p className="font-serif text-2xl text-forest dark:text-beige mb-6">{editing ? "Edit Artwork" : "Add New Artwork"}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[["title","Title","text"],["medium","Medium","text"],["price","Price (₹)","number"]].map(([id,label,type])=>(
              <div key={id}>
                <label className="text-xs tracking-widest uppercase text-dark/50 dark:text-beige/50 block mb-1">{label}</label>
                <input type={type} value={form[id]} onChange={e=>setForm({...form,[id]:e.target.value})}
                  className="w-full bg-transparent border-b border-forest/30 dark:border-beige/30 py-2 text-dark dark:text-beige focus:outline-none text-sm" />
              </div>
            ))}
            <div>
              <label className="text-xs tracking-widest uppercase text-dark/50 dark:text-beige/50 block mb-1">Category</label>
              <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}
                className="w-full bg-beige dark:bg-dark border-b border-forest/30 dark:border-beige/30 py-2 text-dark dark:text-beige focus:outline-none text-sm">
                <optgroup label="Resin Art">
                  <option value="Resin / Artifacts">Resin / Artifacts</option>
                  <option value="Resin / Jewellery / Flower">Resin / Jewellery / Flower</option>
                  <option value="Resin / Jewellery / Pearl">Resin / Jewellery / Pearl</option>
                </optgroup>
                <optgroup label="Other">
                  <option value="Oil Pastels">Oil Pastels</option>
                  <option value="Acrylic Art">Acrylic Art</option>
                </optgroup>
              </select>
            </div>
            <div>
              <label className="text-xs tracking-widest uppercase text-dark/50 dark:text-beige/50 block mb-1">Availability</label>
              <select value={form.availability} onChange={e=>setForm({...form,availability:e.target.value})}
                className="w-full bg-beige dark:bg-dark border-b border-forest/30 dark:border-beige/30 py-2 text-dark dark:text-beige focus:outline-none text-sm">
                <option>Available</option><option>Sold</option><option>On Request</option>
              </select>
            </div>
          </div>

          {/* Main image upload */}
          <div className="mt-6">
            <label className="text-xs tracking-widest uppercase text-dark/50 dark:text-beige/50 block mb-3">Main Image</label>
            <div className="flex items-center gap-4">
              {form.image_url && (
                <div className="relative w-20 h-24 flex-shrink-0 overflow-hidden">
                  <Image src={form.image_url} alt="main" fill className="object-cover" />
                </div>
              )}
              <button type="button" onClick={() => mainInputRef.current?.click()}
                className="text-xs tracking-widest uppercase border border-forest/40 dark:border-beige/30 text-forest dark:text-beige px-5 py-2 hover:bg-forest hover:text-white transition-all">
                {uploading ? "Uploading…" : form.image_url ? "Change Image" : "Upload Image"}
              </button>
              <input ref={mainInputRef} type="file" accept="image/*" className="hidden" onChange={handleMainUpload} />
            </div>
          </div>

          {/* Extra images upload */}
          <div className="mt-6">
            <label className="text-xs tracking-widest uppercase text-dark/50 dark:text-beige/50 block mb-3">Extra Images (for slideshow)</label>
            <div className="flex flex-wrap gap-3 mb-3">
              {(form.images || []).map((url: string, i: number) => (
                <div key={i} className="relative w-20 h-24 flex-shrink-0 overflow-hidden group">
                  <Image src={url} alt={`extra ${i}`} fill className="object-cover" />
                  <button type="button" onClick={() => removeExtraImage(i)}
                    className="absolute inset-0 bg-dark/50 opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs flex items-center justify-center">
                    Remove
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => extraInputRef.current?.click()}
                className="w-20 h-24 border border-dashed border-forest/30 dark:border-beige/30 text-dark/40 dark:text-beige/40 text-2xl flex items-center justify-center hover:border-forest hover:text-forest transition-all">
                +
              </button>
            </div>
            <input ref={extraInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleExtraUpload} />
          </div>

          <div className="mt-6">
            <label className="text-xs tracking-widest uppercase text-dark/50 dark:text-beige/50 block mb-1">Description</label>
            <textarea rows={3} value={form.description} onChange={e=>setForm({...form,description:e.target.value})}
              className="w-full bg-transparent border-b border-forest/30 dark:border-beige/30 py-2 text-dark dark:text-beige focus:outline-none text-sm resize-none" />
          </div>
          <div className="mt-4 flex items-center gap-3">
            <input type="checkbox" id="featured" checked={form.featured} onChange={e=>setForm({...form,featured:e.target.checked})} />
            <label htmlFor="featured" className="text-sm text-dark/70 dark:text-beige/70">Mark as Featured (shows on homepage)</label>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <input type="checkbox" id="show_in_hero" checked={form.show_in_hero} onChange={e=>setForm({...form,show_in_hero:e.target.checked})} />
            <label htmlFor="show_in_hero" className="text-sm text-dark/70 dark:text-beige/70">Use this image in the homepage hero collage</label>
          </div>
          {msg && <p className="mt-4 text-sm text-forest dark:text-rose">{msg}</p>}
          <div className="mt-6 flex gap-4">
            <button type="submit" disabled={loading || uploading}
              className="text-xs tracking-widest uppercase bg-forest text-white px-8 py-3 hover:bg-teal transition-colors disabled:opacity-50">
              {loading ? "Saving…" : editing ? "Update" : "Add Artwork"}
            </button>
            {editing && <button type="button" onClick={()=>{setForm(EMPTY);setEditing(null);}}
              className="text-xs tracking-widest uppercase border border-forest/30 dark:border-beige/30 text-dark/60 dark:text-beige/60 px-6 py-3">
              Cancel
            </button>}
          </div>
        </form>

        {["Resin / Artifacts","Resin / Jewellery / Flower","Resin / Jewellery / Pearl","Oil Pastels","Acrylic Art"].map(cat => {
          const pieces = artworks.filter(a => a.category === cat);
          if (!pieces.length) return null;
          return (
            <div key={cat} className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <p className="font-serif text-2xl text-forest dark:text-beige">{cat}</p>
                <span className="text-xs text-dark/40 dark:text-beige/40">{pieces.length} item{pieces.length !== 1 ? "s" : ""}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pieces.map(art => (
                  <div key={art.id} className="border border-forest/10 dark:border-beige/10 p-4 flex gap-4 hover:border-forest/30 dark:hover:border-beige/30 transition-colors">
                    {art.image_url && <div className="relative w-20 h-24 flex-shrink-0 overflow-hidden"><Image src={art.image_url} alt={art.title} fill className="object-cover" /></div>}
                    <div className="flex-1 min-w-0">
                      <p className="font-serif text-lg text-dark dark:text-beige truncate">{art.title}</p>
                      <p className="text-sm text-forest dark:text-rose mt-1">₹{art.price?.toLocaleString()} · {art.availability}</p>
                      <p className="text-xs text-dark/40 dark:text-beige/40 mt-1">{(art.images||[]).length + 1} image{((art.images||[]).length + 1) !== 1 ? "s" : ""}</p>
                      <div className="flex gap-2 mt-1">
                        {art.featured && <span className="text-xs bg-rose/20 text-rose px-2 py-0.5 inline-block">Featured</span>}
                        {art.show_in_hero && <span className="text-xs bg-forest/20 text-forest dark:text-beige px-2 py-0.5 inline-block">In Hero</span>}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button onClick={()=>edit(art)} className="text-xs tracking-widest uppercase text-dark/50 dark:text-beige/50 hover:text-forest dark:hover:text-rose transition-colors">Edit</button>
                      <button onClick={()=>del(art.id)} className="text-xs tracking-widest uppercase text-red-400 hover:text-red-600 transition-colors">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
