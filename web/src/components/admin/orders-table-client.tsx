"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useT } from "@/i18n/locale-provider";
import { useToast } from "@/hooks/use-toast";
import { StatusBadge } from "@/components/admin/status-badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { OrderRow } from "@/lib/types";
import { FLOW, STATUS_LABELS } from "@/lib/types/constants";




export function OrdersTableClient({ rows }: { rows: OrderRow[] }) {
  const { t } = useT();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [filter, setFilter] = React.useState<string>("all");
  const [selected, setSelected] = React.useState<OrderRow | null>(null);

  const currentQ = searchParams.get("q") ?? "";

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    router.push(`/makteb/orders?q=${encodeURIComponent(value)}`);
  }

  const filtered = rows.filter((r) => filter === "all" || r.status === filter);

  async function updateStatus(order: OrderRow, status: string) {
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
        <h1 className="heading-vintage-lg">
          {t("admin.orders.title")}
        </h1>
        <p className="mt-1 body-vintage">
          {t("admin.orders.subtitle")}
        </p>
      </div>

      {/* Search + status filter */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 body-vintage-soft" />
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
                <th className="p-3 text-start label-vintage-wide">
                  {t("admin.orders.col.number")}
                </th>
                <th className="p-3 text-start label-vintage-wide">
                  {t("admin.orders.col.customer")}
                </th>
                <th className="p-3 text-end label-vintage-wide">
                  {t("admin.orders.col.total")}
                </th>
                <th className="p-3 text-center label-vintage-wide">
                  {t("admin.orders.col.status")}
                </th>
                <th className="p-3 text-start label-vintage-wide">
                  {t("admin.orders.col.date")}
                </th>
                <th className="p-3 text-end label-vintage-wide">
                  {t("admin.orders.col.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bronze/15">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center body-vintage-muted">
                    {t("admin.orders.empty")}
                  </td>
                </tr>
              ) : (
                filtered.map((o) => (
                  <tr key={o.id} className="hover:bg-muted/30">
                    <td className="p-3">
                      <Link href={`/makteb/orders/${o.id}`}>
                        <a className="heading-vintage-sm hover:underline">
                          {o.number}
                        </a>
                      </Link>
                    </td>
                    <td className="p-3">
                      <p className="body-vintage-sm">{o.customerName}</p>
                      <p className="label-vintage-sm">
                        {o.customerPhone}
                      </p>
                    </td>
                    <td className="p-3 text-end heading-vintage-sm">
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
                <div><span className="label-vintage-tight">Client</span><br />{selected.customerName}</div>
                <div><span className="label-vintage-tight">Téléphone</span><br />{selected.customerPhone}</div>
                {selected.customerEmail && <div><span className="label-vintage-tight">Email</span><br />{selected.customerEmail}</div>}
                <div><span className="label-vintage-tight">Articles</span><br />{selected.itemCount}</div>
                {selected.city && <div><span className="label-vintage-tight">Ville</span><br />{selected.city}</div>}
                <div><span className="label-vintage-tight">Paiement</span><br />{selected.payment}</div>
              </div>
              {selected.address && <p className="body-vintage-muted"><span className="label-vintage-tight">Adresse</span><br />{selected.address}</p>}
              {selected.notes && <p className="body-vintage-muted"><span className="label-vintage-tight">Notes</span><br />{selected.notes}</p>}
              <div className="flex items-center justify-between border-t border-bronze/20 pt-3">
                <span className="label-vintage-tight">Total</span>
                <span className="heading-vintage">{selected.total.toLocaleString("fr-FR")} {selected.currency}</span>
              </div>

              {/* Status workflow */}
              <div>
                <p className="mb-2 label-vintage-tight">Statut</p>
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
