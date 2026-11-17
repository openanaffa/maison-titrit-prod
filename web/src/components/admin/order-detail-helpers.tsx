"use client";

import { Printer, MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useT } from "@/i18n/locale-provider";
import { FLOW, STATUS_LABELS } from "@/lib/types/constants";
import type { OrderView } from "@/lib/types";

export function Money({ amount, currency }: { amount: number; currency: string }) {
  return amount.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + " " + currency;
}

export function StatusSelector({
  order,
  onChange,
}: {
  order: OrderView;
  onChange: (status: string) => void;
}) {
  const { t } = useT();
  return (
    <div className="flex flex-wrap gap-2">
      <p className="label-vintage-tight">
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

export function OrderActions({ order }: { order: OrderView }) {
  const { t } = useT();
  return (
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
  );
}
