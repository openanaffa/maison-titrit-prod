"use server";

import { db } from "@/lib/db";
import type { Role } from "@/lib/roles";

type UserRow = {
	id: string;
	email: string | null;
	name: string | null;
	role: string;
	supabaseId: string | null;
	image: string | null;
	phone: string | null;
	createdAt: Date;
};

/**
 * User repository — port for team/user data access.
 *
 * Users live in Prisma (the `User` model), so this repository uses `db`
 * directly rather than Supabase. It is the Prisma side of the data-access
 * edge.
 */

/**
 * User repository — port for team/user data access.
 *
 * Users live in Prisma (the `User` model), so this repository uses `db`
 * directly rather than Supabase. It is the Prisma side of the data-access
 * edge.
 *
 * Exported as named async functions so they can be imported by route handlers
 * without tripping Next.js server-actions validation on non-function exports.
 */

/** List all users with their roles, newest first. */
export async function listUsers(): Promise<UserRow[]> {
	const users = await db.user.findMany({
		select: {
			id: true,
			email: true,
			name: true,
			role: true,
			supabaseId: true,
			image: true,
			phone: true,
			createdAt: true,
		},
		orderBy: { createdAt: "desc" },
	});
	return users as unknown as UserRow[];
}

/** Get a single user by id. */
export async function getUser(id: string) {
	return db.user.findUnique({
		where: { id },
		select: { id: true, role: true },
	});
}

/** Update a user's role. */
export async function updateUserRole(id: string, role: Role) {
	return db.user.update({
		where: { id },
		data: { role },
		select: { id: true, role: true },
	});
}

/** Count owner-role users excluding a given id (guard against locking out). */
export async function countOwnersExcluding(id: string): Promise<number> {
	const OWNER_ROLES: Role[] = ["FOUNDER", "DEVELOPER"];
	return db.user.count({
		where: { role: { in: OWNER_ROLES }, NOT: { id } },
	});
}
