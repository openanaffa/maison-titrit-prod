import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export type StockMovementType =
	| "RECEIVE"
	| "ADJUST"
	| "DAMAGE"
	| "RETURN"
	| "RESERVE"
	| "RELEASE"
	| "COMMIT";

export type StockResult = {
	variantId: string;
	onHand: number;
	reserved: number;
	available: number;
	movementId: string;
	replayed: boolean;
};

export type StockOptions = {
	actorId?: string | null;
	reason?: string | null;
	sourceRef?: string | null;
	idempotencyKey?: string | null;
};

const MAX_RETRIES = 5;

async function findExistingMovement(idempotencyKey: string | null | undefined) {
	if (!idempotencyKey) return null;
	return db.stockMovement.findUnique({ where: { idempotencyKey } });
}

async function loadVariant(variantId: string) {
	const v = await db.productVariant.findUnique({ where: { id: variantId } });
	if (!v) throw new Error(`Variant not found: ${variantId}`);
	return v;
}

function availableOf(v: { onHand: number; reserved: number }) {
	return v.onHand - v.reserved;
}

async function applyMovement(
	variantId: string,
	type: StockMovementType,
	quantity: number,
	transform: (v: { onHand: number; reserved: number }) => {
		onHand: number;
		reserved: number;
	},
	opts: StockOptions = {},
): Promise<StockResult> {
	for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
		// Re-check idempotency on every attempt (concurrent replay).
		const replay = await findExistingMovement(opts.idempotencyKey);
		if (replay) {
			const v = await loadVariant(variantId);
			return {
				variantId,
				onHand: v.onHand,
				reserved: v.reserved,
				available: availableOf(v),
				movementId: replay.id,
				replayed: true,
			};
		}

		const v = await loadVariant(variantId);
		const next = transform({ onHand: v.onHand, reserved: v.reserved });
		if (next.onHand < 0 || next.reserved < 0 || next.onHand < next.reserved) {
			throw new Error("Insufficient stock for operation");
		}
		if (type === "RESERVE" && availableOf(v) < Math.abs(quantity)) {
			throw new Error("Insufficient available stock");
		}

		try {
			const result = await db.$transaction(async (tx) => {
				const updated = await tx.productVariant.updateMany({
					where: { id: variantId, version: v.version },
					data: {
						onHand: next.onHand,
						reserved: next.reserved,
						version: { increment: 1 },
						updatedAt: new Date(),
					},
				});
				if (updated.count !== 1) {
					throw new Error("CONCURRENT_MODIFICATION");
				}
				const movement = await tx.stockMovement.create({
					data: {
						variantId,
						type,
						quantity,
						onHandAfter: next.onHand,
						reservedAfter: next.reserved,
						reason: opts.reason ?? null,
						actorId: opts.actorId ?? null,
						sourceRef: opts.sourceRef ?? null,
						idempotencyKey: opts.idempotencyKey ?? null,
					},
				});
				return {
					movementId: movement.id,
					onHand: next.onHand,
					reserved: next.reserved,
				};
			});
			return {
				variantId,
				onHand: result.onHand,
				reserved: result.reserved,
				available: result.onHand - result.reserved,
				movementId: result.movementId,
				replayed: false,
			};
		} catch (e) {
			// Concurrent replay with the same idempotency key: return existing.
			if (
				e instanceof Prisma.PrismaClientKnownRequestError &&
				e.code === "P2002" &&
				opts.idempotencyKey
			) {
				const replayMov = await findExistingMovement(opts.idempotencyKey);
				if (replayMov) {
					const vv = await loadVariant(variantId);
					return {
						variantId,
						onHand: vv.onHand,
						reserved: vv.reserved,
						available: availableOf(vv),
						movementId: replayMov.id,
						replayed: true,
					};
				}
			}
			if (
				e instanceof Error &&
				e.message === "CONCURRENT_MODIFICATION" &&
				attempt < MAX_RETRIES - 1
			) {
				continue;
			}
			throw e;
		}
	}
	throw new Error("Failed to apply stock movement after retries");
}

export async function receiveStock(
	variantId: string,
	qty: number,
	opts?: StockOptions,
) {
	if (qty <= 0) throw new Error("Quantity must be positive");
	return applyMovement(
		variantId,
		"RECEIVE",
		qty,
		(v) => ({
			onHand: v.onHand + qty,
			reserved: v.reserved,
		}),
		opts,
	);
}

export async function adjustStock(
	variantId: string,
	delta: number,
	opts?: StockOptions,
) {
	return applyMovement(
		variantId,
		"ADJUST",
		delta,
		(v) => ({
			onHand: v.onHand + delta,
			reserved: v.reserved,
		}),
		opts,
	);
}

export async function damageStock(
	variantId: string,
	qty: number,
	opts?: StockOptions,
) {
	if (qty <= 0) throw new Error("Quantity must be positive");
	return applyMovement(
		variantId,
		"DAMAGE",
		-qty,
		(v) => ({
			onHand: v.onHand - qty,
			reserved: v.reserved,
		}),
		opts,
	);
}

export async function returnStock(
	variantId: string,
	qty: number,
	opts?: StockOptions,
) {
	if (qty <= 0) throw new Error("Quantity must be positive");
	return applyMovement(
		variantId,
		"RETURN",
		qty,
		(v) => ({
			onHand: v.onHand + qty,
			reserved: v.reserved,
		}),
		opts,
	);
}

export async function reserveStock(
	variantId: string,
	qty: number,
	opts?: StockOptions,
) {
	if (qty <= 0) throw new Error("Quantity must be positive");
	return applyMovement(
		variantId,
		"RESERVE",
		qty,
		(v) => ({
			onHand: v.onHand,
			reserved: v.reserved + qty,
		}),
		opts,
	);
}

export async function releaseReservation(
	variantId: string,
	qty: number,
	opts?: StockOptions,
) {
	if (qty <= 0) throw new Error("Quantity must be positive");
	return applyMovement(
		variantId,
		"RELEASE",
		-qty,
		(v) => ({
			onHand: v.onHand,
			reserved: v.reserved - qty,
		}),
		opts,
	);
}

export async function commitStock(
	variantId: string,
	qty: number,
	opts?: StockOptions,
) {
	if (qty <= 0) throw new Error("Quantity must be positive");
	return applyMovement(
		variantId,
		"COMMIT",
		-qty,
		(v) => ({
			onHand: v.onHand - qty,
			reserved: v.reserved - qty,
		}),
		opts,
	);
}

export async function getAvailableStock(variantId: string): Promise<number> {
	const v = await loadVariant(variantId);
	return availableOf(v);
}

export function isLowStock(v: {
	onHand: number;
	reserved: number;
	lowStockThreshold: number;
}) {
	return v.onHand - v.reserved <= v.lowStockThreshold;
}

export async function reconcileVariant(variantId: string) {
	const v = await loadVariant(variantId);
	const last = await db.stockMovement.findFirst({
		where: { variantId },
		orderBy: { createdAt: "desc" },
	});
	const expectedOnHand = last ? last.onHandAfter : 0;
	const expectedReserved = last ? last.reservedAfter : 0;
	return {
		variantId,
		stored: { onHand: v.onHand, reserved: v.reserved },
		expected: { onHand: expectedOnHand, reserved: expectedReserved },
		match: v.onHand === expectedOnHand && v.reserved === expectedReserved,
		movementCount: await db.stockMovement.count({ where: { variantId } }),
	};
}
