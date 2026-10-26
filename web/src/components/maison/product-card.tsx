"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { site } from "@/config/site";
import { whatsappCatalog } from "@/lib/brand";
import { AmazighStar, WhatsAppIcon } from "@/components/maison/motifs";
import { CategoryIcon } from "@/components/maison/category-icons";
import { CATEGORIES } from "@/config/products";
import { useT } from "@/i18n/locale-provider";
import { track, trackFacebook } from "@/lib/analytics";
import type { ProductDTO } from "@/lib/products";

export function ProductCard({ product }: { product: ProductDTO }) {
  const { t } = useT();
  const detailHref = `/produit/${product.ref}`;
  const slugFor = (name: string) => CATEGORIES.find((c) => c.name === name)?.slug;

  const orderMsg = t("card.orderMsg", {
    name: product.name,
    ref: product.ref,
    size: "à confirmer",
    price: product.price,
  });
  const orderHref = `https://wa.me/${site.whatsapp.chat}?text=${encodeURIComponent(orderMsg)}`;

  const handleOrder = () => {
    track("select_item", {
      item_id: product.ref,
      item_name: product.name,
      price: product.price,
      currency: product.currency,
    });
    trackFacebook("InitiateCheckout", {
      content_ids: [product.ref],
      content_name: product.name,
      value: product.price,
      currency: "MAD",
    });
  };

  return (
    <article className="card-vintage group flex h-full flex-col overflow-hidden rounded-sm transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_24px_50px_-30px_rgba(28,26,23,0.55)]">
      <Link href={detailHref} className="relative block aspect-[4/5] overflow-hidden bg-sand/40" aria-label={product.name}>
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          loading="lazy"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/25 via-transparent to-transparent opacity-60" />
        {/* hover hint */}
        <span className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-ink/70 to-transparent p-3 text-center font-label text-[0.6rem] uppercase tracking-[0.22em] text-cream opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          {t("cta.viewDetails")} →
        </span>

        {product.featured && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-cream/90 px-2.5 py-1 font-label text-[0.6rem] uppercase tracking-[0.18em] text-terracotta backdrop-blur dark:bg-ink/80">
            <Sparkles className="size-3" />
            {t("card.signature")}
          </span>
        )}

        <span className="absolute right-3 top-3 rounded-full bg-ink/80 px-2.5 py-1 font-label text-[0.58rem] uppercase tracking-[0.2em] text-cream backdrop-blur dark:bg-cream/85 dark:text-ink">
          {t("card.cod")}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <p className="inline-flex items-center gap-1.5 font-label text-[0.62rem] uppercase tracking-[0.28em] text-bronze">
          <CategoryIcon slug={slugFor(product.category)} className="size-3.5" />
          {product.category}
        </p>
        <Link href={detailHref} className="mt-2">
          <h3 className="font-display text-2xl font-semibold leading-tight text-ink transition-colors hover:text-terracotta dark:text-cream">
            {product.name}
          </h3>
        </Link>
        {product.nameAmazigh && (
          <p className="tifinagh mt-1 text-sm text-bronze/90">{product.nameAmazigh}</p>
        )}

        <p className="mt-3 font-serif text-[0.95rem] leading-relaxed text-ink-soft line-clamp-3 dark:text-cream/75">
          {product.shortStory}
        </p>

        <dl className="mt-4 space-y-1.5 text-[0.78rem] text-ink-soft/90 dark:text-cream/70">
          <div className="flex gap-2">
            <dt className="font-label shrink-0 uppercase tracking-[0.18em] text-bronze/80">
              {t("card.materialLabel")}
            </dt>
            <dd className="font-serif">{product.materials}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="font-label shrink-0 uppercase tracking-[0.18em] text-bronze/80">
              {t("card.sizesLabel")}
            </dt>
            <dd className="font-serif">{product.sizes}</dd>
          </div>
        </dl>

        <div className="mt-auto pt-5">
          <div className="flex items-end justify-between">
            <div>
              <p className="font-label text-[0.6rem] uppercase tracking-[0.22em] text-ink-soft/70 dark:text-cream/60">
                {t("card.priceLabel")}
              </p>
              <p className="font-display text-2xl font-semibold text-ink dark:text-cream">
                {product.price.toLocaleString("fr-FR")}{" "}
                <span className="text-base font-normal text-bronze">
                  {product.currency}
                </span>
              </p>
            </div>
            <AmazighStar className="mb-1 size-6 text-bronze/50" strokeWidth={1.4} />
          </div>

          <div className="mt-4 flex gap-2">
            <Button
              asChild
              onClick={handleOrder}
              className="h-11 flex-1 rounded-full bg-ink font-label text-[0.72rem] uppercase tracking-[0.18em] text-cream transition-all hover:bg-terracotta dark:bg-cream dark:text-ink dark:hover:bg-terracotta dark:hover:text-cream"
            >
              <a href={orderHref} target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon className="size-4" />
                {t("cta.order")}
              </a>
            </Button>
          </div>
          <Link
            href={detailHref}
            className="mt-2 block text-center font-label text-[0.58rem] uppercase tracking-[0.2em] text-bronze/80 transition-colors hover:text-terracotta"
          >
            {t("cta.viewDetails")} →
          </Link>
          <a
            href={whatsappCatalog}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 block text-center font-label text-[0.58rem] uppercase tracking-[0.2em] text-bronze/70 transition-colors hover:text-terracotta"
          >
            {t("cta.viewCatalog")} →
          </a>
          <p className="mt-1.5 text-center font-label text-[0.58rem] uppercase tracking-[0.2em] text-bronze/80">
            {t("brand.payment")}
          </p>
        </div>
      </div>
    </article>
  );
}

