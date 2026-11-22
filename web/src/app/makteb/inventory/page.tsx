import { InventoryTableClient } from "@/components/admin/inventory-table-client";
import { db } from "@/lib/db";
import { requirePagePermission } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function MaktebInventoryPage() {
	await requirePagePermission("products:read");
	const variants = await db.productVariant.findMany({
		include: { product: { select: { id: true, ref: true, name: true } } },
		orderBy: { createdAt: "asc" },
	});
	const rows = variants.map((v) => ({
		id: v.id,
		sku: v.sku,
		size: v.size,
		color: v.color,
		isActive: v.isActive,
		onHand: v.onHand,
		reserved: v.reserved,
		available: v.onHand - v.reserved,
		lowStockThreshold: v.lowStockThreshold,
		lowStock: v.onHand - v.reserved <= v.lowStockThreshold,
		outOfStock: v.onHand - v.reserved <= 0,
		productRef: v.product.ref,
		productName: v.product.name,
	}));
	return <InventoryTableClient rows={rows} />;
}
