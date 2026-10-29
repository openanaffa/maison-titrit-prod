"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useT } from "@/i18n/locale-provider";
import { useToast } from "@/hooks/use-toast";
import { StatusBadge, STATUS_LABELS } from "@/components/admin/status-badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

type Row = {
  id: string;
  number: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  city: string;
  address: string;
  notes: string;
  total: number;
  currency: string;
  status: string;
  payment: string;
  createdAt: string;
  itemCount: number;
  userId: string | null;
  userName: string | null;
};

const FLOW: string[] = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

export function OrdersTableClient({ rows }: { rows: Row[] }) {
  const { t } = useT();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [filter, setFilter] = React.useState<string>("all");
  const [selected, setSelected] = React.useState<Row | null>(null);

  const currentQ = searchParams.get("q") ?? "";

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    router.push(`/makteb/orders?q=${encodeURIComponent(value)}`);
  }

  const filtered = rows.filter((r) => filter === "all" || r.status === filter);

  async function updateStatus(order: Row, status: string) {
    const res = await fetch(`/api/admin/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      toast({ title: "Statut mis à jour", description: `${order.number} → ${STATUS_LABELS[status] ?? status}` });
      router.refresh();
      setSelected(null);
    } else {
      toast({ title: "Erreur", variant: "destructive" });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink dark:text-cream">
          {t("admin.orders.title")}
        </h1>
        <p className="mt-1 font-serif text-base text-ink-soft dark:text-cream/70">
          {t("admin.orders.subtitle")}
        </p>
      </div>

      {/* Search + status filter */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-soft dark:text-cream/60" />
          <input
            type="search"
            placeholder={t("admin.common.search")}
            defaultValue={currentQ}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-3 py-2 rounded border border-bronze/45 bg-transparent text-sm text-ink dark:text-cream placeholder-ink-soft dark:placeholder-cream/60 focus:border-bronze outline-none"
          />
        </div>
        <button
          onClick={() => setFilter("all")}
          className={`rounded-full border px-3 py-1.5 font-label text-[0.62rem] uppercase tracking-[0.14em] ${filter === "all" ? "border-ink bg-ink text-cream" : "border-bronze/45 text-ink-soft dark:text-cream/70"}`}
        >
          Toutes ({rows.length})
        </button>
        {FLOW.map((s) => {
          const n = rows.filter((r) => r.status === s).length;
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-full border px-3 py-1.5 font-label text-[0.62rem] uppercase tracking-[0.14em] ${filter === s ? "border-ink bg-ink text-cream" : "border-bronze/45 text-ink-soft dark:text-cream/70"}`}
            >
              {STATUS_LABELS[s] ?? s} ({n})
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="card-vintage overflow-hidden rounded-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-bronze/20 bg-muted/40">
              <tr>
                <th className="p-3 text-start font-label text-[0.6rem] uppercase tracking-[0.18em] text-bronze">
                  {t("admin.orders.col.number")}
                </th>
                <th className="p-3 text-start font-label text-[0.6rem] uppercase tracking-[0.18em] text-bronze">
                  {t("admin.orders.col.customer")}
                </th>
                <th className="p-3 text-end font-label text-[0.6rem] uppercase tracking-[0.18em] text-bronze">
                  {t("admin.orders.col.total")}
                </th>
                <th className="p-3 text-center font-label text-[0.6rem] uppercase tracking-[0.18em] text-bronze">
                  {t("admin.orders.col.status")}
                </th>
                <th className="p-3 text-start font-label text-[0.6rem] uppercase tracking-[0.18em] text-bronze">
                  {t("admin.orders.col.date")}
                </th>
                <th className="p-3 text-end font-label text-[0.6rem] uppercase tracking-[0.18em] text-bronze">
                  {t("admin.orders.col.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bronze/15">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center font-serif text-sm text-ink-soft dark:text-cream/70">
                    {t("admin.orders.empty")}
                  </td>
                </tr>
              ) : (
                filtered.map((o) => (
                  <tr key={o.id} className="hover:bg-muted/30">
                    <td className="p-3">
                      <Link href={`/makteb/orders/${o.id}`}>
                        <a className="font-display text-sm font-semibold text-ink dark:text-cream hover:underline">
                          {o.number}
                        </a>
                      </Link>
                    </td>
                    <td className="p-3">
                      <p className="font-serif text-sm text-ink dark:text-cream">{o.customerName}</p>
                      <p className="font-label text-[0.55rem] uppercase tracking-[0.16em] text-bronze">
                        {o.customerPhone}
                      </p>
                    </td>
                    <td className="p-3 text-end font-display text-sm font-semibold text-ink dark:text-cream">
                      {o.total.toLocaleString("fr-FR")} {o.currency}
                    </td>
                    <td className="p-3 text-center"><StatusBadge status={o.status} /></td>
                    <td className="p-3 font-serif text-xs text-ink-soft dark:text-cream/70">
                      {new Date(o.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="p-3 text-end">
                      <Dialog>
                        <DialogTrigger asChild>
                          <button
                            onClick={() => setSelected(o)}
                            className="font-label text-[0.62rem] uppercase tracking-[0.16em] text-bronze hover:text-terracotta"
                          >
                            Détails
                          </button>
                        </DialogTrigger>
                      </Dialog>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order detail dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Commande {selected?.number}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 font-serif text-sm">
                <div><span className="font-label text-[0.6rem] uppercase tracking-[0.14em] text-bronze">Client</span><br />{selected.customerName}</div>
                <div><span className="font-label text-[0.6rem] uppercase tracking-[0.14em] text-bronze">Téléphone</span><br />{selected.customerPhone}</div>
                {selected.customerEmail && <div><span className="font-label text-[0.6rem] uppercase tracking-[0.14em] text-bronze">Email</span><br />{selected.customerEmail}</div>}
                <div><span className="font-label text-[0.6rem] uppercase tracking-[0.14em] text-bronze">Articles</span><br />{selected.itemCount}</div>
                {selected.city && <div><span className="font-label text-[0.6rem] uppercase tracking-[0.14em] text-bronze">Ville</span><br />{selected.city}</div>}
                <div><span className="font-label text-[0.6rem] uppercase tracking-[0.14em] text-bronze">Paiement</span><br />{selected.payment}</div>
              </div>
              {selected.address && <p className="font-serif text-sm text-ink-soft dark:text-cream/70"><span className="font-label text-[0.6rem] uppercase tracking-[0.14em] text-bronze">Adresse</span><br />{selected.address}</p>}
              {selected.notes && <p className="font-serif text-sm text-ink-soft dark:text-cream/70"><span className="font-label text-[0.6rem] uppercase tracking-[0.14em] text-bronze">Notes</span><br />{selected.notes}</p>}
              <div className="flex items-center justify-between border-t border-bronze/20 pt-3">
                <span className="font-label text-[0.6rem] uppercase tracking-[0.14em] text-bronze">Total</span>
                <span className="font-display text-lg font-semibold text-ink dark:text-cream">{selected.total.toLocaleString("fr-FR")} {selected.currency}</span>
              </div>

              {/* Status workflow */}
              <div>
                <p className="mb-2 font-label text-[0.6rem] uppercase tracking-[0.14em] text-bronze">Statut</p>
                <div className="flex flex-wrap gap-2">
                  {FLOW.map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(selected, s)}
                      className={`rounded-full border px-3 py-1.5 font-label text-[0.6rem] uppercase tracking-[0.12em] transition-colors ${
                        selected.status === s
                          ? "border-ink bg-ink text-cream"
                          : "border-bronze/45 text-ink-soft hover:border-terracotta hover:text-terracotta dark:text-cream/70"
                      }`}
                    >
                      {STATUS_LABELS[s] ?? s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* Link wrapper so order numbers navigate to the detail page. */
function Link({ children, href }: { children: React.ReactNode; href: string }) {
  const router = useRouter();
  return (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault();
        router.push(href);
      }}
    >
      {children}
    </a>
  );
}
