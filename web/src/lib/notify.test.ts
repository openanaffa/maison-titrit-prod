import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";

type MailMessage = { from?: string; to?: string; subject?: string; html?: string; text?: string };

const state = {
  transportCalls: 0,
  sendMailCalls: [] as MailMessage[],
  transportError: null as Error | null,
  fetchCalls: [] as Array<{ url: string; chatId: string; text: string }>,
  fetchError: null as Error | null,
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
  "STAFF_WHATSAPP",
  "WAFINE_API_URL",
  "WAFINE_API_KEY",
  "WAFINE_SESSION_ID",
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
const originalEnv = NOTIFY_ENV_KEYS.reduce<Record<string, string | undefined>>((acc, k) => {
  acc[k] = process.env[k];
  return acc;
}, {});

function setEnvs() {
  process.env.STAFF_EMAILS = "staff1@t.test, staff2@t.test";
  process.env.STAFF_WHATSAPP = "+212684921942, 212777513838";
  process.env.EMAIL_SERVER_HOST = "smtp.t.test";
  process.env.WAFINE_API_URL = "https://wafine.t.test";
  process.env.WAFINE_API_KEY = "key-123";
  process.env.WAFINE_SESSION_ID = "sess-1";
}

beforeEach(() => {
  state.transportCalls = 0;
  state.sendMailCalls.length = 0;
  state.fetchCalls.length = 0;
  state.transportError = null;
  state.fetchError = null;
  for (const k of NOTIFY_ENV_KEYS) delete process.env[k];
  globalThis.fetch = (async (input: unknown, init?: RequestInit) => {
    const body = JSON.parse(String(init?.body ?? "{}")) as { chatId?: string; text?: string };
    state.fetchCalls.push({ url: String(input), chatId: body.chatId ?? "", text: body.text ?? "" });
    if (state.fetchError) throw state.fetchError;
    return { status: 201, ok: true } as Response;
  }) as unknown as typeof fetch;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  for (const k of NOTIFY_ENV_KEYS) {
    if (originalEnv[k] === undefined) delete process.env[k];
    else process.env[k] = originalEnv[k];
  }
});

describe("notifyStaffNewOrder", () => {
  test("skips both channels when their env vars are missing", async () => {
    await expect(notifyStaffNewOrder(order)).resolves.toBeUndefined();
    expect(state.sendMailCalls).toHaveLength(0);
    expect(state.fetchCalls).toHaveLength(0);
  });

  test("sends email + WhatsApp when configured (@c.us chatId)", async () => {
    setEnvs();
    await notifyStaffNewOrder(order);
    expect(state.sendMailCalls).toHaveLength(1);
    expect(state.sendMailCalls[0].to).toBe("staff1@t.test, staff2@t.test");
    expect(state.sendMailCalls[0].subject).toContain("Nouvelle commande MT-1042");
    expect(state.fetchCalls).toHaveLength(2);
    expect(state.fetchCalls[0]).toEqual({
      url: "https://wafine.t.test/api/sessions/sess-1/messages/send-text",
      chatId: "212684921942@c.us",
      text: expect.stringContaining("MT-1042"),
    });
    expect(state.fetchCalls[1].chatId).toBe("212777513838@c.us");
  });

  test("resolves when fetch rejects (WhatsApp failure), email still sent", async () => {
    setEnvs();
    state.fetchError = new Error("network down");
    await expect(notifyStaffNewOrder(order)).resolves.toBeUndefined();
    expect(state.fetchCalls).toHaveLength(2);
    expect(state.sendMailCalls).toHaveLength(1);
  });

  test("resolves when the SMTP transport throws, WhatsApp still sent", async () => {
    setEnvs();
    state.transportError = new Error("smtp down");
    await expect(notifyStaffNewOrder(order)).resolves.toBeUndefined();
    expect(state.sendMailCalls).toHaveLength(0);
    expect(state.fetchCalls).toHaveLength(2);
    expect(state.fetchCalls[0].url).toContain("/api/sessions/sess-1/messages/send-text");
    expect(state.fetchCalls[0].chatId).toBe("212684921942@c.us");
  });
});
