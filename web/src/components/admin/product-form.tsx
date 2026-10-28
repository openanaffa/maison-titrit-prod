"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ArrowLeft, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useT } from "@/i18n/locale-provider";
import { useToast } from "@/hooks/use-toast";
import { track } from "@/lib/analytics";

export type ProductFormImage = { url: string; alt?: string };
export type ProductFormValues = {
  ref: string;
  name: string;
  nameAmazigh?: string;
  description: string;
  shortStory: string;
  materials: string;
  colors: string;
  sizes: string;
  price: number;
  salePrice?: number | null;
  currency: string;
  inStock: boolean;
  featured: boolean;
  categoryId: string | null;
  images: ProductFormImage[];
};

export function ProductForm({
  mode,
  initial,
  categories,
  productId,
}: {
  mode: "create" | "edit";
  initial: ProductFormValues;
  categories: { id: string; name: string }[];
  productId?: string;
}) {
  const { t } = useT();
  const router = useRouter();
  const { toast } = useToast();
  const [values, setValues] = React.useState<ProductFormValues>(initial);
  const [saving, setSaving] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);

  function set<K extends keyof ProductFormValues>(k: K, v: ProductFormValues[K]) {
    setValues((s) => ({ ...s, [k]: v }));
  }

  function addImageUrl() {
    set("images", [...values.images, { url: "", alt: "" }]);
  }
  function setImage(i: number, patch: Partial<ProductFormImage>) {
    const next = [...values.images];
    next[i] = { ...next[i], ...patch };
    set("images", next);
  }
  function removeImage(i: number) {
    set("images", values.images.filter((_, idx) => idx !== i));
  }

  async function onUpload(file: File, i: number) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "upload failed");
      setImage(i, { url: json.url, alt: file.name.replace(/\.[^.]+$/, "") });
      toast({ title: "Image ajoutée" });
    } catch {
      toast({ title: "Upload échoué", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const url = mode === "create" ? "/api/admin/products" : `/api/admin/products/${productId}`;
      const method = mode === "create" ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, images: values.images.filter((x) => x.url.trim()) }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "save failed");
      track(mode === "create" ? "admin_product_create" : "admin_product_update", { ref: values.ref });
      toast({ title: mode === "create" ? "Produit créé" : "Produit mis à jour" });
      router.push("/makteb/products");
      router.refresh();
    } catch (e) {
      toast({ title: "Erreur", description: String(e).slice(0, 100), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Link
            href="/makteb/products"
            className="inline-flex items-center gap-2 font-label text-[0.62rem] uppercase tracking-[0.18em] text-bronze hover:text-terracotta"
          >
            <ArrowLeft className="size-3.5" />
            {t("admin.common.back")}
          </Link>
          <h1 className="mt-2 font-display text-3xl font-semibold text-ink dark:text-cream">
            {mode === "create" ? t("admin.products.new") : t("admin.products.edit")}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" className="rounded-full border-bronze/50 font-label text-[0.68rem] uppercase tracking-[0.16em]">
            <Link href="/makteb/products">{t("admin.common.cancel")}</Link>
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="rounded-full bg-ink font-label text-[0.72rem] uppercase tracking-[0.16em] text-cream hover:bg-terracotta dark:bg-cream dark:text-ink"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : null}
            {t("admin.common.save")}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        {/* Left — main fields */}
        <div className="space-y-5">
          <div className="card-vintage rounded-sm p-5">
            <h2 className="font-display text-lg font-semibold text-ink dark:text-cream">Informations</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Référence *">
                <Input value={values.ref} onChange={(e) => set("ref", e.target.value)} required className="rounded-sm border-bronze/45" disabled={mode === "edit"} />
              </Field>
              <Field label="Nom *">
                <Input value={values.name} onChange={(e) => set("name", e.target.value)} required className="rounded-sm border-bronze/45" />
              </Field>
              <Field label="Nom amazigh (Tifinagh)">
                <Input value={values.nameAmazigh ?? ""} onChange={(e) => set("nameAmazigh", e.target.value)} className="tifinagh rounded-sm border-bronze/45" />
              </Field>
              <Field label="Catégorie">
                <select
                  value={values.categoryId ?? ""}
                  onChange={(e) => set("categoryId", e.target.value || null)}
                  className="h-9 w-full rounded-sm border border-bronze/45 bg-card px-3 font-serif text-sm text-ink dark:text-cream"
                >
                  <option value="">—</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </Field>
            </div>
            <div className="mt-4">
              <Field label="Description (longue)">
                <Textarea
                  value={values.description}
                  onChange={(e) => set("description", e.target.value)}
                  rows={4}
                  className="rounded-sm border-bronze/45"
                />
              </Field>
            </div>
            <div className="mt-4">
              <Field label="Story courte (carte)">
                <Textarea
                  value={values.shortStory}
                  onChange={(e) => set("shortStory", e.target.value)}
                  rows={2}
                  className="rounded-sm border-bronze/45"
                />
              </Field>
            </div>
          </div>

          <div className="card-vintage rounded-sm p-5">
            <h2 className="font-display text-lg font-semibold text-ink dark:text-cream">Détails</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Matières">
                <Input value={values.materials} onChange={(e) => set("materials", e.target.value)} className="rounded-sm border-bronze/45" />
              </Field>
              <Field label="Couleurs">
                <Input value={values.colors} onChange={(e) => set("colors", e.target.value)} placeholder="Beige · Bleu Ciel · Rose Baby" className="rounded-sm border-bronze/45" />
              </Field>
              <Field label="Tailles">
                <Input value={values.sizes} onChange={(e) => set("sizes", e.target.value)} placeholder="S · M · L · XL" className="rounded-sm border-bronze/45" />
              </Field>
              <Field label="Devise">
                <Input value={values.currency} onChange={(e) => set("currency", e.target.value)} className="rounded-sm border-bronze/45" />
              </Field>
            </div>
          </div>

          <div className="card-vintage rounded-sm p-5">
            <h2 className="font-display text-lg font-semibold text-ink dark:text-cream">Prix & stock</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Prix (MAD) *">
                <Input type="number" value={values.price} onChange={(e) => set("price", Number(e.target.value))} required className="rounded-sm border-bronze/45" />
              </Field>
              <Field label="Prix promo (optionnel)">
                <Input type="number" value={values.salePrice ?? ""} onChange={(e) => set("salePrice", e.target.value ? Number(e.target.value) : null)} className="rounded-sm border-bronze/45" />
              </Field>
            </div>
            <div className="mt-4 flex gap-6">
              <label className="inline-flex items-center gap-2 font-serif text-sm text-ink-soft dark:text-cream/80">
                <input type="checkbox" checked={values.inStock} onChange={(e) => set("inStock", e.target.checked)} className="size-4 accent-terracotta" />
                {t("admin.products.inStock")}
              </label>
              <label className="inline-flex items-center gap-2 font-serif text-sm text-ink-soft dark:text-cream/80">
                <input type="checkbox" checked={values.featured} onChange={(e) => set("featured", e.target.checked)} className="size-4 accent-terracotta" />
                {t("admin.dashboard.featured")}
              </label>
            </div>
          </div>
        </div>

        {/* Right — images */}
        <div className="space-y-5">
          <div className="card-vintage rounded-sm p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-ink dark:text-cream">Images</h2>
              <Button type="button" variant="outline" size="sm" onClick={addImageUrl} className="rounded-full border-bronze/50 text-xs">
                <Plus className="size-3.5" /> Ajouter
              </Button>
            </div>
            <div className="mt-4 space-y-3">
              {values.images.length === 0 && (
                <p className="font-serif text-sm text-ink-soft/70 dark:text-cream/60">Aucune image. Collez une URL ou uploadez.</p>
              )}
              {values.images.map((img, i) => (
                <div key={i} className="rounded-sm border border-bronze/30 p-3">
                  <div className="flex gap-3">
                    <div className="size-20 shrink-0 overflow-hidden rounded-sm bg-sand/40">
                      {img.url ? (
                        <Image src={img.url} alt={img.alt || ""} width={80} height={80} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-bronze/40">
                          {uploading ? <Loader2 className="size-5 animate-spin" /> : <Upload className="size-5" />}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <Input
                        placeholder="https://… /uploads/x.png"
                        value={img.url}
                        onChange={(e) => setImage(i, { url: e.target.value })}
                        className="rounded-sm border-bronze/45 text-xs"
                      />
                      <Input
                        placeholder="Texte alternatif"
                        value={img.alt ?? ""}
                        onChange={(e) => setImage(i, { alt: e.target.value })}
                        className="rounded-sm border-bronze/45 text-xs"
                      />
                      <div className="flex items-center gap-2">
                        <label className="inline-flex cursor-pointer items-center gap-1 font-label text-[0.58rem] uppercase tracking-[0.14em] text-bronze hover:text-terracotta">
                          <Upload className="size-3" /> Uploader
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) onUpload(f, i);
                            }}
                          />
                        </label>
                        <button type="button" onClick={() => removeImage(i)} className="ms-auto inline-flex items-center gap-1 font-label text-[0.58rem] uppercase tracking-[0.14em] text-terracotta hover:underline">
                          <Trash2 className="size-3" /> {t("admin.products.delete")}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="font-label text-[0.6rem] uppercase tracking-[0.16em] text-bronze">{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
