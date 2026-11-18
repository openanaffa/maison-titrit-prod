"use client";

import { useSearchParams } from "next/navigation";
import * as React from "react";
import { SigninForm } from "@/components/auth/signin-form";
import { useT } from "@/i18n/locale-provider";
import { isStaffRole } from "@/lib/roles";
import { getSafeRedirectPath } from "@/lib/safe-redirect";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getRoleFromAccessToken } from "@/lib/supabase/role-claims";

export default function AuthPage() {
	return (
		<React.Suspense>
			<AuthPageInner />
		</React.Suspense>
	);
}

function AuthPageInner() {
	const params = useSearchParams();
	// Only an explicit callbackUrl pins the destination; without one the
	// callback route / post-auth logic picks by role (staff → /makteb,
	// customers → /compte).
	const callbackUrl = getSafeRedirectPath(
		params.get("callbackUrl"),
		typeof window === "undefined"
			? "https://local.invalid"
			: window.location.origin,
		"",
	);
	const { t } = useT();
	const [mode, setMode] = React.useState<"signin" | "signup">("signin");
	const [name, setName] = React.useState("");
	const [email, setEmail] = React.useState("");
	const [password, setPassword] = React.useState("");
	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);
	const [notice, setNotice] = React.useState<string | null>(null);
	const isStaffIntent = callbackUrl.startsWith("/makteb");

	function authRedirectUrl() {
		const url = new URL("/auth/callback", window.location.origin);
		if (callbackUrl) url.searchParams.set("next", callbackUrl);
		return url.toString();
	}

	async function postAuthDestination(
		supabase: ReturnType<typeof createSupabaseBrowserClient>,
	) {
		if (callbackUrl) return callbackUrl;
		const { data } = await supabase.auth.getSession();
		const role = getRoleFromAccessToken(data.session?.access_token ?? "");
		return isStaffRole(role) ? "/makteb" : "/compte";
	}

	async function onGoogle() {
		setLoading(true);
		setError(null);
		setNotice(null);
		try {
			const { error: authError } =
				await createSupabaseBrowserClient().auth.signInWithOAuth({
					provider: "google",
					options: { redirectTo: authRedirectUrl() },
				});
			if (authError) throw authError;
		} catch (authError) {
			console.error("Supabase Google sign-in failed", authError);
			setLoading(false);
			setError(t("auth.googleError"));
		}
	}

	async function onEmailSubmit(payload: {
		email: string;
		password: string;
		name: string;
		mode: "signin" | "signup";
	}) {
		setLoading(true);
		setError(null);
		setNotice(null);
		const supabase = createSupabaseBrowserClient();

		try {
			if (payload.mode === "signup") {
				const { data, error: authError } = await supabase.auth.signUp({
					email: payload.email.trim().toLowerCase(),
					password: payload.password,
					options: {
						data: { name: payload.name.trim() },
						emailRedirectTo: authRedirectUrl(),
					},
				});
				if (authError) throw authError;
				if (data.session) {
					window.location.assign(await postAuthDestination(supabase));
				} else {
					setNotice(t("auth.signupConfirm"));
				}
			} else {
				const { error: authError } = await supabase.auth.signInWithPassword({
					email: payload.email.trim().toLowerCase(),
					password: payload.password,
				});
				if (authError) throw authError;
				window.location.assign(await postAuthDestination(supabase));
			}
		} catch (authError) {
			console.error(`Supabase ${payload.mode} request failed`, authError);
			setError(
				payload.mode === "signup"
					? t("auth.signupError")
					: t("auth.emailError"),
			);
		} finally {
			setLoading(false);
		}
	}

	return (
		<SigninForm
			mode={mode}
			isStaffIntent={isStaffIntent}
			t={t}
			onModeToggle={() => {
				setMode(mode === "signin" ? "signup" : "signin");
				setError(null);
				setNotice(null);
			}}
			onSubmit={onEmailSubmit}
			onGoogle={onGoogle}
			loading={loading}
			error={error}
			notice={notice}
			name={name}
			email={email}
			password={password}
			setName={setName}
			setEmail={setEmail}
			setPassword={setPassword}
		/>
	);
}
