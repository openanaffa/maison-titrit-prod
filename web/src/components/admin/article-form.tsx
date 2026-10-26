"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { slugify } from "@/lib/slug";

export type ArticleFormValues = {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  coverImage: string;
  authorName: string;
  tags: string;
  published: boolean;
};

export function ArticleForm({
  mode,
  initial,
  articleId,
}: {
  mode: "create" | "edit";
  initial: ArticleFormValues;
  articleId?: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [v, setV] = React.useState<ArticleFormValues>(initial);
  const [saving, setSaving] = React.useState(false);

  function set<K extends keyof ArticleFormValues>(k: K, val: ArticleFormValues[K]) {
    setV((s) => ({ ...s, [k]: val }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const url = mode === "create" ? "/api/admin/articles" : `/api/admin/articles/${articleId}`;
    const method = mode === "create" ? "POST" : "PATCH";
    const payload = {
      ...v,
      slug: v.slug || slugify(v.title),
      publishedAt: v.published ? new Date().toISOString() : null,
    };
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (res.ok) {
      toast({ title: mode === "create" ? "Article créé" : "Article mis à jour" });
      router.push("/makteb/blog");
      router.refresh();
    } else {
      toast({ title: "Erreur", variant: "destructive" });
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Link href="/makteb/blog" className="inline-flex items-center gap-2 font-label text-[0.62rem] uppercase tracking-[0.18em] text-bronze hover:text-terracotta">
            <ArrowLeft className="size-3.5" />
            Retour
          </Link>
          <h1 className="mt-2 font-display text-3xl font-semibold text-ink dark:text-cream">
            {mode === "create" ? "Nouvel article" : "Modifier l'article"}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" className="rounded-full border-bronze/50 font-label text-[0.68rem] uppercase tracking-[0.16em]">
            <Link href="/makteb/blog">Annuler</Link>
          </Button>
          <Button type="submit" disabled={saving} className="rounded-full bg-ink font-label text-[0.72rem] uppercase tracking-[0.16em] text-cream hover:bg-terracotta dark:bg-cream dark:text-ink">
            {saving ? <Loader2 className="size-4 animate-spin" /> : null}
            Enregistrer
          </Button>
        </div>
      </div>

      <div className="card-vintage rounded-sm p-5 space-y-4">
        <div>
          <Label className="font-label text-[0.6rem] uppercase tracking-[0.16em] text-bronze">Titre *</Label>
          <Input value={v.title} onChange={(e) => set("title", e.target.value)} required className="mt-1.5 rounded-sm border-bronze/45" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label className="font-label text-[0.6rem] uppercase tracking-[0.16em] text-bronze">Slug</Label>
            <Input value={v.slug} onChange={(e) => set("slug", e.target.value)} placeholder="auto" className="mt-1.5 rounded-sm border-bronze/45" />
          </div>
          <div>
            <Label className="font-label text-[0.6rem] uppercase tracking-[0.16em] text-bronze">Auteur</Label>
            <Input value={v.authorName} onChange={(e) => set("authorName", e.target.value)} className="mt-1.5 rounded-sm border-bronze/45" />
          </div>
        </div>
        <div>
          <Label className="font-label text-[0.6rem] uppercase tracking-[0.16em] text-bronze">Extrait</Label>
          <Textarea value={v.excerpt} onChange={(e) => set("excerpt", e.target.value)} rows={2} className="mt-1.5 rounded-sm border-bronze/45" />
        </div>
        <div>
          <Label className="font-label text-[0.6rem] uppercase tracking-[0.16em] text-bronze">Image de couverture</Label>
          <Input value={v.coverImage} onChange={(e) => set("coverImage", e.target.value)} placeholder="/images/... ou https://…" className="mt-1.5 rounded-sm border-bronze/45" />
        </div>
        <div>
          <Label className="font-label text-[0.6rem] uppercase tracking-[0.16em] text-bronze">Tags (séparés par des virgules)</Label>
          <Input value={v.tags} onChange={(e) => set("tags", e.target.value)} placeholder="amazigh, mode modeste" className="mt-1.5 rounded-sm border-bronze/45" />
        </div>
        <div>
          <Label className="font-label text-[0.6rem] uppercase tracking-[0.16em] text-bronze">Corps (Markdown)</Label>
          <Textarea value={v.body} onChange={(e) => set("body", e.target.value)} rows={12} className="mt-1.5 rounded-sm border-bronze/45 font-mono text-sm" />
        </div>
        <label className="inline-flex items-center gap-2 font-serif text-sm text-ink-soft dark:text-cream/80">
          <input type="checkbox" checked={v.published} onChange={(e) => set("published", e.target.checked)} className="size-4 accent-terracotta" />
          Publier
        </label>
      </div>
    </form>
  );
}
