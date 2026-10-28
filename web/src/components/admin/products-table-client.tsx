"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Plus, Search, Pencil, Trash2, Star, StarOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CategoryIcon } from "@/components/maison/category-icons";
import { useT } from "@/i18n/locale-provider";
import { useToast } from "@/hooks/use-toast";
import { track } from "@/lib/analytics";

type Row = {
  id: string;
  ref: string;
  name: string;
  price: number;
  salePrice: number | null;
  currency: string;
  category: string;
  categorySlug?: string;
  inStock: boolean;
  featured: boolean;
  image: string | null;
};

export function ProductsTableClient({
  rows,
  categories,
}: {
  rows: Row[];
  categories: { id: string; name: string; slug: string }[];
}) {
  const { t } = useT();
  const router = useRouter();
  const { toast } = useToast();
  const [query, setQuery] = React.useState("");
  const [filter, setFilter] = React.useState<string>("all");

  const filtered = rows.filter((r) => {
    const q = query.trim().toLowerCase();
    const matchQ = !q || r.name.toLowerCase().includes(q) || r.ref.toLowerCase().includes(q);
    const matchF = filter === "all" || (filter === "featured" && r.featured) || (filter === "out" && !r.inStock) || r.category === filter;
    return matchQ && matchF;
  });

  async function onDelete(row: Row) {
    if (!confirm(t("admin.products.deleteConfirm", { name: row.name }))) return;
    const res = await fetch(`/api/admin/products/${row.id}`, { method: "DELETE" });
    if (res.ok) {
      toast({ title: "Supprimé", description: row.name });
      track("admin_product_delete", { ref: row.ref });
      router.refresh();
    } else {
      toast({ title: "Erreur", description: "Suppression impossible.", variant: "destructive" });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink dark:text-cream">
            {t("admin.products.title")}
          </h1>
          <p className="mt-1 font-serif text-base text-ink-soft dark:text-cream/70">
            {t("admin.products.subtitle")}
          </p>
        </div>
        <Button asChild className="rounded-full bg-ink font-label text-[0.72rem] uppercase tracking-[0.16em] text-cream hover:bg-terracotta dark:bg-cream dark:text-ink">
          <Link href="/makteb/products/new">
            <Plus className="size-4" />
            {t("admin.products.new")}
          </Link>
        </Button>
      </div>

      {/* Search + filter */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-bronze/60" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("admin.common.search")}
            className="rounded-sm border-bronze/45 ps-9"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="h-9 rounded-sm border border-bronze/45 bg-card px-3 font-label text-[0.72rem] uppercase tracking-[0.14em] text-ink dark:text-cream"
        >
          <option value="all">Toutes</option>
          <option value="featured">★ {t("admin.dashboard.featured")}</option>
          <option value="out">{t("admin.products.outOfStock")}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="card-vintage overflow-hidden rounded-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-bronze/20 bg-muted/40">
              <tr className="text-start">
                <th className="p-3 text-start font-label text-[0.6rem] uppercase tracking-[0.18em] text-bronze">
                  {t("admin.products.col.name")}
                </th>
                <th className="p-3 text-start font-label text-[0.6rem] uppercase tracking-[0.18em] text-bronze">
                  {t("admin.products.col.category")}
                </th>
                <th className="p-3 text-end font-label text-[0.6rem] uppercase tracking-[0.18em] text-bronze">
                  {t("admin.products.col.price")}
                </th>
                <th className="p-3 text-center font-label text-[0.6rem] uppercase tracking-[0.18em] text-bronze">
                  {t("admin.products.col.stock")}
                </th>
                <th className="p-3 text-center font-label text-[0.6rem] uppercase tracking-[0.18em] text-bronze">
                  {t("admin.products.col.status")}
                </th>
                <th className="p-3 text-end font-label text-[0.6rem] uppercase tracking-[0.18em] text-bronze">
                  {t("admin.products.col.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bronze/15">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center font-serif text-sm text-ink-soft dark:text-cream/70">
                    {t("admin.products.empty")}
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/30">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        {r.image && (
                          <Image
                            src={r.image}
                            alt={r.name}
                            width={48}
                            height={48}
                            className="size-12 shrink-0 rounded-sm object-cover"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="truncate font-display text-sm font-semibold text-ink dark:text-cream">
                            {r.featured && <Star className="me-1 inline size-3 text-terracotta" />}
                            {r.name}
                          </p>
                          <p className="font-label text-[0.55rem] uppercase tracking-[0.16em] text-bronze">
                            {r.ref}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-2 font-serif text-sm text-ink-soft dark:text-cream/80">
                        <CategoryIcon slug={r.categorySlug} className="size-4 shrink-0 text-bronze" />
                        {r.category}
                      </span>
                    </td>
                    <td className="p-3 text-end font-display text-sm font-semibold text-ink dark:text-cream">
                      {r.salePrice ? (
                        <>
                          <span className="text-terracotta">{r.salePrice.toLocaleString("fr-FR")} {r.currency}</span>
                          <span className="ms-1 text-xs text-ink-soft/60 line-through">{r.price.toLocaleString("fr-FR")}</span>
                        </>
                      ) : (
                        `${r.price.toLocaleString("fr-FR")} ${r.currency}`
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 font-label text-[0.55rem] uppercase tracking-[0.14em] ${
                          r.inStock
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
                            : "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200"
                        }`}
                      >
                        {r.inStock ? t("admin.products.inStock") : t("admin.products.outOfStock")}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {r.featured ? (
                        <Star className="mx-auto size-4 text-terracotta" />
                      ) : (
                        <StarOff className="mx-auto size-4 text-bronze/30" />
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button asChild variant="ghost" size="icon" className="size-8">
                          <Link href={`/makteb/products/${r.id}`} aria-label={t("admin.products.edit")}>
                            <Pencil className="size-3.5" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 text-terracotta hover:bg-terracotta/10"
                          onClick={() => onDelete(r)}
                          aria-label={t("admin.products.delete")}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
