import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";

type MailMessage = {
	from?: string;
	to?: string;
	subject?: string;
	html?: string;
	text?: string;
};

const state = {
	transportCalls: 0,
	sendMailCalls: [] as MailMessage[],
	transportError: null as Error | null,
};

mock.module("nodemailer", () => {
	const createTransport = () => ({
		sendMail: async (msg: MailMessage) => {
			state.transportCalls++;
			if (state.transportError) throw state.transportError;
			state.sendMailCalls.push(msg);
		},
	});
	return { default: { createTransport }, createTransport };
});

const { notifyStaffNewOrder } = await import("./notify");

const NOTIFY_ENV_KEYS = [
	"STAFF_EMAILS",
	"EMAIL_SERVER_HOST",
	"EMAIL_SERVER_PORT",
	"EMAIL_SERVER_USER",
	"EMAIL_SERVER_PASSWORD",
	"EMAIL_FROM",
	"NEXT_PUBLIC_SITE_URL",
] as const;

const order = {
	number: "MT-1042",
	customerName: "Fatima Zahra",
	customerPhone: "+212600000000",
	items: [{ name: "Caftan Amazigh", size: "M", price: 1200, quantity: 2 }],
	total: 2400,
};

const originalFetch = globalThis.fetch;
const originalEnv = NOTIFY_ENV_KEYS.reduce<Record<string, string | undefined>>(
	(acc, k) => {
		acc[k] = process.env[k];
		return acc;
	},
	{},
);

function setEnvs() {
	process.env.STAFF_EMAILS = "staff1@t.test, staff2@t.test";
	process.env.EMAIL_SERVER_HOST = "smtp.t.test";
}

beforeEach(() => {
	state.transportCalls = 0;
	state.sendMailCalls.length = 0;
	state.transportError = null;
	for (const k of NOTIFY_ENV_KEYS) delete process.env[k];
});

afterEach(() => {
	globalThis.fetch = originalFetch;
	for (const k of NOTIFY_ENV_KEYS) {
		if (originalEnv[k] === undefined) delete process.env[k];
		else process.env[k] = originalEnv[k];
	}
});

describe("notifyStaffNewOrder", () => {
	test("skips staff email when its env vars are missing", async () => {
		await expect(notifyStaffNewOrder(order)).resolves.toBeUndefined();
		expect(state.sendMailCalls).toHaveLength(0);
	});

	test("sends the new-order email without making HTTP calls", async () => {
		setEnvs();
		const fetch = mock(() => Promise.reject(new Error("unexpected HTTP call")));
		globalThis.fetch = fetch as unknown as typeof globalThis.fetch;

		await notifyStaffNewOrder(order);

		expect(state.sendMailCalls).toHaveLength(1);
		expect(state.sendMailCalls[0].to).toBe("staff1@t.test, staff2@t.test");
		expect(state.sendMailCalls[0].subject).toContain(
			"Nouvelle commande MT-1042",
		);
		expect(fetch).not.toHaveBeenCalled();
	});

	test("resolves when the SMTP transport throws", async () => {
		setEnvs();
		state.transportError = new Error("smtp down");
		await expect(notifyStaffNewOrder(order)).resolves.toBeUndefined();
		expect(state.sendMailCalls).toHaveLength(0);
	});
});
