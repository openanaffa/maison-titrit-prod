import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSafeRedirectPath } from "@/lib/safe-redirect";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const nextPath = getSafeRedirectPath(
    requestUrl.searchParams.get("next"),
    requestUrl.origin,
    "/compte",
  );

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(nextPath, requestUrl.origin));
    }
    console.error("Supabase OAuth callback failed", error);
  }

  return NextResponse.redirect(new URL("/auth/error", requestUrl.origin));
}
