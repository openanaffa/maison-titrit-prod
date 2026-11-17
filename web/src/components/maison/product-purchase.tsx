"use client";

import * as React from "react";
import { Minus, Plus, Share2, ShoppingBag, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { site } from "@/config/site";
import { CATEGORIES } from "@/config/products";
import { CategoryIcon } from "@/components/maison/category-icons";
import { NeedleThread, Reveal, WhatsAppIcon } from "@/components/maison/motifs";
import { useT } from "@/i18n/locale-provider";
import { useToast } from "@/hooks/use-toast";
import { track, trackAddToCart, trackFacebook } from "@/lib/analytics";
import { whatsappCatalog } from "@/lib/brand";
import { useCart } from "@/lib/cart";
import type { ProductDTO } from "@/lib/types";

export function ProductPurchase({
  product,
  sizes,
}: {
  product: ProductDTO;
  sizes: string[];
}) {
  const { t } = useT();
  const { toast } = useToast();
  const addToCart = useCart((s) => s.add);

  const [size, setSize] = React.useState<string>(sizes.length === 1 ? sizes[0] : "");
  const [qty, setQty] = React.useState(1);
  const [sizePrompt, setSizePrompt] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const unitPrice = product.salePrice ?? product.price;
  const total = unitPrice * qty;
  const slugFor = (name: string) => CATEGORIES.find((c) => c.name === name)?.slug;

  const orderMsg = t("card.orderMsg", {
    name: product.name,
    ref: product.ref,
    size: size || t("detail.selectSize"),
    price: total,
  });
  const orderHref = `https://wa.me/${site.whatsapp.chat}?text=${encodeURIComponent(orderMsg)}`;

  const handleOrder = () => {
    if (!size && sizes.length > 1) return setSizePrompt(true);
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
        await navigator.share({ title: product.name, text: product.shortStory, url });
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

  const handleAddToCart = () => {
    if (!size && sizes.length > 1) return setSizePrompt(true);
    setSizePrompt(false);
    addToCart({
      productId: product.id,
      ref: product.ref,
      name: product.name,
      price: unitPrice,
      currency: product.currency,
      image: product.image,
      size: size || (sizes[0] ?? "—"),
    }, qty);
    trackAddToCart({ ref: product.ref, name: product.name, price: unitPrice, currency: product.currency, qty });
    toast({ title: t("cart.itemAdded"), description: `${product.name} — ${size || sizes[0]}` });
  };

  return (
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
          <span className="body-vintage-soft font-label text-[0.6rem] uppercase tracking-[0.2em]">
            {t("detail.perUnit")}
          </span>
        </div>

        <NeedleThread className="mt-5 h-6 text-bronze/70" />
        <p className="mt-5 font-serif text-lg leading-relaxed text-ink-soft dark:text-cream/80">
          {product.shortStory}
        </p>

        <dl className="mt-6 space-y-2 border-t border-bronze/25 pt-5 text-sm">
          <div className="flex gap-3">
            <dt className="font-label w-28 shrink-0 uppercase tracking-[0.18em] text-bronze/80">
              {t("detail.materials")}
            </dt>
            <dd className="font-serif text-ink-soft dark:text-cream/80">{product.materials}</dd>
          </div>
        </dl>

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
                  className={`h-11 min-w-11 rounded-full border px-4 font-label text-[0.72rem] uppercase tracking-[0.14em] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze-light ${
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

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-bronze/25 pt-5">
          <div>
            <p className="font-label text-[0.66rem] uppercase tracking-[0.18em] text-bronze/80">
              {t("detail.quantity")}
            </p>
            <div className="mt-2 inline-flex items-center rounded-full border border-bronze/45">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={qty <= 1}
                aria-label={t("cart.decreaseQty")}
                className="inline-flex size-11 items-center justify-center text-ink transition-colors hover:text-terracotta disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze-light dark:text-cream"
              >
                <Minus className="size-4" />
              </button>
              <span aria-live="polite" className="w-10 text-center font-display text-lg text-ink dark:text-cream">{qty}</span>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(10, q + 1))}
                disabled={qty >= 10}
                aria-label={t("cart.increaseQty")}
                className="inline-flex size-11 items-center justify-center text-ink transition-colors hover:text-terracotta disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze-light dark:text-cream"
              >
                <Plus className="size-4" />
              </button>
            </div>
          </div>
          <div className="text-end">
            <p className="body-vintage-soft font-label text-[0.6rem] uppercase tracking-[0.2em]">
              {t("detail.total")}
            </p>
            <p className="heading-vintage-lg">
              {total.toLocaleString("fr-FR")}{" "}
              <span className="text-lg font-normal text-bronze">{product.currency}</span>
            </p>
          </div>
        </div>

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
  );
}
