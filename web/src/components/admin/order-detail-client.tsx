"use client";

import * as React from "react";
import { useT } from "@/i18n/locale-provider";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/status-badge";
import {
  Phone,
  Mail,
  MapPin,
  Printer,
  Image as ProductImageIcon,
  ArrowRight,
  MessageCircle,
} from "lucide-react";

type OrderItemView = {
  id: string;
  ref: string;
  name: string;
  size: string | null;
  price: number;
  quantity: number;
  product: {
    id: string;
    images: Array<{ url: string }>;
  };
};

type OrderView = {
  id: string;
  number: string;
  status: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  city: string | null;
  address: string | null;
  notes: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
  total: number;
  currency: string;
  payment: string;
  createdAt: Date;
  updatedAt: Date;
  user: { id: string; name: string | null } | null;
  items: OrderItemView[];
};

const FLOW: string[] = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

const STATUS_LABELS: Record<string, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
};

function StatusSelector({
  order,
  onChange,
}: {
  order: OrderView;
  onChange: (status: string) => void;
}) {
  const { t } = useT();
  return (
    <div className="flex flex-wrap gap-2">
      <p className="font-label text-[0.6rem] uppercase tracking-[0.14em] text-bronze">
        {t("admin.orders.detail.changeStatus")}
      </p>
      {FLOW.map((s) => (
        <button
          key={s}
          onClick={() => onChange(s)}
          disabled={order.status === s}
          className={`rounded-full border px-3 py-1.5 font-label text-[0.6rem] uppercase tracking-[0.12em] transition-colors ${
            order.status === s
              ? "border-ink bg-ink text-cream"
              : "border-bronze/45 text-ink-soft hover:border-terracotta hover:text-terracotta dark:text-cream/70"
          }`}
        >
          {STATUS_LABELS[s] ?? s}
        </button>
      ))}
    </div>
  );
}

function Money({ amount, currency }: { amount: number; currency: string }) {
  return amount.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + " " + currency;
}

