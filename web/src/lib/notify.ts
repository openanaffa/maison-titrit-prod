import nodemailer from "nodemailer";
import type {
	CustomerNotificationEvent,
	CustomerOrderUpdatePayload,
	EmailTemplate,
	StaffOrderPayload,
} from "@/lib/types/notifications";
import {
	customerOrderUpdateEmail,
	staffNewOrderEmail,
} from "./email-templates";

const smtpPort = Number(process.env.EMAIL_SERVER_PORT ?? 587);
/** SMTP config shared with the auth magic-link email (lib/auth.ts). */
export const smtpServer = {
	host: process.env.EMAIL_SERVER_HOST,
	port: smtpPort,
	secure: smtpPort === 465,
	auth: {
		user: process.env.EMAIL_SERVER_USER,
		pass: process.env.EMAIL_SERVER_PASSWORD,
	},
};

/** Comma-separated env value → trimmed, non-empty entries. */
function commaList(raw: string | undefined): string[] {
	return (raw ?? "")
		.split(",")
		.map((s) => s.trim())
		.filter(Boolean);
}

async function sendStaffEmail(tpl: {
	subject: string;
	html: string;
	text: string;
}): Promise<void> {
	try {
		const to = commaList(process.env.STAFF_EMAILS);
		if (to.length === 0) {
			console.info("[notify] STAFF_EMAILS unset — staff email skipped");
			return;
		}
		if (!process.env.EMAIL_SERVER_HOST) {
			console.info("[notify] EMAIL_SERVER_HOST unset — staff email skipped");
			return;
		}
		const transport = nodemailer.createTransport(smtpServer);
		await transport.sendMail({
			from: process.env.EMAIL_FROM ?? "Maison Titrit <hello@maisontitrit.com>",
			to: to.join(", "),
			subject: tpl.subject,
			html: tpl.html,
			text: tpl.text,
		});
	} catch (e) {
		console.error("[notify] staff email failed", e);
	}
}

/**
 * Notify the store staff of a new order by email. Fire-and-forget: resolves
 * even when email delivery fails; never throws.
 */
export async function notifyStaffNewOrder(
	order: StaffOrderPayload,
): Promise<void> {
	try {
		const ordersUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://maisontitrit.com"}/makteb/orders`;
		const tpl = staffNewOrderEmail(order, ordersUrl);
		await sendStaffEmail(tpl);
	} catch (e) {
		console.error("[notify] notifyStaffNewOrder failed", e);
	}
}

async function sendCustomerEmail(
	tpl: EmailTemplate,
	to: string,
): Promise<void> {
	if (!process.env.EMAIL_SERVER_HOST) {
		throw new Error("EMAIL_SERVER_HOST unset");
	}
	const transport = nodemailer.createTransport(smtpServer);
	await transport.sendMail({
		from: process.env.EMAIL_FROM ?? "Maison Titrit <hello@maisontitrit.com>",
		to,
		subject: tpl.subject,
		html: tpl.html,
		text: tpl.text,
	});
}

/** Send a customer order update only over the configured email channel. */
export async function sendCustomerOrderUpdateEmail(
	to: string,
	event: CustomerNotificationEvent,
	order: CustomerOrderUpdatePayload,
): Promise<void> {
	await sendCustomerEmail(customerOrderUpdateEmail(event, order), to);
}
