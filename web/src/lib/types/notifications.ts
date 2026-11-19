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
