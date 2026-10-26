"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Loader2, ShoppingBag, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/lib/cart";
import { useT } from "@/i18n/locale-provider";
import { site } from "@/config/site";
import { useSession } from "next-auth/react";
import { AmazighStar, OrnamentDivider, WhatsAppIcon } from "@/components/maison/motifs";
import { trackFacebook, trackBeginCheckout, trackPurchase } from "@/lib/analytics";

export default function CheckoutPage() {
  const { t } = useT();
  const router = useRouter();
  const { data: session } = useSession();
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);

  const [form, setForm] = React.useState({
    name: session?.user?.name ?? "",
    phone: "",
    email: session?.user?.email ?? "",
    city: "",
    address: "",
    notes: "",
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<{ number: string; whatsapp: string } | null>(null);

  // Fire begin_checkout once when checkout loads with items (consent-gated)
  React.useEffect(() => {
    if (items.length > 0) {
      trackBeginCheckout(
        items.map((i) => ({ ref: i.ref, name: i.name, price: i.price, qty: i.qty })),
        total,
        "MAD",
      );
    }
  }, []);

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (items.length === 0) {
      setError(t("checkout.empty"));
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            ref: i.ref,
            name: i.name,
            price: i.price,
            qty: i.qty,
            size: i.size,
          })),
          customer: form,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Erreur");
        return;
      }
      trackFacebook("Purchase", {
        value: total,
        currency: "MAD",
        num_items: items.length,
      });
      trackPurchase({
        number: json.order.number,
        total,
        currency: "MAD",
        items: items.map((i) => ({ ref: i.ref, name: i.name, price: i.price, qty: i.qty })),
      });
      setSuccess({ number: json.order.number, whatsapp: json.whatsapp });
      clear();
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  // Success screen
  if (success) {
    return (
      <section className="vintage-paper flex min-h-[80vh] items-center justify-center px-4 py-16">
        <div className="vintage-frame max-w-md rounded-sm bg-card/95 p-9 text-center">
          <span className="mx-auto inline-flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
            <Check className="size-7" />
          </span>
          <h1 className="wordmark mt-4 text-2xl uppercase text-ink dark:text-cream">
            {t("checkout.success")}
          </h1>
          <OrnamentDivider className="mt-4" width={160} />
          <p className="mt-5 font-serif text-base text-ink-soft dark:text-cream/80">
            {t("checkout.orderNumber")}: <span className="font-display font-semibold text-ink dark:text-cream">{success.number}</span>
          </p>
          <p className="mt-2 font-serif text-sm text-ink-soft/80 dark:text-cream/60">
            {t("checkout.successDesc")}
          </p>
          <a
            href={success.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ink font-label text-[0.72rem] uppercase tracking-[0.18em] text-cream transition-colors hover:bg-terracotta dark:bg-cream dark:text-ink"
          >
            <WhatsAppIcon className="size-4" />
            {t("cta.placeOrder")}
          </a>
          <Link
            href="/#collection"
            className="mt-3 inline-block font-label text-[0.62rem] uppercase tracking-[0.16em] text-bronze hover:text-terracotta"
          >
            {t("cta.continueShopping")}
          </Link>
        </div>
      </section>
    );
  }

  // Empty cart
  if (items.length === 0) {
    return (
      <section className="vintage-paper flex min-h-[80vh] items-center justify-center px-4 py-16">
        <div className="text-center">
          <AmazighStar className="mx-auto size-12 text-bronze/40" strokeWidth={1.4} />
          <p className="mt-4 font-serif text-lg text-ink-soft dark:text-cream/70">{t("checkout.empty")}</p>
          <Button asChild className="mt-4 rounded-full bg-ink px-6 font-label text-[0.72rem] uppercase tracking-[0.18em] text-cream dark:bg-cream dark:text-ink">
            <Link href="/#collection">{t("cta.continueShopping")}</Link>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="vintage-paper min-h-[80vh] py-12 sm:py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="eyebrow">{t("checkout.title")}</p>
          <h1 className="wordmark mt-3 text-3xl uppercase text-ink sm:text-4xl dark:text-cream">
            {t("checkout.title")}
          </h1>
          <p className="mt-2 font-serif text-base text-ink-soft dark:text-cream/70">
            {t("checkout.subtitle")}
          </p>
        </div>

        <form onSubmit={onSubmit} className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* Form fields */}
          <div className="space-y-5">
            {!session?.user && (
              <div className="rounded-sm bg-bronze/10 p-4 font-serif text-sm text-ink-soft dark:text-cream/75">
                <Link href={`/auth/signin?callbackUrl=/checkout`} className="font-display font-semibold text-terracotta hover:underline">
                  {t("auth.signin")}
                </Link>{" "}
                — {t("checkout.loginRequired")}
              </div>
            )}
            <div className="card-vintage rounded-sm p-5">
              <h2 className="font-display text-lg font-semibold text-ink dark:text-cream">
                {t("compte.profile")}
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label={t("checkout.name")}>
                  <Input required value={form.name} onChange={(e) => set("name", e.target.value)} className="rounded-sm border-bronze/45" />
                </Field>
                <Field label={t("checkout.phone")}>
                  <Input required type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} className="rounded-sm border-bronze/45" />
                </Field>
                <Field label={t("checkout.email")}>
                  <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className="rounded-sm border-bronze/45" />
                </Field>
                <Field label={t("checkout.city")}>
                  <Input required value={form.city} onChange={(e) => set("city", e.target.value)} className="rounded-sm border-bronze/45" />
                </Field>
              </div>
              <div className="mt-4">
                <Field label={t("checkout.address")}>
                  <Textarea required value={form.address} onChange={(e) => set("address", e.target.value)} rows={2} className="rounded-sm border-bronze/45" />
                </Field>
              </div>
              <div className="mt-4">
                <Field label={t("checkout.notes")}>
                  <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2} className="rounded-sm border-bronze/45" />
                </Field>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="card-vintage h-fit rounded-sm p-6">
            <h2 className="font-display text-lg font-semibold text-ink dark:text-cream">
              {t("checkout.summary")}
            </h2>
            <ul className="mt-4 space-y-2 font-serif text-sm">
              {items.map((i) => (
                <li key={`${i.productId}-${i.size}`} className="flex justify-between text-ink-soft dark:text-cream/75">
                  <span className="truncate pe-2">{i.name} × {i.qty} ({i.size})</span>
                  <span>{(i.price * i.qty).toLocaleString("fr-FR")} {i.currency}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center justify-between border-t border-bronze/25 pt-4">
              <span className="font-label text-[0.66rem] uppercase tracking-[0.18em] text-bronze">{t("cart.total")}</span>
              <span className="font-display text-2xl font-semibold text-ink dark:text-cream">{total.toLocaleString("fr-FR")} {site.currency}</span>
            </div>
            <p className="mt-3 flex items-center gap-2 font-serif text-xs text-ink-soft/80 dark:text-cream/60">
              <Truck className="size-3.5 text-terracotta" />
              {t("checkout.payment")}
            </p>

            {error && (
              <p className="mt-4 rounded-sm bg-terracotta/10 p-3 text-center font-serif text-sm text-terracotta">{error}</p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="mt-5 h-12 w-full rounded-full bg-ink font-label text-[0.72rem] uppercase tracking-[0.18em] text-cream hover:bg-terracotta dark:bg-cream dark:text-ink"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : <WhatsAppIcon className="size-4" />}
              {t("checkout.placeOrder")}
            </Button>
            <Link href="/panier" className="mt-3 block text-center font-label text-[0.6rem] uppercase tracking-[0.16em] text-bronze hover:text-terracotta">
              ← {t("cart.title")}
            </Link>
          </div>
        </form>
      </div>
    </section>
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
