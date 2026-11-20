import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

/** Listed customers with order linkage counts (customer 360 workspace). */
export type CustomerListRow = {
	id: string;
	name: string;
	email: string;
	emailVerified: boolean;
	phone: string;
	marketingConsent: string;
	createdAt: string;
	accountOrders: number;
	matchedGuestOrders: number;
	totalOrders: number;
};

/** Segments for the customers list (server-side, no third-party CRM). */
export type CustomerSegment =
	| "has-orders"
	| "guest-linked"
	| "email-verified"
	| "marketing-consent";

export const CUSTOMER_SEGMENTS: CustomerSegment[] = [
	"has-orders",
	"guest-linked",
	"email-verified",
	"marketing-consent",
];

export function isCustomerSegment(
	value: string | undefined,
): value is CustomerSegment {
	return CUSTOMER_SEGMENTS.includes(value as CustomerSegment);
}

/** Digits-only normalization (phone matching ignores formatting). */
export function digitsOf(raw: string): string {
	return raw.replace(/\D/g, "");
}

/** Normalized email comparison (case-insensitive trim). */
export function normalizeEmail(raw: string): string {
	return raw.trim().toLowerCase();
}

/**
 * Does a guest order belong to this customer? Matching runs on a
 * digits-normalized phone OR an exact email. This is a *display*
 * association only: matching never merges customers (issue #122 rule —
 * no merge on an unverified identifier).
 */
export function guestOrderMatches(
	guest: { customerPhone: string; customerEmail: string | null },
	customer: { phone: string; email: string },
): boolean {
	if (
		customer.phone &&
		digitsOf(guest.customerPhone) === digitsOf(customer.phone)
	) {
		return true;
	}
	return Boolean(
		guest.customerEmail &&
			customer.email &&
			normalizeEmail(guest.customerEmail) === normalizeEmail(customer.email),
	);
}

/** Filter predicate per segment, over the counted list rows. */
export function matchesSegment(
	row: Pick<
		CustomerListRow,
		"totalOrders" | "matchedGuestOrders" | "emailVerified" | "marketingConsent"
	>,
	segment: CustomerSegment,
): boolean {
	switch (segment) {
		case "has-orders":
			return row.totalOrders > 0;
		case "guest-linked":
			return row.matchedGuestOrders > 0;
		case "email-verified":
			return row.emailVerified;
		case "marketing-consent":
			return row.marketingConsent === "OPTED_IN";
	}
}

type UserRow = {
	id: string;
	name: string | null;
	email: string;
	emailVerified: string | null;
	phone: string | null;
	marketingConsent: string | null;
	createdAt: string;
};

type GuestOrderRow = {
	id: string;
	userId: string | null;
	customerPhone: string;
	customerEmail: string | null;
};

/**
 * Registered customer accounts with account-order counts and
 * digits-normalized guest-order matches, optionally segmented.
 */
