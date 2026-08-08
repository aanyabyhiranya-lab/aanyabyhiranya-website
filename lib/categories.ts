import { createClient } from "@/lib/supabase-server";

export type Category = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  sort_order: number;
  show_on_homepage: boolean;
};

export type CategoryNode = Category & { children: CategoryNode[]; path: string[] };

const UNCATEGORIZED_SLUG = "uncategorized";
// Matches the seed row in supabase-add-categories.sql — deleting a category
// reassigns its artworks here rather than orphaning or cascading the delete.
export const UNCATEGORIZED_ID = "00000000-0000-0000-0000-000000000003";

export function buildTree(rows: Category[]): CategoryNode[] {
  const byId = new Map<string, CategoryNode>();
  rows.forEach(r => byId.set(r.id, { ...r, children: [], path: [] }));
  const roots: CategoryNode[] = [];
  byId.forEach(node => {
    if (node.parent_id && byId.has(node.parent_id)) {
      byId.get(node.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  });
  const sortAndPath = (nodes: CategoryNode[], parentPath: string[]) => {
    nodes.sort((a, b) => a.sort_order - b.sort_order);
    nodes.forEach(n => {
      n.path = [...parentPath, n.slug];
      sortAndPath(n.children, n.path);
    });
  };
  sortAndPath(roots, []);
  return roots;
}

export function flatten(nodes: CategoryNode[]): CategoryNode[] {
  return nodes.flatMap(n => [n, ...flatten(n.children)]);
}

// Every node from the tree's root down to the matched slug path, in order —
// e.g. ["resin","jewellery"] -> [ResinNode, JewelleryNode]. Stops (returns a
// shorter array) as soon as a slug segment doesn't match anything.
export function findPathNodes(tree: CategoryNode[], slugs: string[]): CategoryNode[] {
  const nodes: CategoryNode[] = [];
  let level = tree;
  for (const slug of slugs) {
    const match = level.find(n => n.slug === slug);
    if (!match) break;
    nodes.push(match);
    level = match.children;
  }
  return nodes;
}

export function findByPath(tree: CategoryNode[], slugs: string[]): CategoryNode | null {
  const nodes = findPathNodes(tree, slugs);
  return nodes.length === slugs.length ? nodes[nodes.length - 1] : null;
}

export function descendantIds(node: CategoryNode): string[] {
  return [node.id, ...node.children.flatMap(descendantIds)];
}

export async function getCategoryTree(): Promise<CategoryNode[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("categories")
    .select("id, name, slug, parent_id, sort_order, show_on_homepage")
    .neq("slug", UNCATEGORIZED_SLUG)
    .order("sort_order", { ascending: true });
  return buildTree((data || []) as Category[]);
}

export function slugify(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
