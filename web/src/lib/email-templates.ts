import { site } from "@/config/site";

/** Minimal order shape passed along with a fresh checkout (see /api/checkout). */
export type StaffOrderPayload = {
  number: string;
  customerName: string;
  customerPhone: string;
  items: { name: string; size: string | null; price: number; quantity: number }[];
  total: number;
};

export type EmailTemplate = { subject: string; html: string; text: string };

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function money(n: number): string {
  return `${n.toLocaleString("fr-FR")} ${site.currency}`;
}

/** Shared cream shell: brand header + content + contact footer. */
function shell(content: string): string {
  const address = `${site.address.line1}, ${site.address.city} · ${site.phones[0].display}`;
  return `<div style="margin:0;padding:0;background-color:#F4EAD5;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center" style="padding:24px 12px;font-family:Georgia,'Times New Roman',serif;">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="width:560px;max-width:100%;">
          <tr>
            <td style="background-color:#FFFDF8;border:1px solid rgba(28,26,23,0.12);border-radius:12px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding:28px 32px 4px;">
                    <div style="font-size:11px;letter-spacing:4px;color:#B0532F;">MAISON DE COUTURE</div>
                    <h1 style="margin:6px 0 0;font-size:22px;font-weight:700;letter-spacing:3px;color:#1C1A17;">MAISON TITRIT</h1>
                    <div style="width:44px;height:2px;background-color:#B0532F;margin:12px auto 0;">&nbsp;</div>
                  </td>
                </tr>
                <tr><td style="padding:8px 32px 0;">${content}</td></tr>
                <tr>
                  <td style="padding:14px 32px 20px;border-top:1px solid rgba(28,26,23,0.08);text-align:center;">
                    <div style="font-size:12px;color:#7A5229;letter-spacing:2px;">${site.signature}</div>
                    <div style="font-size:11px;line-height:1.6;color:#7A5229;">${address}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</div>`;
}

/** Magic-link sign-in: one big button + fallback link (NextAuth 24 h expiry). */
export function magicLinkEmail(url: string): EmailTemplate {
  const html = shell(`
      <p style="margin:12px 0 0;font-size:15px;line-height:1.6;color:#1C1A17;">Bonjour 👋</p>
      <p style="margin:4px 0 0;font-size:14px;line-height:1.6;color:#1C1A17;">Pour vous connecter à votre compte, cliquez sur le bouton ci-dessous&nbsp;:</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td align="center" style="padding:16px 0 8px;">
          <a href="${url}" style="display:inline-block;padding:12px 32px;background-color:#B0532F;color:#F4EAD5;font-size:15px;letter-spacing:1px;text-decoration:none;border-radius:8px;">Se connecter</a>
        </td></tr>
      </table>
      <p style="margin:8px 0 0;font-size:12px;line-height:1.6;color:#7A5229;word-break:break-all;">Si le bouton ne fonctionne pas, copiez ce lien&nbsp;:<br/><a href="${url}" style="color:#B0532F;">${url}</a></p>
      <p style="margin:12px 0 12px;font-size:11px;line-height:1.6;color:#7A5229;">Ce lien n'est valable qu'une seule fois et expire sous 24&nbsp;h. Si vous n'êtes pas à l'origine de cette connexion, ignorez simplement cet email.</p>
  `);
  const text = [
    `Bonjour 👋`,
    ``,
    `Pour vous connecter à ${site.name}, cliquez (ou copiez) ce lien :`,
    url,
    ``,
    `Ce lien n'est valable qu'une seule fois et expire sous 24 h.`,
  ].join("\n");
  return { subject: "Votre lien de connexion — Maison Titrit", html, text };
}

/** Staff "new order": order summary + items table + dashboard button. */
export function staffNewOrderEmail(order: StaffOrderPayload, ordersUrl: string): EmailTemplate {
  const rows = order.items.map((i) => `
            <tr>
              <td style="padding:6px 0;font-size:14px;color:#1C1A17;">${esc(i.name)}${i.size ? `<span style="color:#7A5229;">&nbsp;· ${esc(i.size)}</span>` : ""}</td>
              <td align="right" style="padding:6px 0 6px 12px;font-size:14px;color:#1C1A17;white-space:nowrap;">× ${i.quantity}</td>
              <td align="right" style="padding:6px 0 6px 12px;font-size:14px;color:#1C1A17;white-space:nowrap;">${money(i.price * i.quantity)}</td>
            </tr>`).join("");
  const html = shell(`
      <h2 style="margin:12px 0 2px;font-size:20px;color:#1C1A17;">Nouvelle commande <span style="color:#B0532F;">${esc(order.number)}</span></h2>
      <p style="margin:0 0 14px;font-size:13px;color:#7A5229;">Paiement à la livraison (COD)</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            ${rows}
        <tr>
          <td colspan="2" align="right" style="padding:10px 0 0;border-top:1px solid rgba(28,26,23,0.12);font-size:14px;font-weight:700;color:#1C1A17;">Total</td>
          <td align="right" style="padding:10px 0 0;border-top:1px solid rgba(28,26,23,0.12);font-size:14px;font-weight:700;color:#B0532F;white-space:nowrap;">${money(order.total)}</td>
        </tr>
      </table>
      <p style="margin:14px 0 0;font-size:14px;color:#1C1A17;">Client&nbsp;: <strong>${esc(order.customerName)}</strong> — <a href="tel:${esc(order.customerPhone)}" style="color:#B0532F;text-decoration:none;">${esc(order.customerPhone)}</a></p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td align="center" style="padding:16px 0 12px;">
          <a href="${ordersUrl}" style="display:inline-block;padding:11px 28px;background-color:#1C1A17;color:#F4EAD5;font-size:14px;letter-spacing:1px;text-decoration:none;border-radius:8px;">Voir les commandes</a>
        </td></tr>
      </table>
  `);
  return { subject: `🛒 Nouvelle commande ${order.number} — Maison Titrit`, html, text: staffNewOrderText(order, ordersUrl) };
}

/** Plain-text version — used for the email fallback AND the WAFINE WhatsApp message. */
export function staffNewOrderText(order: StaffOrderPayload, ordersUrl: string): string {
  return [
    `🛒 Nouvelle commande ${order.number}`,
    ``,
    `Client : ${order.customerName}`,
    `Téléphone : ${order.customerPhone}`,
    ``,
    ...order.items.map((i) =>
      `• ${i.quantity} × ${i.name}${i.size ? ` (${i.size})` : ""} — ${money(i.price * i.quantity)}`),
    ``,
    `Total : ${money(order.total)}`,
    `Paiement : à la livraison (COD)`,
    ``,
    `Détails : ${ordersUrl}`,
  ].join("\n");
}