export async function listCustomers(
	supabase: SupabaseClient<Database>,
	opts: { search?: string; segment?: CustomerSegment } = {},
): Promise<CustomerListRow[]> {
	let query = supabase
		.from("User")
		.select("id,name,email,emailVerified,phone,marketingConsent,createdAt")
		.eq("role", "CUSTOMER")
		.order("createdAt", { ascending: false });
	if (opts.search) {
		const term = opts.search.replace(/[,%()]/g, "");
		query = query.or(
			`name.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%`,
		);
	}
	const { data: users, error } = await query.throwOnError();
	if (error) throw error;
	const userRows = (users ?? []) as UserRow[];
	if (userRows.length === 0) return [];

	const userIds = userRows.map((u) => u.id);
	const { data: orders, error: ordersError } = await supabase
		.from("Order")
		.select("id,userId,customerPhone,customerEmail")
		.or(`userId.in.(${userIds.join(",")}),userId.is.null`)
		.throwOnError();
	if (ordersError) throw ordersError;
	const orderRows = (orders ?? []) as GuestOrderRow[];

	const accountByUser = new Map<string, number>();
	const guestByUser = new Map<string, number>();
	for (const order of orderRows) {
		if (order.userId && userIds.includes(order.userId)) {
			accountByUser.set(
				order.userId,
				(accountByUser.get(order.userId) ?? 0) + 1,
			);
			continue;
		}
		for (const user of userRows) {
			if (
				guestOrderMatches(order, {
					phone: user.phone ?? "",
					email: user.email,
				})
			) {
				guestByUser.set(user.id, (guestByUser.get(user.id) ?? 0) + 1);
			}
		}
	}

	return userRows
		.map((u) => {
			const accountOrders = accountByUser.get(u.id) ?? 0;
			const matchedGuestOrders = guestByUser.get(u.id) ?? 0;
			return {
				id: u.id,
				name: u.name ?? "",
				email: u.email,
				emailVerified: Boolean(u.emailVerified),
				phone: u.phone ?? "",
				marketingConsent: u.marketingConsent ?? "",
				createdAt: u.createdAt,
				accountOrders,
				matchedGuestOrders,
				totalOrders: accountOrders + matchedGuestOrders,
			};
		})
		.filter((row) => (opts.segment ? matchesSegment(row, opts.segment) : true));
}

/** Orders + notification ledger rows for one customer's 360 view. */
export type CustomerOrderRow = {
	id: string;
	number: string;
	status: string;
	total: number;
	currency: string;
	createdAt: string;
	linkedBy: "account" | "guest-match";
};

export type CustomerNotificationRow = {
	id: string;
	orderNumber: string;
	event: string;
	channel: string;
	status: string;
	attempts: number;
	lastError: string | null;
	lastAttemptAt: string | null;
	createdAt: string;
};

export type CustomerNoteRow = {
	id: string;
	body: string;
	authorName: string;
	createdAt: string;
};

export type CustomerAuditRow = {
	id: string;
	action: string;
	detail: string | null;
	actorName: string;
	createdAt: string;
};

export type Customer360 = {
	id: string;
	name: string;
	email: string;
	emailVerified: boolean;
	phone: string;
	marketingConsent: string;
	role: string;
	createdAt: string;
	orders: CustomerOrderRow[];
	notifications: CustomerNotificationRow[];
	notes: CustomerNoteRow[];
	audit: CustomerAuditRow[];
};

