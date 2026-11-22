import { db } from "@/lib/db";
import { sendCustomerOrderUpdateEmail } from "@/lib/notify";
import type {
	CustomerNotificationEvent,
	CustomerOrderUpdatePayload,
} from "@/lib/types/notifications";

/** A SENDING claim older than this is considered abandoned. */
const STALE_CLAIM_MS = 60_000;

/** Prisma channel enum mirror (SQLite-compatible string column). */
export type NotificationChannel = "EMAIL";

/** The transition events that trigger a customer notification. */
const NOTIFYING_EVENTS: CustomerNotificationEvent[] = [
	"CONFIRMED",
	"DISPATCHED",
	"DELIVERED",
];

export function isNotifyingEvent(status: string): boolean {
	return NOTIFYING_EVENTS.includes(
		status.toUpperCase() as CustomerNotificationEvent,
	);
}

/** Channels that can carry this order's notification, with destinations. */
export function notificationChannelsFor(order: {
	customerEmail: string | null;
}): { channel: NotificationChannel; to: string }[] {
	const email = order.customerEmail?.trim();
	return email ? [{ channel: "EMAIL", to: email }] : [];
}

/**
 * Enqueue customer notifications for a transition event and attempt them
 * fire-and-forget. Duplicate-safe: the (orderId, event, channel) unique
 * index ignores re-enqueues for the same event. Never throws.
 */
export async function queueCustomerNotifications(
	order: CustomerOrderUpdatePayload & { id: string },
	event: CustomerNotificationEvent,
): Promise<void> {
	try {
		// Duplicate-safe enqueue: only create rows for channels that don't
		// already have one for this (order, event) pair. The unique index
		// @@unique([orderId, event, channel]) is the ultimate backstop.
		const existing = await db.orderNotification.findMany({
			where: { orderId: order.id, event, channel: "EMAIL" },
			select: { channel: true },
		});
		const known = new Set(existing.map((r) => r.channel));
		const rows = notificationChannelsFor(order)
			.filter((c) => !known.has(c.channel))
			.map((c) => ({
				orderId: order.id,
				event,
				channel: c.channel,
				to: c.to,
			}));
		if (rows.length > 0) {
			await db.orderNotification.createMany({ data: rows });
		}
		const pending = await db.orderNotification.findMany({
			where: {
				orderId: order.id,
				event,
				channel: "EMAIL",
				status: { in: ["PENDING", "FAILED", "SENDING"] },
			},
		});
		await Promise.all(pending.map((row) => dispatchRow(row.id)));
	} catch (e) {
		console.error("[order-notifications] queue failed", e);
	}
}

/** Attempt one persisted notification and record the outcome. Never throws. */
async function dispatchRow(id: string): Promise<void> {
	try {
		const row = await db.orderNotification.findUnique({ where: { id } });
		if (!row || row.status === "SENT" || row.channel !== "EMAIL") return;
		// Claim atomically (Codex P2): concurrent queue/retry runs must not
		// both send. Claim PENDING/FAILED outright; recover a SENDING row only
		// when its claim looks stale (no attempt recorded recently, e.g. a
		// crashed process). The conditional update succeeds for one caller.
		const staleBefore = new Date(Date.now() - STALE_CLAIM_MS);
		const claimed = await db.orderNotification.updateMany({
			where: {
				id,
				OR: [
					{ status: { in: ["PENDING", "FAILED"] } },
					{ status: "SENDING", lastAttemptAt: { lt: staleBefore } },
				],
			},
			data: { status: "SENDING" },
		});
		if (claimed.count !== 1) return;
		const order = await db.order.findUnique({
			where: { id: row.orderId },
			select: {
				number: true,
				customerName: true,
				customerEmail: true,
				customerPhone: true,
				total: true,
				deliveryProvider: true,
				deliveryReference: true,
			},
		});
		if (!order) {
			await db.orderNotification.update({
				where: { id },
				data: {
					status: "FAILED",
					attempts: { increment: 1 },
					lastError: "order not found",
					lastAttemptAt: new Date(),
				},
			});
			return;
		}
		try {
			await sendCustomerOrderUpdateEmail(
				row.to,
				row.event as CustomerNotificationEvent,
				{
					number: order.number,
					customerName: order.customerName,
					customerEmail: order.customerEmail ?? "",
					customerPhone: order.customerPhone,
					total: order.total,
					deliveryProvider: order.deliveryProvider ?? "",
					deliveryReference: order.deliveryReference ?? "",
				},
			);
			await db.orderNotification.update({
				where: { id },
				data: {
					status: "SENT",
					attempts: { increment: 1 },
					lastError: null,
					lastAttemptAt: new Date(),
				},
			});
		} catch (e) {
			await db.orderNotification.update({
				where: { id },
				data: {
					status: "FAILED",
					attempts: { increment: 1 },
					lastError:
						e instanceof Error
							? e.message.slice(0, 500)
							: String(e).slice(0, 500),
					lastAttemptAt: new Date(),
				},
			});
		}
	} catch (e) {
		console.error("[order-notifications] dispatch failed", e);
	}
}

/** Staff-triggered retry: re-attempt a FAILED/PENDING notification. */
export async function retryNotification(
	id: string,
): Promise<"SENT" | "FAILED" | "NOT_FOUND" | "ALREADY_SENT" | "NOT_SUPPORTED"> {
	const row = await db.orderNotification.findUnique({ where: { id } });
	if (!row) return "NOT_FOUND";
	if (row.channel !== "EMAIL") return "NOT_SUPPORTED";
	if (row.status === "SENT") return "ALREADY_SENT";
	await dispatchRow(id);
	const updated = await db.orderNotification.findUnique({
		where: { id },
		select: { status: true },
	});
	return updated?.status === "SENT"
		? "SENT"
		: updated?.status === "FAILED"
			? "FAILED"
			: "NOT_FOUND";
}
