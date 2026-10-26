import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { CompteClient } from "@/components/maison/compte-client";

export const dynamic = "force-dynamic";

export default async function ComptePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/signin?callbackUrl=/compte");

  const orders = await db.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  const orderRows = orders.map((o) => ({
    id: o.id,
    number: o.number,
    status: o.status,
    total: o.total,
    currency: o.currency,
    createdAt: o.createdAt.toISOString(),
    items: o.items.map((i) => ({ id: i.id, name: i.name, quantity: i.quantity, size: i.size })),
  }));

  return <CompteClient user={user} orders={orderRows} />;
}