export function OrderDetailClient({ order }: { order: OrderView }) {
  const { t } = useT();
  const router = useRouter();
  const { toast } = useToast();
  const [pendingStatus, setPendingStatus] = React.useState<string | null>(null);

  async function updateStatus(status: string) {
    setPendingStatus(status);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        toast({ title: "Statut mis à jour", description: `${order.number} → ${STATUS_LABELS[status] ?? status}` });
        router.refresh();
      } else {
        toast({ title: "Erreur", variant: "destructive" });
      }
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    } finally {
      setPendingStatus(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink dark:text-cream">
            {t("admin.orders.detail.title")} {order.number}
          </h1>
          <p className="mt-1 font-serif text-sm text-ink-soft dark:text-cream/70">
            {t("admin.orders.detail.subtitle", { number: order.number })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={order.status} />
          <Link href="/makteb/orders">
            <Button variant="outline" size="sm">
              <ArrowRight className="w-3 h-3 mr-1" /> {t("admin.common.back")}
            </Button>
          </Link>
        </div>
      </div>

      {/* Meta row: date + payment + updated */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-vintage p-4">
          <p className="font-label text-[0.6rem] uppercase tracking-[0.14em] text-bronze">
            {t("admin.orders.detail.created")}
          </p>
          <p className="font-serif text-sm text-ink dark:text-cream">
            {new Date(order.createdAt).toLocaleDateString("fr-FR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="card-vintage p-4">
          <p className="font-label text-[0.6rem] uppercase tracking-[0.14em] text-bronze">
            {t("admin.orders.detail.payment")}
          </p>
          <p className="font-serif text-sm text-ink dark:text-cream">{order.payment}</p>
        </div>
        <div className="card-vintage p-4">
          <p className="font-label text-[0.6rem] uppercase tracking-[0.14em] text-bronze">
            {t("admin.orders.detail.updated")}
          </p>
          <p className="font-serif text-sm text-ink dark:text-cream">
            {new Date(order.updatedAt).toLocaleDateString("fr-FR")}
          </p>
        </div>
      </div>

      {/* Customer */}
      <div className="card-vintage p-4">
        <p className="font-label text-[0.6rem] uppercase tracking-[0.14em] text-bronze mb-3 block">
          {t("admin.orders.detail.customer")}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-bronze" />
            <div>
              <p className="font-serif text-sm text-ink dark:text-cream">{order.customerName}</p>
              {order.user ? (
                <p className="font-label text-[0.55rem] uppercase tracking-[0.12em] text-ink-soft dark:text-cream/60">
                  {t("admin.orders.detail.loggedAs", { name: order.user.name ?? order.user.id })}
                </p>
              ) : null}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-bronze" />
            <p className="font-serif text-sm text-ink dark:text-cream">
              {order.customerEmail ?? t("admin.orders.detail.noEmail")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-bronze" />
            <div>
              <p className="font-serif text-sm text-ink dark:text-cream">
                {order.city ?? ""} {order.address ?? ""}
              </p>
              {order.city || order.address ? null : (
                <p className="font-label text-[0.55rem] uppercase tracking-[0.12em] text-ink-soft dark:text-cream/60">
                  {t("admin.orders.detail.noAddress")}
                </p>
              )}
            </div>
          </div>
        </div>
        {order.notes && (
          <div className="mt-4 pt-4 border-t border-bronze/20">
            <p className="font-label text-[0.6rem] uppercase tracking-[0.14em] text-bronze mb-1 block">
              {t("admin.orders.detail.notes")}
            </p>
            <p className="font-serif text-sm text-ink-soft dark:text-cream/70 whitespace-pre-line">
              {order.notes}
            </p>
          </div>
        )}
      </div>

      {/* Actions: WhatsApp + print */}
      <div className="flex flex-wrap gap-3 print:hidden">
        <a
          href={`https://wa.me/${order.customerPhone.replace(/^\+/, "")}?text=${encodeURIComponent(
            t("admin.orders.detail.whatsappMsg", { name: order.customerName, number: order.number }),
          )}`}
          target="_blank"
          rel="noopener"
          className="flex items-center gap-2 px-4 py-2 bg-ink text-cream dark:bg-cream dark:text-ink rounded font-display text-sm font-semibold hover:bg-terracotta transition-colors"
        >
          <MessageCircle className="w-4 h-4" /> {t("admin.orders.detail.whatsapp")}
        </a>
        <Button onClick={() => window.print()} variant="outline" className="print:hidden">
          <Printer className="w-4 h-4" /> {t("admin.orders.detail.print")}
        </Button>
      </div>

      {/* Items */}
      <div className="card-vintage overflow-hidden rounded-sm">
        <div className="p-4 border-b border-bronze/20 flex justify-between items-center">
          <h2 className="font-display text-lg font-semibold text-ink dark:text-cream">
            {t("admin.orders.detail.items")}
          </h2>
          <span className="font-label text-[0.6rem] uppercase tracking-[0.14em] text-bronze">
            {order.items.length} {t("admin.orders.detail.articleCount", { count: order.items.length })}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm divide-y divide-bronze/15">
            <thead className="border-b border-bronze/20 bg-muted/40">
              <tr>
                <th className="p-3 text-start font-label text-[0.6rem] uppercase tracking-[0.18em] text-bronze w-24">
                  {t("admin.orders.detail.photo")}
                </th>
                <th className="p-3 text-start font-label text-[0.6rem] uppercase tracking-[0.18em] text-bronze">
                  {t("admin.orders.detail.product")}
                </th>
                <th className="p-3 text-start font-label text-[0.6rem] uppercase tracking-[0.18em] text-bronze">
                  {t("admin.orders.detail.ref")}
                </th>
                <th className="p-3 text-center font-label text-[0.6rem] uppercase tracking-[0.18em] text-bronze w-16">
                  {t("admin.orders.detail.size")}
                </th>
                <th className="p-3 text-center font-label text-[0.6rem] uppercase tracking-[0.18em] text-bronze w-16">
                  {t("admin.orders.detail.qty")}
                </th>
                <th className="p-3 text-end font-label text-[0.6rem] uppercase tracking-[0.18em] text-bronze">
                  {t("admin.orders.detail.unitPrice")}
                </th>
                <th className="p-3 text-end font-label text-[0.6rem] uppercase tracking-[0.18em] text-bronze">
                  {t("admin.orders.detail.linePrice")}
                </th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="hover:bg-muted/30">
                  <td className="p-3">
                    {item.product.images[0]?.url ? (
                      <img
                        src={item.product.images[0].url}
                        alt={item.name}
                        className="w-14 h-14 object-cover rounded border border-bronze/30"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded border border-bronze/30 flex items-center justify-center bg-muted/40">
                        <ProductImageIcon className="w-6 h-6 text-bronze/40" />
                      </div>
                    )}
                  </td>
                  <td className="p-3">
                    <p className="font-serif text-sm text-ink dark:text-cream">{item.name}</p>
                  </td>
                  <td className="p-3 font-display text-sm text-ink dark:text-cream">{item.ref}</td>
                  <td className="p-3 text-center font-serif text-sm text-ink dark:text-cream">
                    {item.size ?? "—"}
                  </td>
                  <td className="p-3 text-center font-display text-sm text-ink dark:text-cream">
                    {item.quantity}
                  </td>
                  <td className="p-3 text-end font-serif text-sm text-ink-soft dark:text-cream/70">
                    <Money amount={item.price} currency={order.currency} />
                  </td>
                  <td className="p-3 text-end font-display text-sm font-semibold text-ink dark:text-cream">
                    <Money amount={item.price * item.quantity} currency={order.currency} />
                  </td>
                </tr>
              ))}
              <tr className="border-t border-bronze/20 font-semibold">
                <td colSpan={6} className="p-3 text-end">
                  {t("admin.orders.detail.total")}
                </td>
                <td className="p-3 text-end font-display text-lg text-ink dark:text-cream">
                  <Money amount={order.total} currency={order.currency} />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Status workflow */}
      <div className="card-vintage p-4">
        <StatusSelector order={order} onChange={(s) => updateStatus(s)} />
        {pendingStatus && (
          <p className="mt-2 font-label text-[0.55rem] text-ink-soft dark:text-cream/60">
            {t("admin.orders.detail.updating")}
          </p>
        )}
      </div>

      {/* UTM / provenance */}
      <div className="card-vintage p-4">
        <p className="font-label text-[0.6rem] uppercase tracking-[0.14em] text-bronze mb-3 block">
          {t("admin.orders.detail.provenance")}
        </p>
        {order.utmSource || order.utmMedium || order.utmCampaign || order.utmContent || order.utmTerm ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm font-serif text-ink dark:text-cream">
            {order.utmSource && (
              <div className="flex justify-between pb-1 border-b border-bronze/10 last:border-0">
                <span className="text-ink-soft dark:text-cream/60">{t("admin.orders.detail.utmSource")}</span>
                <span className="text-ink dark:text-cream">{order.utmSource}</span>
              </div>
            )}
            {order.utmMedium && (
              <div className="flex justify-between pb-1 border-b border-bronze/10 last:border-0">
                <span className="text-ink-soft dark:text-cream/60">{t("admin.orders.detail.utmMedium")}</span>
                <span className="text-ink dark:text-cream">{order.utmMedium}</span>
              </div>
            )}
            {order.utmCampaign && (
              <div className="flex justify-between pb-1 border-b border-bronze/10 last:border-0">
                <span className="text-ink-soft dark:text-cream/60">{t("admin.orders.detail.utmCampaign")}</span>
                <span className="text-ink dark:text-cream">{order.utmCampaign}</span>
              </div>
            )}
            {order.utmContent && (
              <div className="flex justify-between pb-1 border-b border-bronze/10 last:border-0">
                <span className="text-ink-soft dark:text-cream/60">{t("admin.orders.detail.utmContent")}</span>
                <span className="text-ink dark:text-cream">{order.utmContent}</span>
              </div>
            )}
            {order.utmTerm && (
              <div className="flex justify-between pb-1 border-b border-bronze/10 last:border-0">
                <span className="text-ink-soft dark:text-cream/60">{t("admin.orders.detail.utmTerm")}</span>
                <span className="text-ink dark:text-cream">{order.utmTerm}</span>
              </div>
            )}
          </div>
        ) : (
          <p className="font-label text-[0.6rem] text-ink-soft dark:text-cream/60">
            {t("admin.orders.detail.noUtm")}
          </p>
        )}
      </div>
    </div>
  );
}
