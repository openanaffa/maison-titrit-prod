"use client";

import * as React from "react";
import { X, ShoppingBag, Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { useCart, cartTotal, cartCount } from "@/lib/cart";
import { useT } from "@/i18n/locale-provider";
import { site } from "@/config/site";
import { whatsappCatalog } from "@/lib/brand";
import { WhatsAppIcon } from "@/components/maison/motifs";

/** Cart drawer — slide-in from the end side. */
export function CartDrawer() {
  const { t } = useT();
  const [open, setOpen] = React.useState(false);
  // Subscribe to item count for the badge + drawer contents
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const count = items.reduce((n, i) => n + i.qty, 0);
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label={t("cart.title")}
          className="relative inline-flex size-9 items-center justify-center rounded-full border border-bronze/40 text-ink transition-colors hover:bg-bronze/10 dark:text-cream"
        >
          <ShoppingBag className="size-4" />
          {count > 0 && (
            <span className="absolute -end-0.5 -top-0.5 inline-flex min-w-4 items-center justify-center rounded-full bg-terracotta px-1 font-label text-[0.5rem] text-cream">
              {count}
            </span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="vintage-paper w-[92vw] max-w-md border-bronze/40 p-0">
        <SheetTitle className="sr-only">{t("cart.title")}</SheetTitle>
        <SheetDescription className="sr-only">
          {t("cart.items", { count })}
        </SheetDescription>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-bronze/25 p-5">
            <h2 className="font-display text-xl font-semibold text-ink dark:text-cream">
              {t("cart.title")}
            </h2>
            <SheetClose asChild>
              <button aria-label="Close" className="text-ink-soft hover:text-terracotta dark:text-cream/70">
                <X className="size-5" />
              </button>
            </SheetClose>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-4 scroll-vintage">
            {items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                <ShoppingBag className="size-10 text-bronze/40" />
                <p className="font-serif text-base text-ink-soft dark:text-cream/70">
                  {t("cart.empty")}
                </p>
                <p className="font-serif text-sm text-ink-soft/70 dark:text-cream/60">
                  {t("cart.emptyDesc")}
                </p>
                <SheetClose asChild>
                  <Link
                    href="#collection"
                    className="mt-2 rounded-full border border-bronze/50 px-5 py-2 font-label text-[0.66rem] uppercase tracking-[0.16em] text-ink hover:border-terracotta hover:text-terracotta dark:text-cream"
                  >
                    {t("cta.continueShopping")}
                  </Link>
                </SheetClose>
              </div>
            ) : (
              <ul className="space-y-3">
                {items.map((item) => (
                  <li
                    key={`${item.productId}-${item.size}`}
                    className="flex gap-3 rounded-sm border border-bronze/20 p-3"
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={64}
                      height={64}
                      className="size-16 shrink-0 rounded-sm object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-sm font-semibold text-ink dark:text-cream">
                        {item.name}
                      </p>
                      <p className="font-label text-[0.55rem] uppercase tracking-[0.16em] text-bronze">
                        {t("cart.size")}: {item.size} · {item.ref}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="inline-flex items-center rounded-full border border-bronze/40">
                          <button
                            onClick={() => setQty(item.productId, item.size, item.qty - 1)}
                            aria-label="-"
                            className="inline-flex size-7 items-center justify-center text-ink hover:text-terracotta dark:text-cream"
                          >
                            <Minus className="size-3" />
                          </button>
                          <span className="w-7 text-center font-serif text-sm text-ink dark:text-cream">{item.qty}</span>
                          <button
                            onClick={() => setQty(item.productId, item.size, item.qty + 1)}
                            aria-label="+"
                            className="inline-flex size-7 items-center justify-center text-ink hover:text-terracotta dark:text-cream"
                          >
                            <Plus className="size-3" />
                          </button>
                        </div>
                        <span className="font-display text-sm font-semibold text-ink dark:text-cream">
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
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-bronze/25 p-5">
              <div className="flex items-center justify-between">
                <span className="font-label text-[0.66rem] uppercase tracking-[0.18em] text-bronze">
                  {t("cart.total")}
                </span>
                <span className="font-display text-2xl font-semibold text-ink dark:text-cream">
                  {total.toLocaleString("fr-FR")} {site.currency}
                </span>
              </div>
              <div className="mt-4 space-y-2">
                <SheetClose asChild>
                  <Button asChild className="h-12 w-full rounded-full bg-ink font-label text-[0.72rem] uppercase tracking-[0.18em] text-cream hover:bg-terracotta dark:bg-cream dark:text-ink">
                    <Link href="/panier">
                      {t("cta.viewCart")}
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button
                    asChild
                    variant="outline"
                    className="h-11 w-full rounded-full border-bronze/50 font-label text-[0.68rem] uppercase tracking-[0.16em] text-ink hover:border-terracotta hover:text-terracotta dark:text-cream"
                  >
                    <a href={whatsappCatalog} target="_blank" rel="noopener noreferrer">
                      <WhatsAppIcon className="size-4 text-terracotta" />
                      {t("cta.viewCatalog")}
                    </a>
                  </Button>
                </SheetClose>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
