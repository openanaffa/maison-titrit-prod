"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { AmazighStar } from "@/components/maison/motifs";
import { parseSizes } from "@/components/maison/product-card";
import { ProductGallery, type GalleryImage } from "@/components/maison/product-gallery";
import { ProductPurchase } from "@/components/maison/product-purchase";
import { ProductRelated, ProductStory } from "@/components/maison/product-story";
import { useT } from "@/i18n/locale-provider";
import { trackViewItem } from "@/lib/analytics";
import type { ProductDTO } from "@/lib/types";

/** Parse "S · M · L · XL" → ["S","M","L","XL"]. */

export function ProductDetailClient({
  product,
  related,
}: {
  product: ProductDTO;
  related: ProductDTO[];
}) {
  const { t } = useT();
  const sizes = React.useMemo(() => parseSizes(product.sizes), [product.sizes]);
  const images: GalleryImage[] = product.images?.length
    ? product.images.map((i) => ({ url: i.url, alt: i.alt ?? product.name }))
    : [{ url: product.image, alt: product.name }];
  const [activeImg, setActiveImg] = React.useState(0);

  // fire view_item once on mount (consent-gated, GA4 + Meta Pixel)
  React.useEffect(() => {
    trackViewItem({ ref: product.ref, name: product.name, price: product.salePrice ?? product.price, currency: product.currency, category: product.category });
  }, []);

  return (
    <section className="vintage-paper relative min-h-screen pb-24 pt-6 sm:pt-10">
      <AmazighStar
        className="pointer-events-none absolute -right-10 top-24 size-44 text-bronze/10"
        strokeWidth={1}
        aria-hidden="true"
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <nav aria-label="breadcrumb" className="flex items-center gap-2 text-[0.66rem] uppercase tracking-[0.18em] text-bronze">
          <Link href="/#accueil" className="hover:text-terracotta">{t("detail.home")}</Link>
          <span className="text-bronze/40">/</span>
          <Link href="/#collection" className="hover:text-terracotta">{t("detail.collection")}</Link>
          <span className="text-bronze/40">/</span>
          <span className="truncate text-ink/70 dark:text-cream/70">{product.name}</span>
        </nav>

        <Link
          href="/#collection"
          className="mt-5 inline-flex items-center gap-2 font-label text-[0.66rem] uppercase tracking-[0.18em] text-ink-soft transition-colors hover:text-terracotta focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze-light dark:text-cream/70"
        >
          <ArrowLeft className="size-3.5 rtl:rotate-180" />
          {t("detail.back")}
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
          <ProductGallery
            product={product}
            images={images}
            activeImg={activeImg}
            onSelect={setActiveImg}
          />
          <ProductPurchase product={product} sizes={sizes} />
        </div>

        <ProductStory product={product} />
        <ProductRelated related={related} />
      </div>
    </section>
  );
}
