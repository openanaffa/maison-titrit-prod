import { db } from "@/lib/db";
import { commitStock, releaseReservation } from "@/lib/inventory";

/**
 * Settlement of checkout stock reservations when an order leaves the
 * held state (issue #145 follow-up).
 *
 * Reservation ledger convention (see /api/checkout): each hold is a
 * StockMovement of type RESERVE with idempotencyKey
 * `checkout:<order.idempotencyKey>:reserve:<line>` (or a `:g<gen>` replay
 * suffix) and quantity = +qty.
 *
 * A reservation is active until a settlement movement with one of the
 * recognized suffixes exists for its key. All settlement writes are
 * idempotent through the movement-unique idempotencyKey.
 */
export const RESERVE_PREFIX = "checkout:";
export const RESERVE_INFIX = ":reserve:";
export const SETTLED_SUFFIXES = [
	":release",
	":release-lifecycle",
	":commit",
	":commit-lifecycle",
] as const;

export type SettlementOutcome = {
	released: number;
	committed: number;
};

export function settlementKeyFor(
	reserveKey: string,
	toStatus: "CANCELLED" | "DELIVERED",
) {
	return toStatus === "CANCELLED"
		? `${reserveKey}:release-lifecycle`
		: `${reserveKey}:commit-lifecycle`;
}

async function activeReservations(
	orderKey: string,
): Promise<{ id: string; variantId: string; key: string; qty: number }[]> {
	const movements = await db.stockMovement.findMany({
		where: {
			type: "RESERVE",
			idempotencyKey: {
				startsWith: `${RESERVE_PREFIX}${orderKey}${RESERVE_INFIX}`,
			},
		},
		select: { id: true, variantId: true, idempotencyKey: true, quantity: true },
	});
	const active: {
		id: string;
		variantId: string;
		key: string;
		qty: number;
	}[] = [];
	for (const mv of movements) {
		if (!mv.idempotencyKey || mv.quantity <= 0) continue;
		const settled = await db.stockMovement.findFirst({
			where: {
				idempotencyKey: {
					in: SETTLED_SUFFIXES.map((s) => `${mv.idempotencyKey}${s}`),
				},
			},
			select: { id: true },
		});
		if (!settled) {
			active.push({
				id: mv.id,
				variantId: mv.variantId,
				key: mv.idempotencyKey,
				qty: mv.quantity,
			});
		}
	}
	return active;
}

/**
 * Release (CANCELLED) or commit (DELIVERED) every active reservation of
 * an order. Idempotent: settled reservations are skipped and the
 * settlement movement keys replay safely. Orders without an
 * idempotencyKey (legacy rows) have nothing to settle.
 */
export async function settleOrderReservations(
	orderId: string,
	toStatus: "CANCELLED" | "DELIVERED",
	opts: { actorId?: string | null; reason?: string | null } = {},
): Promise<SettlementOutcome> {
	const order = await db.order.findUnique({
		where: { id: orderId },
		select: { idempotencyKey: true },
	});
	if (!order?.idempotencyKey) {
		return { released: 0, committed: 0 };
	}
	const reservations = await activeReservations(order.idempotencyKey);
	let released = 0;
	let committed = 0;
	for (const r of reservations) {
		try {
			if (toStatus === "CANCELLED") {
				await releaseReservation(r.variantId, r.qty, {
					idempotencyKey: settlementKeyFor(r.key, "CANCELLED"),
					sourceRef: "order-lifecycle",
					reason: opts.reason ?? "order cancelled",
					actorId: opts.actorId ?? null,
				});
				released += r.qty;
			} else {
				await commitStock(r.variantId, r.qty, {
					idempotencyKey: settlementKeyFor(r.key, "DELIVERED"),
					sourceRef: "order-lifecycle",
					reason: opts.reason ?? "order delivered",
					actorId: opts.actorId ?? null,
				});
				committed += r.qty;
			}
		} catch (e) {
			console.error(
				`[inventory-settlement] ${toStatus} failed for movement ${r.id}`,
				e,
			);
		}
	}
	return { released, committed };
}
