/** Email notification payloads and rendered templates. */

/** Minimal order shape passed along with a fresh checkout (see /api/checkout). */
export type StaffOrderPayload = {
	number: string;
	customerName: string;
	customerPhone: string;
	items: {
		name: string;
		size: string | null;
		price: number;
		quantity: number;
	}[];
	total: number;
};

export type EmailTemplate = { subject: string; html: string; text: string };

/** Customer lifecycle events that trigger a customer notification (#121). */
export type CustomerNotificationEvent =
	| "CONFIRMED"
	| "DISPATCHED"
	| "DELIVERED";

/** Order data needed to compose a customer order-update notification. */
export type CustomerOrderUpdatePayload = {
	number: string;
	customerName: string;
	customerEmail: string;
	customerPhone: string;
	total: number;
	deliveryProvider: string;
	deliveryReference: string;
};
