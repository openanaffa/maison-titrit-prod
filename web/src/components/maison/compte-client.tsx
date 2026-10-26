"use client";

import * as React from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { User, Package, LogOut, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useT } from "@/i18n/locale-provider";
import { useToast } from "@/hooks/use-toast";
import { StatusBadge } from "@/components/admin/status-badge";
import { site } from "@/config/site";
import { AmazighStar, OrnamentDivider } from "@/components/maison/motifs";

type CompteUser = { id: string; name: string | null; email: string; phone: string | null; role: string };
type Order = {
  id: string;
  number: string;
  status: string;
  total: number;
  currency: string;
  createdAt: string;
  items: { id: string; name: string; quantity: number; size: string | null }[];
};

export function CompteClient({ user, orders }: { user: CompteUser; orders: Order[] }) {
  const { t } = useT();
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = React.useState(user.name ?? "");
  const [phone, setPhone] = React.useState(user.phone ?? "");
  const [saving, setSaving] = React.useState(false);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/compte/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone }),
    });
    setSaving(false);
    if (res.ok) toast({ title: t("compte.save") });
    else toast({ title: "Erreur", variant: "destructive" });
    router.refresh();
  }

  return (
    <section className="vintage-paper min-h-[80vh] py-12 sm:py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="eyebrow">{t("compte.title")}</p>
          <h1 className="wordmark mt-3 text-3xl uppercase text-ink sm:text-4xl dark:text-cream">
            {t("compte.title")}
          </h1>
          <p className="mt-2 font-serif text-base text-ink-soft dark:text-cream/70">
            {t("compte.subtitle", { name: user.name || user.email })}
          </p>
          <OrnamentDivider className="mt-4" width={180} />
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.3fr]">
          {/* Profile */}
          <div className="card-vintage rounded-sm p-6">
            <div className="flex items-center gap-3">
              <span className="inline-flex size-11 items-center justify-center rounded-full bg-bronze/20 text-bronze">
                <User className="size-5" />
              </span>
              <div>
                <h2 className="font-display text-lg font-semibold text-ink dark:text-cream">
                  {t("compte.profile")}
                </h2>
                <p className="font-label text-[0.55rem] uppercase tracking-[0.18em] text-bronze">
                  {user.role}
                </p>
              </div>
            </div>
            <form onSubmit={onSave} className="mt-5 space-y-4">
              <div>
                <Label className="font-label text-[0.6rem] uppercase tracking-[0.16em] text-bronze">{t("compte.name")}</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5 rounded-sm border-bronze/45" />
              </div>
              <div>
                <Label className="font-label text-[0.6rem] uppercase tracking-[0.16em] text-bronze">{t("compte.email")}</Label>
                <Input value={user.email} disabled className="mt-1.5 rounded-sm border-bronze/45 bg-muted/40" />
              </div>
              <div>
                <Label className="font-label text-[0.6rem] uppercase tracking-[0.16em] text-bronze">{t("compte.phone")}</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" className="mt-1.5 rounded-sm border-bronze/45" />
              </div>
              <Button type="submit" disabled={saving} className="h-10 w-full rounded-full bg-ink font-label text-[0.68rem] uppercase tracking-[0.16em] text-cream hover:bg-terracotta dark:bg-cream dark:text-ink">
                {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                {t("compte.save")}
              </Button>
            </form>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-bronze/50 py-2.5 font-label text-[0.62rem] uppercase tracking-[0.16em] text-ink-soft hover:border-terracotta hover:text-terracotta dark:text-cream/70"
            >
              <LogOut className="size-3.5" />
              {t("compte.signout")}
            </button>
          </div>

          {/* Orders */}
          <div className="card-vintage rounded-sm p-6">
            <div className="flex items-center gap-3 border-b border-bronze/20 pb-4">
              <Package className="size-5 text-terracotta" />
              <h2 className="font-display text-lg font-semibold text-ink dark:text-cream">
                {t("compte.orders")}
              </h2>
            </div>
            {orders.length === 0 ? (
              <div className="mt-6 flex flex-col items-center gap-3 text-center">
                <AmazighStar className="size-10 text-bronze/40" strokeWidth={1.4} />
                <p className="font-serif text-sm text-ink-soft dark:text-cream/70">{t("compte.noOrders")}</p>
              </div>
            ) : (
              <ul className="mt-4 divide-y divide-bronze/15">
                {orders.map((o) => (
                  <li key={o.id} className="py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-display text-sm font-semibold text-ink dark:text-cream">
                          {t("compte.orderNumber")} {o.number}
                        </p>
                        <p className="font-label text-[0.55rem] uppercase tracking-[0.16em] text-bronze">
                          {new Date(o.createdAt).toLocaleDateString("fr-FR")} · {t("compte.items", { count: o.items.reduce((n, i) => n + i.quantity, 0) })}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-display text-sm font-semibold text-ink dark:text-cream">
                          {o.total.toLocaleString("fr-FR")} {o.currency}
                        </span>
                        <StatusBadge status={o.status} />
                      </div>
                    </div>
                    <ul className="mt-2 space-y-0.5">
                      {o.items.map((i) => (
                        <li key={i.id} className="font-serif text-xs text-ink-soft/80 dark:text-cream/60">
                          • {i.name} — {i.size} × {i.quantity}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
