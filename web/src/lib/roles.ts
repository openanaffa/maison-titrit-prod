/**
 * Maison Titrit — role helpers + types.
 * Roles are stored as String (SQLite has no enum); constrained at the app layer.
 */
export const ROLES = ["FOUNDER", "ADMIN", "MANAGER", "CUSTOMER"] as const;
export type Role = (typeof ROLES)[number];

/** Staff roles that can access /makteb (admin backoffice). */
export const STAFF_ROLES: Role[] = ["FOUNDER", "ADMIN", "MANAGER"];

export function isStaffRole(role: string | null | undefined): role is Role {
  return !!role && (STAFF_ROLES as readonly string[]).includes(role);
}

export function isFounderRole(role: string | null | undefined): boolean {
  return role === "FOUNDER";
}

/** Permission matrix — who can do what in the backoffice. */
export function can(role: string | null | undefined, action: Permission): boolean {
  if (!role) return false;
  switch (action) {
    case "products:read":
    case "orders:read":
      return isStaffRole(role);
    case "products:write":
    case "orders:write":
    case "categories:write":
    case "content:write":
      return role === "FOUNDER" || role === "ADMIN";
    case "users:manage":
    case "invites:manage":
    case "settings:write":
      return role === "FOUNDER";
    default:
      return false;
  }
}

export type Permission =
  | "products:read"
  | "products:write"
  | "orders:read"
  | "orders:write"
  | "categories:write"
  | "content:write"
  | "users:manage"
  | "invites:manage"
  | "settings:write";
