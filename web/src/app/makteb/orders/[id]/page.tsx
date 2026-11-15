import { notFound } from "next/navigation";
import { OrderDetailClient } from "@/components/admin/order-detail-client";
import { requirePagePermission } from "@/lib/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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
  await requirePagePermission("orders:read");
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: order } = await supabase.from("Order").select("*").eq("id", id).maybeSingle().throwOnError();
  if (!order) notFound();
  const { data: items } = await supabase
    .from("OrderItem")
    .select("*")
    .eq("orderId", order.id)
    .throwOnError();
  const productIds = [...new Set(items.map((item) => item.productId))];
  const { data: images } = productIds.length
    ? await supabase
        .from("Image")
        .select("productId,url,position")
        .in("productId", productIds)
        .order("position")
        .throwOnError()
    : { data: [] as { productId: string; url: string; position: number }[] };
  const userResult = order.userId
    ? await supabase.from("User").select("id,name").eq("id", order.userId).maybeSingle().throwOnError()
    : { data: null };
  const imagesByProduct = new Map<string, Array<{ url: string }>>();
  for (const image of images) {
    const rows = imagesByProduct.get(image.productId) ?? [];
    rows.push({ url: image.url });
    imagesByProduct.set(image.productId, rows);
  }

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
    createdAt: new Date(order.createdAt),
    updatedAt: new Date(order.updatedAt),
    user: userResult.data ? { id: userResult.data.id, name: userResult.data.name } : null,
    items: items.map((i) => ({
      id: i.id,
      ref: i.ref,
      name: i.name,
      size: i.size ?? null,
      price: i.price,
      quantity: i.quantity,
      product: {
        id: i.productId,
        images: imagesByProduct.get(i.productId) ?? [],
      },
    })),
  };

  return <OrderDetailClient order={view} />;
}
