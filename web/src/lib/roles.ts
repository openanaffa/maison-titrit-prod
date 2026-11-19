/**
 * Maison Titrit — role helpers + types.
 * Roles are stored as String (SQLite has no enum); constrained at the app layer.
 */
export const ROLES = [
	"FOUNDER",
	"DEVELOPER",
	"ADMIN",
	"MANAGER",
	"MARKETER",
	"CUSTOMER",
] as const;
export type Role = (typeof ROLES)[number];

/**
 * OWNER_ROLES — full workspace ownership (settings, team, invites).
 * FOUNDER  — the business owner(s).
 * DEVELOPER — code owner (technical founder); same powers, distinct label.
 */
export const OWNER_ROLES: Role[] = ["FOUNDER", "DEVELOPER"];

/** Staff roles that can access /makteb (admin backoffice). */
export const STAFF_ROLES: Role[] = [
	"FOUNDER",
	"DEVELOPER",
	"ADMIN",
	"MANAGER",
	"MARKETER",
];

export function isStaffRole(role: string | null | undefined): role is Role {
	return !!role && (STAFF_ROLES as readonly string[]).includes(role);
}

export function isOwnerRole(role: string | null | undefined): boolean {
	return !!role && (OWNER_ROLES as readonly string[]).includes(role);
}

/** Permission matrix — who can do what in the backoffice. */
export function can(
	role: string | null | undefined,
	action: Permission,
): boolean {
	if (!role) return false;
	switch (action) {
		case "products:read":
		case "categories:read":
			return (
				role === "FOUNDER" ||
				role === "DEVELOPER" ||
				role === "ADMIN" ||
				role === "MANAGER"
			);
		case "products:write":
		case "orders:write":
		case "categories:write":
			return role === "FOUNDER" || role === "DEVELOPER" || role === "ADMIN";
		case "orders:read":
		case "customers:read":
			return isStaffRole(role);
		case "content:write":
			return (
				role === "FOUNDER" ||
				role === "DEVELOPER" ||
				role === "ADMIN" ||
				role === "MARKETER"
			);
		case "integrations:write":
			// Marketing trackers (GTM, pixels…) — marketers manage tags; domain
			// verifications stay behind settings:write (owners only).
			return isOwnerRole(role) || role === "MARKETER";
		case "users:manage":
		case "invites:manage":
		case "settings:write":
			return isOwnerRole(role);
		default:
			return false;
	}
}

export type Permission =
	| "products:read"
	| "products:write"
	| "orders:read"
	| "orders:write"
	| "categories:read"
	| "categories:write"
	| "content:write"
	| "customers:read"
	| "integrations:write"
	| "users:manage"
	| "invites:manage"
	| "settings:write";