/** Full customer 360 payload: identity, orders, interactions, notes, audit. */
export async function getCustomer360(
	supabase: SupabaseClient<Database>,
	id: string,
): Promise<Customer360 | null> {
	const { data: user, error } = await supabase
		.from("User")
		.select("id,name,email,emailVerified,phone,marketingConsent,role,createdAt")
		.eq("id", id)
		.eq("role", "CUSTOMER")
		.maybeSingle()
		.throwOnError();
	if (error) throw error;
	if (!user) return null;
	const u = user as {
		id: string;
		name: string | null;
		email: string;
		emailVerified: string | null;
		phone: string | null;
		marketingConsent: string | null;
		role: string;
		createdAt: string;
	};

	const { data: orders, error: ordersError } = await supabase
		.from("Order")
		.select(
			"id,number,status,total,currency,createdAt,userId,customerPhone,customerEmail",
		)
		.or(`userId.eq.${id},userId.is.null`)
		.order("createdAt", { ascending: false })
		.throwOnError();
	if (ordersError) throw ordersError;
	const customer: { phone: string; email: string } = {
		phone: u.phone ?? "",
		email: u.email,
	};
	const orderRows = (
		(orders ?? []) as {
			id: string;
			number: string;
			status: string;
			total: number;
			currency: string;
			createdAt: string;
			userId: string | null;
			customerPhone: string;
			customerEmail: string | null;
		}[]
	).filter((o) => {
		if (o.userId === id) return true;
		return o.userId === null && guestOrderMatches(o, customer);
	});
	const orderIds = orderRows.map((o) => o.id);

	const { data: notifications } = orderIds.length
		? await supabase
				.from("OrderNotification")
				.select(
					"id,orderId,event,channel,status,attempts,lastError,lastAttemptAt,createdAt",
				)
				.in("orderId", orderIds)
				.order("createdAt", { ascending: false })
				.throwOnError()
		: { data: [] as Record<string, unknown>[] };
	const numberByOrder = new Map(orderRows.map((o) => [o.id, o.number]));
	const notificationRows = (
		(notifications ?? []) as {
			id: string;
			orderId: string;
			event: string;
			channel: string;
			status: string;
			attempts: number;
			lastError: string | null;
			lastAttemptAt: string | null;
			createdAt: string;
		}[]
	).map((n) => ({
		id: n.id,
		orderNumber: numberByOrder.get(n.orderId) ?? "",
		event: n.event,
		channel: n.channel,
		status: n.status,
		attempts: n.attempts,
		lastError: n.lastError,
		lastAttemptAt: n.lastAttemptAt,
		createdAt: n.createdAt,
	}));

	const { data: notes, error: notesError } = await supabase
		.from("CustomerNote")
		.select("id,body,authorId,createdAt")
		.eq("userId", id)
		.order("createdAt", { ascending: false })
		.throwOnError();
	if (notesError) throw notesError;
	const noteRowsRaw = (notes ?? []) as {
		id: string;
		body: string;
		authorId: string;
		createdAt: string;
	}[];
	const authorIds = [...new Set(noteRowsRaw.map((n) => n.authorId))];
	const { data: authors } = authorIds.length
		? await supabase
				.from("User")
				.select("id,name")
				.in("id", authorIds)
				.throwOnError()
		: { data: [] as { id: string; name: string | null }[] };
	const nameByAuthor = new Map(
		((authors ?? []) as { id: string; name: string | null }[]).map((a) => [
			a.id,
			a.name ?? "",
		]),
	);
	const noteRows = noteRowsRaw.map((n) => ({
		id: n.id,
		body: n.body,
		authorName: nameByAuthor.get(n.authorId) ?? "",
		createdAt: n.createdAt,
	}));

	const { data: audit, error: auditError } = await supabase
		.from("CustomerAuditEvent")
		.select("id,action,detail,actorId,createdAt")
		.eq("userId", id)
		.order("createdAt", { ascending: false })
		.limit(50)
		.throwOnError();
	if (auditError) throw auditError;
	const auditRowsRaw = (audit ?? []) as {
		id: string;
		action: string;
		detail: string | null;
		actorId: string;
		createdAt: string;
	}[];
	const actorIds = [...new Set(auditRowsRaw.map((a) => a.actorId))];
	const { data: actors } = actorIds.length
		? await supabase
				.from("User")
				.select("id,name")
				.in("id", actorIds)
				.throwOnError()
		: { data: [] as { id: string; name: string | null }[] };
	const nameByActor = new Map(
		((actors ?? []) as { id: string; name: string | null }[]).map((a) => [
			a.id,
			a.name ?? "",
		]),
	);
	const auditRows = auditRowsRaw.map((a) => ({
		id: a.id,
		action: a.action,
		detail: a.detail,
		actorName: nameByActor.get(a.actorId) ?? "",
		createdAt: a.createdAt,
	}));

	return {
		id: u.id,
		name: u.name ?? "",
		email: u.email,
		emailVerified: Boolean(u.emailVerified),
		phone: u.phone ?? "",
		marketingConsent: u.marketingConsent ?? "",
		role: u.role,
		createdAt: u.createdAt,
		orders: orderRows.map((o) => ({
			id: o.id,
			number: o.number,
			status: o.status,
			total: o.total,
			currency: o.currency,
			createdAt: o.createdAt,
			linkedBy:
				o.userId === id ? ("account" as const) : ("guest-match" as const),
		})),
		notifications: notificationRows,
		notes: noteRows,
		audit: auditRows,
	};
}
