/**
 * Server-side auth helpers — verify Supabase sessions and resolve app roles.
 */
import { redirect } from "next/navigation";
import type { Permission } from "@/lib/roles";
import { can, isStaffRole } from "@/lib/roles";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getSession() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error && error.status !== 401) {
    console.error("Unable to verify Supabase auth session", error);
  }
  return data.user;
}

/** Get the authenticated user (with role), or null. */
export async function getCurrentUser() {
  const session = await getSession();
  if (!session?.email_confirmed_at) return null;
  const supabase = await createSupabaseServerClient();
  const { data: user } = await supabase
    .from("User")
    .select("id,supabaseId,email,name,role,image,phone")
    .eq("supabaseId", session.id)
    .maybeSingle()
    .throwOnError();
  return user;
}

/** Require a staff session; throws/redirects if missing. */
export async function requireStaff() {
  const user = await getCurrentUser();
  if (!user || !isStaffRole(user.role)) {
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

/**
 * Server-component guard: redirect back to /makteb when the current user
 * lacks the permission (nav hiding is not enough — protect by URL too).
 */
export async function requirePagePermission(action: Permission) {
  const { user, allowed } = await requirePermission(action);
  if (!user || !allowed) redirect("/makteb");
  return user;
}
