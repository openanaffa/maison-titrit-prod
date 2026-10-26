/**
 * Server-side auth helpers — wrap getServerSession for route handlers + pages.
 */
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import type { Permission } from "@/lib/roles";
import { can } from "@/lib/roles";

export async function getSession() {
  return getServerSession(authOptions);
}

/** Get the authenticated user (with role), or null. */
export async function getCurrentUser() {
  const session = await getSession();
  if (!session?.user?.email) return null;
  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, email: true, name: true, role: true, image: true, phone: true },
  });
  return user;
}

/** Require a staff session; throws/redirects if missing. */
export async function requireStaff() {
  const user = await getCurrentUser();
  if (!user || !["FOUNDER", "ADMIN", "MANAGER"].includes(user.role)) {
    return { user: null, ok: false as const };
  }
  return { user, ok: true as const };
}

/** Require a specific permission; returns user + allowed flag. */
export async function requirePermission(action: Permission) {
  const user = await getCurrentUser();
  if (!user) return { user: null, ok: false as const, allowed: false };
  const allowed = can(user.role, action);
  return { user, ok: true as const, allowed };
}
