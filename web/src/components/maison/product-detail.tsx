"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Minus, Plus, Share2, ShoppingBag, Sparkles, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { site } from "@/config/site";
import { whatsappCatalog } from "@/lib/brand";
import { useCart } from "@/lib/cart";
import { useToast } from "@/hooks/use-toast";
import { CategoryIcon } from "@/components/maison/category-icons";
import { CATEGORIES } from "@/config/products";
import {
  AmazighStar,
  NeedleThread,
  OrnamentDivider,
  Reveal,
  WhatsAppIcon,
} from "@/components/maison/motifs";
import { useT } from "@/i18n/locale-provider";
import { track, trackViewItem, trackAddToCart, trackFacebook } from "@/lib/analytics";
import { ProductCard } from "@/components/maison/product-card";
import type { ProductDTO } from "@/lib/products";

/** Parse "S · M · L · XL" → ["S","M","L","XL"]. */
function parseSizes(s: string): string[] {
  return s
    .split(/[·,/\-]/)
    .map((x) => x.trim())
    .filter(Boolean);
}

export function ProductDetailClient({
  product,
  related,
}: {
  product: ProductDTO;
  related: ProductDTO[];
}) {
  const { t } = useT();
  const slugFor = (name: string) => CATEGORIES.find((c) => c.name === name)?.slug;
  const sizes = React.useMemo(() => parseSizes(product.sizes), [product.sizes]);
  const images = product.images?.length
    ? product.images.map((i) => ({ url: i.url, alt: i.alt ?? product.name }))
    : [{ url: product.image, alt: product.name }];
  const [activeImg, setActiveImg] = React.useState(0);

  const [size, setSize] = React.useState<string>(sizes.length === 1 ? sizes[0] : "");
  const [qty, setQty] = React.useState(1);
  const [sizePrompt, setSizePrompt] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const total = (product.salePrice ?? product.price) * qty;

  // fire view_item once on mount (consent-gated, GA4 + Meta Pixel)
  React.useEffect(() => {
    trackViewItem({ ref: product.ref, name: product.name, price: product.salePrice ?? product.price, currency: product.currency, category: product.category });
  }, []);

  const orderMsg = t("card.orderMsg", {
    name: product.name,
    ref: product.ref,
    size: size || t("detail.selectSize"),
    price: total,
  });
  const orderHref = `https://wa.me/${site.whatsapp.chat}?text=${encodeURIComponent(orderMsg)}`;

  const handleOrder = () => {
    if (!size && sizes.length > 1) {
      setSizePrompt(true);
      return;
    }
    setSizePrompt(false);
    track("select_item", {
      item_id: product.ref,
      item_name: product.name,
      price: total,
      currency: product.currency,
      quantity: qty,
    });
    trackFacebook("InitiateCheckout", {
      content_ids: [product.ref],
      content_name: product.name,
      value: total,
      currency: "MAD",
      num_items: qty,
    });
    window.open(orderHref, "_blank", "noopener,noreferrer");
  };

  const handleShare = async () => {
    const url = window.location.href;
    track("share", { method: "native", item_id: product.ref });
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.shortStory,
          url,
        });
        return;
      } catch {
        /* user cancelled — fall through to copy */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const { toast } = useToast();
  const addToCart = useCart((s) => s.add);
  const handleAddToCart = () => {
    if (!size && sizes.length > 1) {
      setSizePrompt(true);
      return;
    }
    setSizePrompt(false);
    addToCart({
      productId: product.id,
      ref: product.ref,
      name: product.name,
      price: product.salePrice ?? product.price,
      currency: product.currency,
      image: product.image,
      size: size || (sizes[0] ?? "—"),
    }, qty);
    trackAddToCart({
      ref: product.ref,
      name: product.name,
      price: product.salePrice ?? product.price,
      currency: product.currency,
      qty,
    });
    toast({ title: t("cart.itemAdded"), description: `${product.name} — ${size || sizes[0]}` });
  };

  return (
    <section className="vintage-paper relative min-h-screen pb-24 pt-6 sm:pt-10">
      <AmazighStar
        className="pointer-events-none absolute -right-10 top-24 size-44 text-bronze/10"
        strokeWidth={1}
        aria-hidden="true"
      />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="flex items-center gap-2 text-[0.66rem] uppercase tracking-[0.18em] text-bronze">
          <Link href="/#accueil" className="hover:text-terracotta">{t("detail.home")}</Link>
          <span className="text-bronze/40">/</span>
          <Link href="/#collection" className="hover:text-terracotta">{t("detail.collection")}</Link>
          <span className="text-bronze/40">/</span>
          <span className="truncate text-ink/70 dark:text-cream/70">{product.name}</span>
        </nav>

        {/* Back */}
        <Link
          href="/#collection"
          className="mt-5 inline-flex items-center gap-2 font-label text-[0.66rem] uppercase tracking-[0.18em] text-ink-soft transition-colors hover:text-terracotta dark:text-cream/70"
        >
          <ArrowLeft className="size-3.5" />
          {t("detail.back")}
        </Link>

        {/* Main two-column */}
        <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
          {/* Image gallery */}
          <Reveal y={20}>
            <figure className="vintage-frame relative aspect-[4/5] overflow-hidden rounded-sm bg-sand/30">
              <img
                src={images[activeImg]?.url ?? product.image}
                alt={images[activeImg]?.alt ?? product.name}
                className="h-full w-full object-cover transition-opacity duration-300"
                loading="eager"
              />
              {product.featured && (
                <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-cream/90 px-2.5 py-1 font-label text-[0.6rem] uppercase tracking-[0.18em] text-terracotta backdrop-blur dark:bg-ink/80">
                  <Sparkles className="size-3" />
                  {t("card.signature")}
                </span>
              )}
              {!product.inStock && (
                <span className="absolute right-3 top-3 rounded-full bg-rose-600/90 px-2.5 py-1 font-label text-[0.58rem] uppercase tracking-[0.2em] text-cream backdrop-blur">
                  {t("admin.products.outOfStock")}
                </span>
              )}
              {product.salePrice && (
                <span className="absolute bottom-3 left-3 rounded-full bg-terracotta px-2.5 py-1 font-label text-[0.58rem] uppercase tracking-[0.18em] text-cream">
                  Promo
                </span>
              )}
            </figure>
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="mt-3 flex gap-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    aria-label={`Image ${i + 1}`}
                    className={`relative size-16 shrink-0 overflow-hidden rounded-sm border-2 transition-all ${
                      i === activeImg ? "border-terracotta" : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img.url} alt={img.alt} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </Reveal>

          {/* Details */}
          <Reveal delay={0.08} y={20}>
            <div>
              <p className="eyebrow inline-flex items-center gap-1.5">
                <CategoryIcon slug={slugFor(product.category)} className="size-3.5" />
                {product.category}
              </p>
              <h1 className="wordmark mt-3 text-3xl uppercase text-ink sm:text-4xl dark:text-cream">
                {product.name}
              </h1>
              {product.nameAmazigh && (
                <p className="tifinagh mt-2 text-lg text-bronze">{product.nameAmazigh}</p>
              )}

              <div className="mt-5 flex items-end gap-3">
                {product.salePrice ? (
                  <>
                    <p className="font-display text-4xl font-semibold text-terracotta">
                      {product.salePrice.toLocaleString("fr-FR")}{" "}
                      <span className="text-xl font-normal">{product.currency}</span>
                    </p>
                    <p className="mb-1 font-display text-xl text-ink-soft/60 line-through dark:text-cream/50">
                      {product.price.toLocaleString("fr-FR")} {product.currency}
                    </p>
                  </>
                ) : (
                  <p className="font-display text-4xl font-semibold text-ink dark:text-cream">
                    {product.price.toLocaleString("fr-FR")}{" "}
                    <span className="text-xl font-normal text-bronze">{product.currency}</span>
                  </p>
                )}
                <span className="mb-1 font-label text-[0.6rem] uppercase tracking-[0.2em] text-ink-soft/70 dark:text-cream/60">
                  {t("detail.perUnit")}
                </span>
              </div>

              <NeedleThread className="mt-5 h-6 text-bronze/70" />

              <p className="mt-5 font-serif text-lg leading-relaxed text-ink-soft dark:text-cream/80">
                {product.shortStory}
              </p>

              {/* Materials */}
              <dl className="mt-6 space-y-2 border-t border-bronze/25 pt-5 text-sm">
                <div className="flex gap-3">
                  <dt className="font-label w-28 shrink-0 uppercase tracking-[0.18em] text-bronze/80">
                    {t("detail.materials")}
                  </dt>
                  <dd className="font-serif text-ink-soft dark:text-cream/80">{product.materials}</dd>
                </div>
              </dl>

              {/* Sizes */}
              <div className="mt-6">
                <p className="font-label text-[0.66rem] uppercase tracking-[0.18em] text-bronze/80">
                  {t("detail.sizes")}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {sizes.map((s) => {
                    const active = s === size;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          setSize(s);
                          setSizePrompt(false);
                        }}
                        aria-pressed={active}
                        className={`h-10 min-w-11 rounded-full border px-4 font-label text-[0.72rem] uppercase tracking-[0.14em] transition-all ${
                          active
                            ? "border-ink bg-ink text-cream dark:border-cream dark:bg-cream dark:text-ink"
                            : "border-bronze/45 text-ink/80 hover:border-terracotta hover:text-terracotta dark:text-cream/80"
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
                {sizePrompt && (
                  <p className="mt-2 font-label text-[0.6rem] uppercase tracking-[0.18em] text-terracotta">
                    {t("detail.sizePrompt")}
                  </p>
                )}
              </div>

              {/* Quantity + total */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-bronze/25 pt-5">
                <div>
                  <p className="font-label text-[0.66rem] uppercase tracking-[0.18em] text-bronze/80">
                    {t("detail.quantity")}
                  </p>
                  <div className="mt-2 inline-flex items-center rounded-full border border-bronze/45">
                    <button
                      type="button"
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      aria-label="-"
                      className="inline-flex size-9 items-center justify-center text-ink transition-colors hover:text-terracotta dark:text-cream"
                    >
                      <Minus className="size-4" />
                    </button>
                    <span className="w-10 text-center font-display text-lg text-ink dark:text-cream">{qty}</span>
                    <button
                      type="button"
                      onClick={() => setQty((q) => Math.min(10, q + 1))}
                      aria-label="+"
                      className="inline-flex size-9 items-center justify-center text-ink transition-colors hover:text-terracotta dark:text-cream"
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>
                </div>
                <div className="text-end">
                  <p className="font-label text-[0.6rem] uppercase tracking-[0.2em] text-ink-soft/70 dark:text-cream/60">
                    {t("detail.total")}
                  </p>
                  <p className="font-display text-3xl font-semibold text-ink dark:text-cream">
                    {total.toLocaleString("fr-FR")}{" "}
                    <span className="text-lg font-normal text-bronze">{product.currency}</span>
                  </p>
                </div>
              </div>

              {/* Add to cart + order + share */}
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  onClick={handleAddToCart}
                  className="h-12 flex-1 rounded-full bg-ink font-label text-[0.74rem] uppercase tracking-[0.18em] text-cream transition-all hover:bg-terracotta dark:bg-cream dark:text-ink dark:hover:bg-terracotta dark:hover:text-cream"
                >
                  <ShoppingBag className="size-4" />
                  {t("cta.addToCart")}
                </Button>
                <Button
                  onClick={handleOrder}
                  variant="outline"
                  className="h-12 rounded-full border-bronze/50 px-5 font-label text-[0.74rem] uppercase tracking-[0.16em] text-ink hover:border-terracotta hover:bg-bronze/10 hover:text-terracotta dark:text-cream"
                >
                  <WhatsAppIcon className="size-4" />
                  {t("cta.orderWhatsapp")}
                </Button>
                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="h-12 rounded-full border-bronze/50 px-5 font-label text-[0.72rem] uppercase tracking-[0.16em] text-ink hover:border-terracotta hover:text-terracotta dark:text-cream"
                >
                  <Share2 className="size-4" />
                  {copied ? t("detail.shareCopied") : t("detail.share")}
                </Button>
              </div>

              <a
                href={whatsappCatalog}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 font-label text-[0.62rem] uppercase tracking-[0.2em] text-bronze/80 transition-colors hover:text-terracotta"
              >
                <WhatsAppIcon className="size-3.5" />
                {t("cta.viewCatalog")} →
              </a>

              <p className="mt-4 flex items-center gap-2 font-serif text-sm text-ink-soft/80 dark:text-cream/60">
                <Truck className="size-4 text-terracotta" />
                {t("detail.cod")} · {t("catalog.footnote")}
              </p>
            </div>
          </Reveal>
        </div>

        {/* Story band */}
        <Reveal delay={0.1}>
          <div className="mt-16 vintage-frame rounded-sm p-7 sm:p-10">
            <div className="text-center">
              <AmazighStar className="mx-auto size-8 text-terracotta" />
              <h2 className="wordmark mt-4 text-xl uppercase text-ink dark:text-cream">
                {t("detail.story")}
              </h2>
              <OrnamentDivider className="mt-5" width={180} />
            </div>
            <p className="mt-6 max-w-2xl mx-auto text-center font-serif text-lg leading-relaxed text-ink-soft dark:text-cream/80">
              {product.description}
            </p>
            <p className="mt-4 max-w-2xl mx-auto text-center font-serif text-base leading-relaxed text-ink-soft/85 dark:text-cream/70">
              {product.materials}. {product.sizes}. {t("detail.cod")}.
            </p>
            <p className="mt-6 text-center font-serif text-base text-bronze" dir="rtl">
              {site.arabicWelcome}
            </p>
          </div>
        </Reveal>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-20">
            <Reveal className="text-center">
              <p className="eyebrow">{t("detail.related")}</p>
              <OrnamentDivider className="mt-5" width={180} />
            </Reveal>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p, i) => (
                <Reveal key={p.id} delay={(i % 3) * 0.08}>
                  <ProductCard product={p} />
                </Reveal>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
