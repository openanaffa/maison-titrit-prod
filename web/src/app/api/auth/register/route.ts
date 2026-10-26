import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

/**
 * Client signup — creates a CUSTOMER role user.
 * Body: { name, email, password }
 * Idempotent-ish: 409 if email exists.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").toLowerCase().trim();
    const password = String(body.password ?? "");

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Tous les champs sont requis." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Le mot de passe doit faire au moins 6 caractères." }, { status: 400 });
    }
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Cet email est déjà utilisé." }, { status: 409 });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await db.user.create({
      data: { name, email, password: hash, role: "CUSTOMER" },
    });
    return NextResponse.json({ ok: true, userId: user.id });
  } catch (e) {
    console.error("POST /api/auth/register failed", e);
    return NextResponse.json({ error: "Inscription impossible." }, { status: 500 });
  }
}
