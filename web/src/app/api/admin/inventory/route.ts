import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
	const { allowed } = await requirePermission("products:read");
	if (!allowed)
		return NextResponse.json({ error: "Non autorisé." }, { status: 403 });

	const url = new URL(req.url);
	const q = (url.searchParams.get("q") ?? "").trim().toLowerCase();
	const lowOnly = url.searchParams.get("lowStock") === "1";
	const outOnly = url.searchParams.get("outOfStock") === "1";

	const variants = await db.productVariant.findMany({
		include: {
			product: { select: { id: true, ref: true, name: true, inStock: true } },
		},
		orderBy: { createdAt: "asc" },
	});

	const rows = variants
		.map((v) => ({
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
			product: v.product,
		}))
		.filter((r) => {
			if (q) {
				const hay =
					`${r.product.ref} ${r.product.name} ${r.sku ?? ""} ${r.size ?? ""} ${r.color ?? ""}`.toLowerCase();
				if (!hay.includes(q)) return false;
			}
			if (lowOnly && !r.lowStock) return false;
			if (outOnly && !r.outOfStock) return false;
			return true;
		});

	return NextResponse.json({ rows });
}
