import { NextResponse } from "next/server";
import {
	countOwnersExcluding,
	getUser,
	updateUserRole,
} from "@/lib/repositories/users";
import { ROLES, type Role } from "@/lib/roles";
import { requirePermission } from "@/lib/session";

export const dynamic = "force-dynamic";

/** Change a user's role (founder/developer only). Role changes take effect at the user's next sign-in. */
export async function PATCH(
	req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { user, allowed } = await requirePermission("users:manage");
	if (!user || !allowed) {
		return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
	}
	const { id } = await params;
	if (id === user.id) {
		return NextResponse.json(
			{ error: "Impossible de modifier son propre rôle." },
			{ status: 400 },
		);
	}
	try {
		const body = await req.json();
		const role = body.role?.toString();
		if (!role || !(ROLES as readonly string[]).includes(role)) {
			return NextResponse.json({ error: "Rôle invalide." }, { status: 400 });
		}

		const target = await getUser(id);
		if (!target) {
			return NextResponse.json(
				{ error: "Utilisateur introuvable." },
				{ status: 404 },
			);
		}

		// Never leave the workspace without an owner.
		const OWNER_ROLES: Role[] = ["FOUNDER", "DEVELOPER"];
		if (
			OWNER_ROLES.includes(target.role as Role) &&
			!OWNER_ROLES.includes(role as Role)
		) {
			const ownersLeft = await countOwnersExcluding(id);
			if (ownersLeft === 0) {
				return NextResponse.json(
					{
						error:
							"Au moins un propriétaire (FOUNDER ou DEVELOPER) doit rester.",
					},
					{ status: 400 },
				);
			}
		}

		const updated = await updateUserRole(id, role as Role);
		return NextResponse.json({ user: updated });
	} catch (error) {
		console.error("Failed to update user role", error);
		return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
	}
}
