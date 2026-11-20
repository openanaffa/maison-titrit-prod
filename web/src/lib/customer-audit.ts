import { db } from "@/lib/db";

/** Auditable actions on a customer record (issue #122). */
export type CustomerAuditAction =
	| "VIEW_CUSTOMER"
	| "NOTE_ADDED"
	| "NOTE_REMOVED"
	| "CONSENT_CHANGED";

/** Persist an audit event. Fire-and-forget safe: never throws. */
export async function recordCustomerAudit(
	action: CustomerAuditAction,
	opts: { userId?: string | null; actorId: string; detail?: string | null },
): Promise<void> {
	try {
		await db.customerAuditEvent.create({
			data: {
				action,
				userId: opts.userId ?? null,
				actorId: opts.actorId,
				detail: opts.detail ?? null,
			},
		});
	} catch (e) {
		console.error(`[customer-audit] ${action} failed`, e);
	}
}
