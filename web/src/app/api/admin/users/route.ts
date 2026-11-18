import { NextResponse } from "next/server";
import { listUsers } from "@/lib/repositories/users";
import { requirePermission } from "@/lib/session";

export const dynamic = "force-dynamic";

/** List all users with their roles (founder/developer only — team management). */
export async function GET() {
	const { user, allowed } = await requirePermission("users:manage");
	if (!user || !allowed) {
		return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
	}
	try {
		const users = await listUsers();
		return NextResponse.json({ users });
	} catch (error) {
		console.error("Failed to list users", error);
		return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
	}
}
