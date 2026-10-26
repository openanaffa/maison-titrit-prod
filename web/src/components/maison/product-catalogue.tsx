"use client";

import * as React from "react";
import { ProductCard } from "@/components/maison/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { OrnamentDivider, Reveal, WhatsAppIcon } from "@/components/maison/motifs";
import { CategoryIcon } from "@/components/maison/category-icons";
import { CATEGORIES } from "@/config/products";
import { useT } from "@/i18n/locale-provider";
import { whatsappCatalog } from "@/lib/brand";
import { Button } from "@/components/ui/button";
import type { ProductDTO } from "@/lib/products";

export function ProductCatalogue() {
  const { t } = useT();
  const [products, setProducts] = React.useState<ProductDTO[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [active, setActive] = React.useState<string>("all");

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const url =
      active === "all"
        ? "/api/products"
        : `/api/products?category=${encodeURIComponent(active)}`;
    fetch(url)
      .then(async (r) => {
        if (!r.ok) throw new Error("network");
        const json = await r.json();
        if (cancelled) return;
        setProducts(json.products ?? []);
        setError(null);
      })
      .catch(() => {
        if (!cancelled) setError(t("catalog.error"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [active, t]);

  const filters = ["all", ...CATEGORIES.map((c) => c.name)] as const;
  const slugByName = React.useMemo(() => {
    const m = new Map<string, string>();
    for (const c of CATEGORIES) m.set(c.name, c.slug);
    return m;
  }, []);

  return (
    <section
      id="collection"
      className="vintage-paper relative scroll-mt-20 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center">
          <p className="eyebrow">{t("catalog.eyebrow")}</p>
          <h2 className="mt-4 font-display text-4xl font-semibold text-ink sm:text-5xl dark:text-cream">
            {t("catalog.title")}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl font-serif text-lg leading-relaxed text-ink-soft dark:text-cream/75">
            {t("catalog.subtitle")}
          </p>
          <OrnamentDivider className="mt-7" width={220} />
        </Reveal>

        <Reveal delay={0.1}>
          <div
            role="tablist"
            aria-label="Filtrer par catégorie"
            className="mt-10 flex flex-wrap items-center justify-center gap-2 sm:gap-3"
          >
            {filters.map((c) => {
              const isActive = c === active;
              const label = c === "all" ? t("catalog.filterAll") : c;
              const slug = c === "all" ? undefined : slugByName.get(c);
              return (
                <button
                  key={c}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActive(c)}
                  className={`inline-flex h-10 items-center gap-2 rounded-full border px-4 font-label text-[0.72rem] uppercase tracking-[0.18em] transition-all ${
                    isActive
                      ? "border-ink bg-ink text-cream dark:border-cream dark:bg-cream dark:text-ink"
                      : "border-bronze/45 text-ink/80 hover:border-terracotta hover:text-terracotta dark:text-cream/80"
                  }`}
                >
                  {slug ? (
                    <CategoryIcon slug={slug} className="size-4" />
                  ) : (
                    <SparklesSmall />
                  )}
                  {label}
                </button>
              );
            })}
          </div>
        </Reveal>

        <div className="mt-10">
          {error ? (
            <p className="py-16 text-center font-serif text-lg text-terracotta">{error}</p>
          ) : loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card-vintage overflow-hidden rounded-sm">
                  <Skeleton className="aspect-[4/5] w-full rounded-none bg-sand/60" />
                  <div className="space-y-3 p-5">
                    <Skeleton className="h-3 w-20 bg-sand/60" />
                    <Skeleton className="h-6 w-40 bg-sand/60" />
                    <Skeleton className="h-16 w-full bg-sand/60" />
                    <Skeleton className="h-10 w-full rounded-full bg-sand/60" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <p className="py-16 text-center font-serif text-lg text-ink-soft dark:text-cream/70">
              {t("catalog.empty")}
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p, i) => (
                <Reveal key={p.id} delay={(i % 3) * 0.08}>
                  <ProductCard product={p} />
                </Reveal>
              ))}
            </div>
          )}
        </div>

        <Reveal delay={0.2}>
          <p className="mt-12 text-center font-serif text-sm italic text-ink-soft/80 dark:text-cream/60">
            {t("catalog.footnote")}
          </p>
        </Reveal>

        <Reveal delay={0.25}>
          <div className="mt-8 flex justify-center">
            <Button
              asChild
              variant="outline"
              className="h-11 rounded-full border-bronze/50 px-6 font-label text-[0.72rem] uppercase tracking-[0.16em] text-ink hover:border-terracotta hover:text-terracotta dark:text-cream"
            >
              <a href={whatsappCatalog} target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon className="size-4 text-terracotta" />
                {t("cta.viewCatalog")}
              </a>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function SparklesSmall() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5" fill="currentColor" aria-hidden="true">
      <path d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8L12 2z" />
    </svg>
  );
}
