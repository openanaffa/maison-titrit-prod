import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { CompteClient } from "@/components/maison/compte-client";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ComptePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/signin?callbackUrl=/compte");

  const supabase = await createSupabaseServerClient();
  const { data: orders } = await supabase
    .from("Order")
    .select("*")
    .eq("userId", user.id)
    .order("createdAt", { ascending: false })
    .throwOnError();
  const orderIds = orders.map((order) => order.id);
  const { data: items } = orderIds.length
    ? await supabase.from("OrderItem").select("*").in("orderId", orderIds).throwOnError()
    : { data: [] };
  const itemsByOrder = new Map<string, typeof items>();
  for (const item of items) {
    const rows = itemsByOrder.get(item.orderId) ?? [];
    rows.push(item);
    itemsByOrder.set(item.orderId, rows);
  }

  const orderRows = orders.map((o) => ({
    id: o.id,
    number: o.number,
    status: o.status,
    total: o.total,
    currency: o.currency,
    createdAt: o.createdAt,
    items: (itemsByOrder.get(o.id) ?? []).map((i) => ({
      id: i.id,
      name: i.name,
      quantity: i.quantity,
      size: i.size,
    })),
  }));

  return <CompteClient user={user} orders={orderRows} />;
}
