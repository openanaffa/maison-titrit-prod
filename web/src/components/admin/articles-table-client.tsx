"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/i18n/locale-provider";
import { useToast } from "@/hooks/use-toast";

type Row = {
  id: string;
  slug: string;
  title: string;
  published: boolean;
  publishedAt: string | null;
  updatedAt: string;
};

export function ArticlesTableClient({ rows }: { rows: Row[] }) {
  const { t } = useT();
  const router = useRouter();
  const { toast } = useToast();

  async function onDelete(row: Row) {
    if (!confirm(`Supprimer « ${row.title} » ?`)) return;
    const res = await fetch(`/api/admin/articles/${row.id}`, { method: "DELETE" });
    if (res.ok) {
      toast({ title: "Supprimé" });
      router.refresh();
    }
  }

  async function togglePublish(row: Row) {
    const res = await fetch(`/api/admin/articles/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !row.published }),
    });
    if (res.ok) {
      toast({ title: row.published ? "Dépublié" : "Publié" });
      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink dark:text-cream">Journal</h1>
          <p className="mt-1 font-serif text-base text-ink-soft dark:text-cream/70">
            Articles pour la portée et le SEO.
          </p>
        </div>
        <Button asChild className="rounded-full bg-ink font-label text-[0.72rem] uppercase tracking-[0.16em] text-cream hover:bg-terracotta dark:bg-cream dark:text-ink">
          <Link href="/makteb/blog/new">
            <Plus className="size-4" />
            Nouvel article
          </Link>
        </Button>
      </div>

      <div className="card-vintage overflow-hidden rounded-sm">
        <ul className="divide-y divide-bronze/15">
          {rows.length === 0 && (
            <li className="p-8 text-center font-serif text-sm text-ink-soft dark:text-cream/70">
              Aucun article. Créez le premier.
            </li>
          )}
          {rows.map((a) => (
            <li key={a.id} className="flex items-center justify-between p-4">
              <div className="min-w-0">
                <p className="truncate font-display text-sm font-semibold text-ink dark:text-cream">
                  {a.published ? null : <EyeOff className="me-1 inline size-3.5 text-ink-soft/50" />}
                  {a.title}
                </p>
                <p className="font-label text-[0.55rem] uppercase tracking-[0.16em] text-bronze">
                  /blog/{a.slug} · {a.publishedAt ? new Date(a.publishedAt).toLocaleDateString("fr-FR") : "brouillon"}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button asChild variant="ghost" size="icon" className="size-8">
                  <Link href={`/blog/${a.slug}`} target="_blank" aria-label="Voir">
                    <Eye className="size-3.5" />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" className="size-8" onClick={() => togglePublish(a)} aria-label="Publier">
                  {a.published ? <Eye className="size-3.5 text-emerald-600" /> : <EyeOff className="size-3.5" />}
                </Button>
                <Button asChild variant="ghost" size="icon" className="size-8">
                  <Link href={`/makteb/blog/${a.id}`} aria-label="Modifier">
                    <Pencil className="size-3.5" />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" className="size-8 text-terracotta hover:bg-terracotta/10" onClick={() => onDelete(a)} aria-label="Supprimer">
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
