import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import { site } from "@/config/site";

export const dynamic = "force-dynamic";

/**
 * Create an order from the client cart (COD).
 * Body: { items: [{productId, ref, name, price, qty, size}], customer: {name, phone, email, city, address, notes} }
 * Returns { order: { number, total }, whatsapp: <deeplink with summary> }
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  try {
    const body = await req.json();
    const items: Array<{
      productId: string;
      ref: string;
      name: string;
      price: number;
      qty: number;
      size: string;
    }> = Array.isArray(body.items) ? body.items : [];
    const customer = body.customer ?? {};

    if (items.length === 0) {
      return NextResponse.json({ error: "Panier vide." }, { status: 400 });
    }
    if (!customer.name?.trim() || !customer.phone?.trim()) {
      return NextResponse.json({ error: "Nom et téléphone requis." }, { status: 400 });
    }

    const total = items.reduce((s, i) => s + Number(i.price) * Number(i.qty), 0);

    // Generate a human-friendly order number (sequential-ish)
    const count = await db.order.count();
    const number = `MT-${1000 + count + 1}`;

    const order = await db.order.create({
      data: {
        number,
        status: "PENDING",
        customerName: customer.name.trim(),
        customerPhone: customer.phone.trim(),
        customerEmail: customer.email?.trim() || null,
        city: customer.city?.trim() || null,
        address: customer.address?.trim() || null,
        notes: customer.notes?.trim() || null,
        total,
        currency: site.currency,
        payment: "COD",
        userId: user?.id ?? null,
      },
    });

    // create order items (snapshot)
    for (const it of items) {
      await db.orderItem.create({
        data: {
          orderId: order.id,
          productId: it.productId,
          ref: it.ref,
          name: it.name,
          price: Number(it.price),
          quantity: Number(it.qty),
          size: it.size || null,
        },
      });
    }

    // Note: GA4/Meta purchase tracking happens client-side on the checkout
    // success screen (consent-gated). Here we just persist the order.

    // Build the WhatsApp summary deeplink
    const lines = [
      `Bonjour Maison Titrit 👋`,
      ``,
      `Nouvelle commande ${order.number}`,
      ``,
      ...items.map(
        (i) => `• ${i.name} — ${i.size} × ${i.qty} = ${(Number(i.price) * Number(i.qty)).toLocaleString("fr-FR")} ${site.currency}`,
      ),
      ``,
      `Total : ${total.toLocaleString("fr-FR")} ${site.currency}`,
      `Paiement : ${order.payment}`,
      ``,
      `Client : ${order.customerName}`,
      `Téléphone : ${order.customerPhone}`,
      order.customerEmail ? `Email : ${order.customerEmail}` : null,
      order.city ? `Ville : ${order.city}` : null,
      order.address ? `Adresse : ${order.address}` : null,
      order.notes ? `Notes : ${order.notes}` : null,
    ].filter(Boolean);
    const text = encodeURIComponent(lines.join("\n"));
    const whatsapp = `https://wa.me/${site.whatsapp.chat}?text=${text}`;

    return NextResponse.json({ order: { number: order.number, total }, whatsapp });
  } catch (e) {
    console.error("POST /api/checkout failed", e);
    return NextResponse.json({ error: "Commande impossible." }, { status: 500 });
  }
}
