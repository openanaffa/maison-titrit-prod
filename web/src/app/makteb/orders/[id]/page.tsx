import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { OrderDetailClient } from "@/components/admin/order-detail-client";

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
  items: Array<{
    id: string;
    ref: string;
    name: string;
    size: string | null;
    price: number;
    quantity: number;
    product: { id: string; images: Array<{ url: string }> };
  }>;
};

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await db.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: { orderBy: { position: "asc" } },
            },
          },
        },
      },
      user: true,
    },
  });
  if (!order) notFound();

  const view: OrderView = {
    id: order.id,
    number: order.number,
    status: order.status,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    customerEmail: order.customerEmail ?? null,
    city: order.city ?? null,
    address: order.address ?? null,
    notes: order.notes ?? null,
    total: order.total,
    currency: order.currency,
    payment: order.payment,
    utmSource: order.utmSource ?? null,
    utmMedium: order.utmMedium ?? null,
    utmCampaign: order.utmCampaign ?? null,
    utmContent: order.utmContent ?? null,
    utmTerm: order.utmTerm ?? null,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    user: order.user ? { id: order.user.id, name: order.user.name } : null,
    items: order.items.map((i) => ({
      id: i.id,
      ref: i.ref,
      name: i.name,
      size: i.size ?? null,
      price: i.price,
      quantity: i.quantity,
      product: {
        id: i.product.id,
        images: i.product.images.map((img) => ({ url: img.url })),
      },
    })),
  };

  return <OrderDetailClient order={view} />;
}
