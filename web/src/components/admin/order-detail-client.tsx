"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/admin/status-badge";
import { OrderActions, StatusSelector } from "@/components/admin/order-detail-helpers";
import { OrderCustomer, OrderMeta, OrderProvenance } from "@/components/admin/order-detail-sections";
import { OrderItems } from "@/components/admin/order-items-table";
import { useToast } from "@/hooks/use-toast";
import { useT } from "@/i18n/locale-provider";
import { STATUS_LABELS } from "@/lib/types/constants";
import type { OrderView } from "@/lib/types";

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
          <h1 className="heading-vintage-lg">
            {t("admin.orders.detail.title")} {order.number}
          </h1>
          <p className="mt-1 body-vintage-muted">
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

      <OrderMeta order={order} />
      <OrderCustomer order={order} />
      <OrderActions order={order} />
      <OrderItems order={order} />

      {/* Status workflow */}
      <div className="card-vintage p-4">
        <StatusSelector order={order} onChange={(s) => updateStatus(s)} />
        {pendingStatus && (
          <p className="mt-2 font-label text-[0.55rem] body-vintage-soft">
            {t("admin.orders.detail.updating")}
          </p>
        )}
      </div>

      <OrderProvenance order={order} />
    </div>
  );
}
