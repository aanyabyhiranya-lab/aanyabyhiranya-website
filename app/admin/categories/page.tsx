"use client";
export const dynamic = 'force-dynamic';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/lib/admin-fetch";
import { buildTree, UNCATEGORIZED_ID, type Category, type CategoryNode } from "@/lib/categories";

export default function AdminCategories() {
  const router = useRouter();
  const [rows, setRows] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => { load(); }, []);

  const load = async () => {
    const res = await adminFetch("/api/admin/categories");
    const { data } = await res.json();
    setRows(data || []);
  };

  const tree = buildTree(rows.filter(r => r.id !== UNCATEGORIZED_ID));
  const uncategorized = rows.find(r => r.id === UNCATEGORIZED_ID);

  // Flat, indented options for the parent picker — only nodes shallower than
  // sub-sub level can take a child, since categories go 3 levels deep at most.
  const parentOptions: { id: string; label: string }[] = [];
  const walk = (nodes: CategoryNode[], depth: number) => {
    nodes.forEach(n => {
      if (depth < 2) parentOptions.push({ id: n.id, label: `${"— ".repeat(depth)}${n.name}` });
      walk(n.children, depth + 1);
    });
  };
  walk(tree, 0);

  const add = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setMsg("");
    const res = await adminFetch("/api/admin/categories", {
      method: "POST",
      body: JSON.stringify({ name, parent_id: parentId || null }),
    });
    const json = await res.json();
    if (!res.ok) setMsg(json.error || "Couldn't add that category.");
    else { setName(""); setParentId(""); load(); }
    setLoading(false);
  };

  const rename = async (id: string, currentName: string) => {
    const next = prompt("Rename category", currentName);
    if (next === null || !next.trim() || next === currentName) return;
    await adminFetch(`/api/admin/categories/${id}`, { method: "PUT", body: JSON.stringify({ name: next.trim() }) });
    load();
  };

  const toggleHomepage = async (node: CategoryNode) => {
    await adminFetch(`/api/admin/categories/${node.id}`, {
      method: "PUT",
      body: JSON.stringify({ show_on_homepage: !node.show_on_homepage }),
    });
    load();
  };

  const move = async (siblings: CategoryNode[], index: number, dir: -1 | 1) => {
    const target = siblings[index + dir];
    if (!target) return;
    const a = siblings[index], b = target;
    await Promise.all([
      adminFetch(`/api/admin/categories/${a.id}`, { method: "PUT", body: JSON.stringify({ sort_order: b.sort_order }) }),
      adminFetch(`/api/admin/categories/${b.id}`, { method: "PUT", body: JSON.stringify({ sort_order: a.sort_order }) }),
    ]);
    load();
  };

  const del = async (node: CategoryNode) => {
    if (node.children.length) { alert("Move or delete its subcategories first."); return; }
    if (!confirm(`Delete "${node.name}"? Any artworks in it move to Uncategorized.`)) return;
    const res = await adminFetch(`/api/admin/categories/${node.id}`, { method: "DELETE" });
    if (!res.ok) { const json = await res.json(); alert(json.error || "Couldn't delete."); return; }
    load();
  };

  const renderNodes = (nodes: CategoryNode[], depth: number) => (
    <div className={depth > 0 ? "ml-6 border-l border-forest/10 dark:border-beige/10 pl-4" : ""}>
      {nodes.map((n, i) => (
        <div key={n.id} className="py-3 border-b border-forest/10 dark:border-beige/10">
          <div className="flex items-center gap-3 flex-wrap">
            <p className="font-serif text-lg text-dark dark:text-beige">{n.name}</p>
            <span className="text-xs text-dark/40 dark:text-beige/40">/{n.path.join("/")}</span>
            <div className="flex items-center gap-1 ml-auto">
              <button onClick={() => move(nodes, i, -1)} disabled={i === 0}
                className="text-xs px-2 py-1 text-dark/50 dark:text-beige/50 hover:text-forest dark:hover:text-rose disabled:opacity-20">↑</button>
              <button onClick={() => move(nodes, i, 1)} disabled={i === nodes.length - 1}
                className="text-xs px-2 py-1 text-dark/50 dark:text-beige/50 hover:text-forest dark:hover:text-rose disabled:opacity-20">↓</button>
              <button onClick={() => rename(n.id, n.name)}
                className="text-xs tracking-widest uppercase text-dark/50 dark:text-beige/50 hover:text-forest dark:hover:text-rose px-2">Rename</button>
              <button onClick={() => del(n)}
                className="text-xs tracking-widest uppercase text-red-400 hover:text-red-600 px-2">Delete</button>
            </div>
          </div>
          <label className="flex items-center gap-2 mt-2 text-sm text-dark/70 dark:text-beige/70">
            <input type="checkbox" checked={n.show_on_homepage} onChange={() => toggleHomepage(n)} />
            Show on homepage
          </label>
          {n.children.length > 0 && renderNodes(n.children, depth + 1)}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-beige dark:bg-dark pt-16">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="flex items-center gap-4 mb-10">
          <button onClick={() => router.push("/admin/dashboard")} className="text-xs text-dark/50 dark:text-beige/50 hover:text-forest dark:hover:text-rose">← Back</button>
          <p className="font-serif text-4xl text-forest dark:text-beige">Categories</p>
        </div>

        <form onSubmit={add} className="border border-forest/20 dark:border-beige/20 p-8 mb-12">
          <p className="font-serif text-2xl text-forest dark:text-beige mb-6">Add Category</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs tracking-widest uppercase text-dark/50 dark:text-beige/50 block mb-1">Name</label>
              <input value={name} onChange={e => setName(e.target.value)} required
                className="w-full bg-transparent border-b border-forest/30 dark:border-beige/30 py-2 text-dark dark:text-beige focus:outline-none text-sm" />
            </div>
            <div>
              <label className="text-xs tracking-widest uppercase text-dark/50 dark:text-beige/50 block mb-1">Parent (optional)</label>
              <select value={parentId} onChange={e => setParentId(e.target.value)}
                className="w-full bg-beige dark:bg-dark border-b border-forest/30 dark:border-beige/30 py-2 text-dark dark:text-beige focus:outline-none text-sm">
                <option value="">— Main category —</option>
                {parentOptions.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
              </select>
            </div>
          </div>
          {msg && <p className="mt-4 text-sm text-red-500">{msg}</p>}
          <button type="submit" disabled={loading}
            className="mt-6 text-xs tracking-widest uppercase bg-forest text-white px-8 py-3 hover:bg-teal transition-colors disabled:opacity-50">
            {loading ? "Adding…" : "Add Category"}
          </button>
        </form>

        <div className="border border-forest/20 dark:border-beige/20 p-8">
          <p className="font-serif text-2xl text-forest dark:text-beige mb-2">Category Tree</p>
          <p className="text-sm text-dark/50 dark:text-beige/50 mb-6">
            Check &quot;Show on homepage&quot; on any category — main, sub, or sub-sub — to give it its own carousel on the homepage.
            You can flag a broad category on its own, or flag several of its subcategories individually instead.
          </p>
          {renderNodes(tree, 0)}
          {uncategorized && (
            <div className="mt-6 pt-6 border-t border-forest/10 dark:border-beige/10">
              <p className="font-serif text-lg text-dark/60 dark:text-beige/60">Uncategorized</p>
              <p className="text-xs text-dark/40 dark:text-beige/40 mt-1">
                Safety bucket — artworks land here automatically if their category gets deleted. Not shown publicly; reassign them from the Artworks page.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
