/**
 * Staff notifications for new orders — email + WhatsApp.
 *  - email: nodemailer, same EMAIL_SERVER_* / EMAIL_FROM config as the auth
 *    magic-link transport (lib/auth.ts)
 *  - WhatsApp: WAFINE (OpenWA) gateway — POST /api/sessions/{id}/messages/send-text
 * Each channel is skipped silently (one console.info) when its env vars are
 * missing, and NO failure here ever propagates — the checkout must not depend
 * on notifications succeeding.
 *
 * Env vars (see .env.example): STAFF_EMAILS, STAFF_WHATSAPP, WAFINE_API_URL,
 * WAFINE_API_KEY, WAFINE_SESSION_ID.
 */
import nodemailer from "nodemailer";
import { staffNewOrderEmail, type StaffOrderPayload } from "./email-templates";

const WAFINE_TIMEOUT_MS = 5_000;

const smtpPort = Number(process.env.EMAIL_SERVER_PORT ?? 587);
/** SMTP config shared with the auth magic-link email (lib/auth.ts). */
export const smtpServer = {
  host: process.env.EMAIL_SERVER_HOST,
  port: smtpPort,
  secure: smtpPort === 465, // implicit TLS on 465, STARTTLS otherwise
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
};

/** Comma-separated env value → trimmed, non-empty entries. */
function commaList(raw: string | undefined): string[] {
  return (raw ?? "").split(",").map((s) => s.trim()).filter(Boolean);
}

async function sendStaffEmail(tpl: { subject: string; html: string; text: string }): Promise<void> {
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

async function sendStaffWhatsApp(text: string): Promise<void> {
  const { WAFINE_API_URL, WAFINE_API_KEY, WAFINE_SESSION_ID } = process.env;
  if (!WAFINE_API_URL || !WAFINE_API_KEY || !WAFINE_SESSION_ID) {
    console.info("[notify] WAFINE_* unset — staff WhatsApp skipped");
    return;
  }
  const numbers = commaList(process.env.STAFF_WHATSAPP)
    .map((w) => w.replace(/^\+/, ""))
    .filter((w) => /^\d+$/.test(w));
  if (numbers.length === 0) {
    console.info("[notify] STAFF_WHATSAPP unset — staff WhatsApp skipped");
    return;
  }
  for (const digits of numbers) {
    const chatId = `${digits}@c.us`;
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), WAFINE_TIMEOUT_MS);
      let res: Response;
      try {
        res = await fetch(`${WAFINE_API_URL}/api/sessions/${WAFINE_SESSION_ID}/messages/send-text`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-API-Key": WAFINE_API_KEY },
          body: JSON.stringify({ chatId, text }),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timer);
      }
      if (res.status !== 201) {
        console.error(`[notify] WAFINE send-text to ${chatId} → HTTP ${res.status}`);
      }
    } catch (e) {
      console.error(`[notify] WAFINE send-text to ${chatId} failed`, e);
    }
  }
}

/**
 * Notify the store staff of a new order (email + WhatsApp). Fire-and-forget:
 * resolves even when every channel fails; never throws.
 */
export async function notifyStaffNewOrder(order: StaffOrderPayload): Promise<void> {
  try {
    const ordersUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://maisontitrit.com"}/makteb/orders`;
    const tpl = staffNewOrderEmail(order, ordersUrl);
    await Promise.all([sendStaffEmail(tpl), sendStaffWhatsApp(tpl.text)]);
  } catch (e) {
    console.error("[notify] notifyStaffNewOrder failed", e);
  }
}
