import { notFound } from "next/navigation";
import { OrderDetailClient } from "@/components/admin/order-detail-client";
import { getOrder } from "@/lib/repositories/orders";
import { requirePagePermission } from "@/lib/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	await requirePagePermission("orders:read");
	const { id } = await params;
	const supabase = await createSupabaseServerClient();
	const order = await getOrder(supabase, id);
	if (!order) notFound();
	return <OrderDetailClient order={order} />;
}
