import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getRoleFromAccessToken } from "@/lib/supabase/role-claims";
import { isStaffRole } from "@/lib/roles";
import { getSafeRedirectPath } from "@/lib/safe-redirect";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const explicitNext = getSafeRedirectPath(
    requestUrl.searchParams.get("next"),
    requestUrl.origin,
    "",
  );

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      if (explicitNext) {
        return NextResponse.redirect(new URL(explicitNext, requestUrl.origin));
      }
      // No explicit destination: send staff to the backoffice, customers to
      // their account page (role comes from the fresh access token's claim).
      const { data } = await supabase.auth.getSession();
      const role = getRoleFromAccessToken(data.session?.access_token ?? "");
      const nextPath = isStaffRole(role) ? "/makteb" : "/compte";
      return NextResponse.redirect(new URL(nextPath, requestUrl.origin));
    }
    console.error("Supabase OAuth callback failed", error);
  }

  return NextResponse.redirect(new URL("/auth/error", requestUrl.origin));
}
