"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CategoryIcon } from "@/components/maison/category-icons";
import { useT } from "@/i18n/locale-provider";
import { useToast } from "@/hooks/use-toast";

type Category = { id: string; name: string; slug: string; position: number; count: number };

export function CategoriesClient({ initial }: { initial: Category[] }) {
  const { t } = useT();
  const router = useRouter();
  const { toast } = useToast();
  const [cats, setCats] = React.useState(initial);
  const [name, setName] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  async function onAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setSaving(false);
    if (res.ok) {
      setName("");
      toast({ title: "Catégorie ajoutée" });
      router.refresh();
    } else {
      toast({ title: "Erreur", variant: "destructive" });
    }
  }

  async function onDelete(id: string, n: string) {
    if (!confirm(`Supprimer « ${n} » ?`)) return;
    const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast({ title: "Supprimée" });
      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink dark:text-cream">
          {t("admin.categories.title")}
        </h1>
        <p className="mt-1 font-serif text-base text-ink-soft dark:text-cream/70">
          {t("admin.categories.subtitle")}
        </p>
      </div>

      <form onSubmit={onAdd} className="flex items-end gap-3">
        <div className="flex-1 max-w-xs">
          <label className="font-label text-[0.6rem] uppercase tracking-[0.16em] text-bronze">{t("admin.categories.name")}</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5 rounded-sm border-bronze/45" placeholder="Robes" />
        </div>
        <Button type="submit" disabled={saving} className="rounded-full bg-ink font-label text-[0.72rem] uppercase tracking-[0.16em] text-cream hover:bg-terracotta">
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
          {t("admin.categories.new")}
        </Button>
      </form>

      <div className="card-vintage overflow-hidden rounded-sm">
        <ul className="divide-y divide-bronze/15">
          {cats.length === 0 && (
            <li className="p-6 font-serif text-sm text-ink-soft dark:text-cream/70">Aucune catégorie.</li>
          )}
          {cats.map((c) => (
            <li key={c.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex size-9 items-center justify-center rounded-full bg-bronze/15 text-bronze">
                  <CategoryIcon slug={c.slug} className="size-5" />
                </span>
                <div>
                  <p className="font-display text-sm font-semibold text-ink dark:text-cream">{c.name}</p>
                  <p className="font-label text-[0.55rem] uppercase tracking-[0.16em] text-bronze">
                    /{c.slug} · {c.count} produit(s)
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="size-8 text-terracotta hover:bg-terracotta/10" onClick={() => onDelete(c.id, c.name)}>
                <Trash2 className="size-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
