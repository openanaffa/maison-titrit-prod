"use client";

import { Image as ProductImageIcon } from "lucide-react";

import { Money } from "@/components/admin/order-detail-helpers";
import { useT } from "@/i18n/locale-provider";
import type { OrderView } from "@/lib/types";

export function OrderItems({ order }: { order: OrderView }) {
  const { t } = useT();
  return (
    <div className="card-vintage overflow-hidden rounded-sm">
      <div className="p-4 border-b border-bronze/20 flex justify-between items-center">
        <h2 className="heading-vintage">
          {t("admin.orders.detail.items")}
        </h2>
        <span className="label-vintage-tight">
          {order.items.length} {t("admin.orders.detail.articleCount", { count: order.items.length })}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm divide-y divide-bronze/15">
          <thead className="border-b border-bronze/20 bg-muted/40">
            <tr>
              <th className="p-3 text-start label-vintage-wide w-24">
                {t("admin.orders.detail.photo")}
              </th>
              <th className="p-3 text-start label-vintage-wide">
                {t("admin.orders.detail.product")}
              </th>
              <th className="p-3 text-start label-vintage-wide">
                {t("admin.orders.detail.ref")}
              </th>
              <th className="p-3 text-center label-vintage-wide w-16">
                {t("admin.orders.detail.size")}
              </th>
              <th className="p-3 text-center label-vintage-wide w-16">
                {t("admin.orders.detail.qty")}
              </th>
              <th className="p-3 text-end label-vintage-wide">
                {t("admin.orders.detail.unitPrice")}
              </th>
              <th className="p-3 text-end label-vintage-wide">
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
                  <p className="body-vintage-sm">{item.name}</p>
                </td>
                <td className="p-3 font-display text-sm text-ink dark:text-cream">{item.ref}</td>
                <td className="p-3 text-center body-vintage-sm">
                  {item.size ?? "—"}
                </td>
                <td className="p-3 text-center font-display text-sm text-ink dark:text-cream">
                  {item.quantity}
                </td>
                <td className="p-3 text-end body-vintage-muted">
                  <Money amount={item.price} currency={order.currency} />
                </td>
                <td className="p-3 text-end heading-vintage-sm">
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
  );
}
