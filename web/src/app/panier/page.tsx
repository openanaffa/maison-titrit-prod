"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { useT } from "@/i18n/locale-provider";
import { site } from "@/config/site";
import { AmazighStar, OrnamentDivider } from "@/components/maison/motifs";

export default function CartPage() {
  const { t } = useT();
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <section className="vintage-paper min-h-[80vh] py-16 sm:py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="eyebrow flex items-center justify-center gap-2">
            <ShoppingBag className="size-3.5" />
            {t("cart.title")}
          </p>
          <h1 className="wordmark mt-3 text-3xl uppercase text-ink sm:text-4xl dark:text-cream">
            {t("cart.title")}
          </h1>
          <OrnamentDivider className="mt-4" width={180} />
        </div>

        {items.length === 0 ? (
          <div className="mt-12 flex flex-col items-center gap-4 text-center">
            <AmazighStar className="size-12 text-bronze/40" strokeWidth={1.4} />
            <p className="font-serif text-lg text-ink-soft dark:text-cream/70">
              {t("cart.empty")}
            </p>
            <p className="font-serif text-sm text-ink-soft/70 dark:text-cream/60">
              {t("cart.emptyDesc")}
            </p>
            <Button asChild className="mt-2 rounded-full bg-ink px-6 font-label text-[0.72rem] uppercase tracking-[0.18em] text-cream hover:bg-terracotta dark:bg-cream dark:text-ink">
              <Link href="/#collection">{t("cta.continueShopping")}</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
            {/* Items */}
            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  key={`${item.productId}-${item.size}`}
                  className="card-vintage flex gap-4 rounded-sm p-4"
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={96}
                    height={96}
                    className="size-24 shrink-0 rounded-sm object-cover"
                  />
                  <div className="flex-1">
                    <Link
                      href={`/produit/${item.ref}`}
                      className="font-display text-lg font-semibold text-ink hover:text-terracotta dark:text-cream"
                    >
                      {item.name}
                    </Link>
                    <p className="font-label text-[0.55rem] uppercase tracking-[0.16em] text-bronze">
                      {t("cart.size")}: {item.size} · {item.ref}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="inline-flex items-center rounded-full border border-bronze/40">
                        <button
                          onClick={() => setQty(item.productId, item.size, item.qty - 1)}
                          aria-label="-"
                          className="inline-flex size-8 items-center justify-center text-ink hover:text-terracotta dark:text-cream"
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="w-8 text-center font-serif text-sm text-ink dark:text-cream">{item.qty}</span>
                        <button
                          onClick={() => setQty(item.productId, item.size, item.qty + 1)}
                          aria-label="+"
                          className="inline-flex size-8 items-center justify-center text-ink hover:text-terracotta dark:text-cream"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                      <span className="font-display text-lg font-semibold text-ink dark:text-cream">
                        {(item.price * item.qty).toLocaleString("fr-FR")} {item.currency}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => remove(item.productId, item.size)}
                    aria-label={t("cart.remove")}
                    className="self-start text-ink-soft/60 hover:text-terracotta"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>

            {/* Summary */}
            <div className="card-vintage h-fit rounded-sm p-6">
              <h2 className="font-display text-xl font-semibold text-ink dark:text-cream">
                {t("checkout.summary")}
              </h2>
              <div className="mt-4 space-y-2 font-serif text-sm">
                {items.map((i) => (
                  <div key={`${i.productId}-${i.size}`} className="flex justify-between text-ink-soft dark:text-cream/75">
                    <span className="truncate pe-2">{i.name} × {i.qty}</span>
                    <span>{(i.price * i.qty).toLocaleString("fr-FR")} {i.currency}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-bronze/25 pt-4">
                <span className="font-label text-[0.66rem] uppercase tracking-[0.18em] text-bronze">
                  {t("cart.total")}
                </span>
                <span className="font-display text-2xl font-semibold text-ink dark:text-cream">
                  {total.toLocaleString("fr-FR")} {site.currency}
                </span>
              </div>
              <p className="mt-3 flex items-center gap-2 font-serif text-xs text-ink-soft/80 dark:text-cream/60">
                {t("checkout.payment")}
              </p>
              <Button asChild className="mt-5 h-12 w-full rounded-full bg-ink font-label text-[0.72rem] uppercase tracking-[0.18em] text-cream hover:bg-terracotta dark:bg-cream dark:text-ink">
                <Link href="/checkout">
                  {t("cta.checkout")}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Link
                href="/#collection"
                className="mt-3 flex items-center justify-center gap-1 font-label text-[0.62rem] uppercase tracking-[0.16em] text-bronze hover:text-terracotta"
              >
                <ArrowLeft className="size-3" />
                {t("cta.continueShopping")}
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
