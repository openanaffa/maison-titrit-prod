"use client";

import type { User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getRoleFromAccessToken } from "@/lib/supabase/role-claims";

export type AuthenticatedUser = User & { role: string };
export { getRoleFromAccessToken };

export async function signOut(callbackUrl = "/") {
  const { error } = await createSupabaseBrowserClient().auth.signOut();
  if (error) throw error;
  window.location.assign(callbackUrl);
}
