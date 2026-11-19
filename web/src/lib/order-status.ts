import { db } from "@/lib/db";

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

export const ALLOWED_TRANSITIONS: Record<string, string[]> = {
	PENDING: ["CONFIRMED", "CANCELLED"],
	CONFIRMED: ["PROCESSING", "CANCELLED"],
	PROCESSING: ["DISPATCHED", "CANCELLED"],
	DISPATCHED: ["DELIVERED"],
	DELIVERED: ["RETURN_REQUESTED"],
	RETURN_REQUESTED: ["RETURNED"],
	CANCELLED: [],
	RETURNED: [],
};

export function isAllowedTransition(from: string, to: string): boolean {
	return (ALLOWED_TRANSITIONS[from] ?? []).includes(to);
}

export function paymentStatusFor(status: OrderStatus): PaymentStatus {
	switch (status) {
		case "DELIVERED":
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
		const o = await tx.order.update({
			where: { id: orderId },
			data: {
				status: normalized,
				paymentStatus: nextPayment,
				fulfilmentStatus: nextFulfilment,
				updatedAt: new Date(),
			},
		});
		await tx.orderStatusHistory.create({
			data: {
				orderId,
				fromStatus: order.status,
				toStatus: normalized,
				paymentStatus: nextPayment,
				fulfilmentStatus: nextFulfilment,
				actorId: opts.actorId ?? null,
				reason: opts.reason ?? null,
			},
		});
		return o;
	});
	return updated;
}

export async function getOrderStatusHistory(orderId: string) {
	return db.orderStatusHistory.findMany({
		where: { orderId },
		orderBy: { createdAt: "asc" },
	});
}
