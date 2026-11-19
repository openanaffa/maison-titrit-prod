import { db } from "@/lib/db";
import { settleOrderReservations } from "@/lib/inventory-settlement";

export const ORDER_STATUSES = [
	"PENDING",
	"CONFIRMED",
	"PROCESSING",
	"DISPATCHED",
	"DELIVERED",
	"CANCELLED",
	"RETURN_REQUESTED",
	"RETURNED",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_STATUSES = ["UNPAID", "PAID", "REFUNDED"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const FULFILMENT_STATUSES = [
	"UNFULFILLED",
	"PROCESSING",
	"SHIPPED",
	"DELIVERED",
	"RETURNED",
] as const;
export type FulfilmentStatus = (typeof FULFILMENT_STATUSES)[number];

import { ALLOWED_TRANSITIONS } from "@/lib/types/constants";

export { ALLOWED_TRANSITIONS };

export function isAllowedTransition(from: string, to: string): boolean {
	return (ALLOWED_TRANSITIONS[from] ?? []).includes(to);
}

export function paymentStatusFor(status: OrderStatus): PaymentStatus {
	switch (status) {
		case "DELIVERED":
		case "RETURN_REQUESTED":
			return "PAID";
		case "CANCELLED":
			return "UNPAID";
		case "RETURNED":
			return "REFUNDED";
		default:
			return "UNPAID";
	}
}

export function fulfilmentStatusFor(status: OrderStatus): FulfilmentStatus {
	switch (status) {
		case "PENDING":
		case "CONFIRMED":
			return "UNFULFILLED";
		case "PROCESSING":
			return "PROCESSING";
		case "DISPATCHED":
			return "SHIPPED";
		case "DELIVERED":
		case "RETURN_REQUESTED":
			return "DELIVERED";
		case "RETURNED":
			return "RETURNED";
		case "CANCELLED":
			return "UNFULFILLED";
		default:
			return "UNFULFILLED";
	}
}

export type TransitionOptions = {
	actorId?: string | null;
	reason?: string | null;
};

export async function transitionOrder(
	orderId: string,
	toStatus: string,
	opts: TransitionOptions = {},
) {
	const normalized = toStatus.toUpperCase();
	if (!ORDER_STATUSES.includes(normalized as OrderStatus)) {
		throw new Error("INVALID_STATUS");
	}
	const order = await db.order.findUnique({ where: { id: orderId } });
	if (!order) throw new Error("NOT_FOUND");
	if (order.status === normalized) {
		return order;
	}
	if (!isAllowedTransition(order.status, normalized)) {
		throw new Error("INVALID_TRANSITION");
	}

	const nextPayment = paymentStatusFor(normalized as OrderStatus);
	const nextFulfilment = fulfilmentStatusFor(normalized as OrderStatus);

	const updated = await db.$transaction(async (tx) => {
		// Re-read and revalidate inside the transaction to avoid stale overwrites.
		const current = await tx.order.findUnique({ where: { id: orderId } });
		if (!current) throw new Error("NOT_FOUND");
		if (current.status === normalized) {
			return current;
		}
		if (!isAllowedTransition(current.status, normalized)) {
			throw new Error("INVALID_TRANSITION");
		}
		const result = await tx.order.updateMany({
			where: { id: orderId, status: current.status },
			data: {
				status: normalized,
				paymentStatus: nextPayment,
				fulfilmentStatus: nextFulfilment,
				updatedAt: new Date(),
			},
		});
		if (result.count !== 1) {
			throw new Error("CONCURRENT_MODIFICATION");
		}
		const o = await tx.order.findUnique({ where: { id: orderId } });
		if (!o) throw new Error("NOT_FOUND");
		await tx.orderStatusHistory.create({
			data: {
				orderId,
				fromStatus: current.status,
				toStatus: normalized,
				paymentStatus: nextPayment,
				fulfilmentStatus: nextFulfilment,
				actorId: opts.actorId ?? null,
				reason: opts.reason ?? null,
			},
		});
		return o;
	});
	// Inventory settlement (issue #145 follow-up): a cancelled order must
	// release its holds; a delivered order must convert holds into stock
	// decrements. Idempotent; failures are logged by the settlement helper.
	if (normalized === "CANCELLED" || normalized === "DELIVERED") {
		await settleOrderReservations(orderId, normalized, {
			actorId: opts.actorId ?? null,
			reason: opts.reason ?? null,
		});
	}
	return updated;
}

export async function getOrderStatusHistory(orderId: string) {
	return db.orderStatusHistory.findMany({
		where: { orderId },
		orderBy: { createdAt: "asc" },
	});
}
