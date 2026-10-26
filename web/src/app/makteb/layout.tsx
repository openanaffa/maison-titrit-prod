import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { AdminShell } from "@/components/admin/admin-shell";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function MaktebLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/signin?callbackUrl=/makteb");
  const ok = ["FOUNDER", "ADMIN", "MANAGER"].includes(user.role);
  if (!ok) redirect("/compte");

  // counts for sidebar badges
  const [products, pendingOrders, customers, categories] = await Promise.all([
    db.product.count(),
    db.order.count({ where: { status: "PENDING" } }),
    db.user.count({ where: { role: "CUSTOMER" } }),
    db.category.count(),
  ]);

  return (
    <AdminShell
      user={user}
      stats={{ products, pendingOrders, customers, categories }}
    >
      {children}
    </AdminShell>
  );
}
