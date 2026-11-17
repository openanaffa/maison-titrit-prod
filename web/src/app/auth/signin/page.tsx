"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import * as React from "react";
import { GoogleIcon } from "@/components/maison/google-icon";
import { AmazighStar, OrnamentDivider } from "@/components/maison/motifs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { site } from "@/config/site";
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
		if (callbackUrl) {
			url.searchParams.set("next", callbackUrl);
		}
		return url.toString();
	}

	/** Destination after a completed sign-in: explicit callbackUrl wins,
	 *  otherwise staff → /makteb, customers → /compte. */
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

	async function onEmailSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setLoading(true);
		setError(null);
		setNotice(null);
		const supabase = createSupabaseBrowserClient();

		try {
			if (mode === "signup") {
				const { data, error: authError } = await supabase.auth.signUp({
					email: email.trim().toLowerCase(),
					password,
					options: {
						data: { name: name.trim() },
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
					email: email.trim().toLowerCase(),
					password,
				});
				if (authError) throw authError;
				window.location.assign(await postAuthDestination(supabase));
			}
		} catch (authError) {
			console.error(`Supabase ${mode} request failed`, authError);
			setError(
				mode === "signup" ? t("auth.signupError") : t("auth.emailError"),
			);
		} finally {
			setLoading(false);
		}
	}

	return (
		<section className="vintage-paper flex min-h-[100svh] items-start justify-center px-4 pt-10 pb-44 sm:pt-12 sm:pb-40">
			<div className="w-full max-w-md">
				<div className="vintage-frame rounded-sm bg-card/95 p-7 sm:p-9">
					<div className="text-center">
						<Image
							src="/assets/titrit-logo-gold.svg"
							alt=""
							aria-hidden="true"
							width={48}
							height={48}
							className="titrit-logo-mark mx-auto h-12 w-12"
							draggable={false}
							unoptimized
						/>
						<h1 className="wordmark mt-3 text-xl uppercase text-ink dark:text-cream">
							{site.name}
						</h1>
						<p className="tifinagh mt-1 text-sm text-bronze">
							{site.nameAmazigh}
						</p>
						<OrnamentDivider className="mt-4" width={160} />
					</div>

					<p className="mt-5 text-center font-serif text-sm text-ink-soft dark:text-cream/75">
						{isStaffIntent
							? t("auth.googleStaffHint")
							: t("auth.googleCustomerHint")}
					</p>

					{(error || notice) && (
						<p
							role={error ? "alert" : "status"}
							className={`mt-4 rounded-sm p-3 text-center font-serif text-sm ${
								error
									? "bg-terracotta/10 text-terracotta"
									: "bg-bronze/10 text-ink-soft dark:text-cream/80"
							}`}
						>
							{error || notice}
						</p>
					)}

					<form onSubmit={onEmailSubmit} className="mt-6 space-y-4">
						{mode === "signup" && (
							<div>
								<Label htmlFor="auth-name">{t("auth.fullName")}</Label>
								<Input
									id="auth-name"
									autoComplete="name"
									required
									value={name}
									onChange={(event) => setName(event.target.value)}
									className="mt-1.5 field-vintage"
								/>
							</div>
						)}
						<div>
							<Label htmlFor="auth-email">{t("auth.email")}</Label>
							<Input
								id="auth-email"
								type="email"
								autoComplete="email"
								required
								value={email}
								onChange={(event) => setEmail(event.target.value)}
								className="mt-1.5 field-vintage"
							/>
						</div>
						<div>
							<Label htmlFor="auth-password">{t("auth.password")}</Label>
							<Input
								id="auth-password"
								type="password"
								autoComplete={
									mode === "signup" ? "new-password" : "current-password"
								}
								minLength={8}
								required
								value={password}
								onChange={(event) => setPassword(event.target.value)}
								className="mt-1.5 field-vintage"
							/>
						</div>
						<Button
							type="submit"
							disabled={loading}
							className="h-12 w-full rounded-full bg-ink px-6 font-label text-[0.74rem] uppercase tracking-[0.16em] text-cream transition-colors hover:bg-terracotta focus-visible:ring-2 focus-visible:ring-bronze-light disabled:opacity-70 dark:bg-cream dark:text-ink"
						>
							{loading
								? "…"
								: mode === "signup"
									? t("auth.signup")
									: t("auth.signin")}
						</Button>
					</form>

					<div className="my-5 flex items-center gap-3 text-bronze/70">
						<span className="h-px flex-1 bg-bronze/25" />
						<span className="font-label text-[0.6rem] uppercase tracking-[0.16em]">
							{t("auth.or")}
						</span>
						<span className="h-px flex-1 bg-bronze/25" />
					</div>

					<Button
						type="button"
						onClick={onGoogle}
						disabled={loading}
						className="h-12 w-full gap-3 rounded-full border border-bronze/45 bg-cream px-6 font-label text-[0.74rem] uppercase tracking-[0.16em] text-ink transition-colors hover:border-terracotta hover:text-terracotta focus-visible:ring-2 focus-visible:ring-bronze-light disabled:opacity-70 dark:bg-cream dark:text-ink"
					>
						<GoogleIcon className="size-5 shrink-0" />
						{t("auth.continueGoogle")}
					</Button>

					<p className="mt-4 text-center font-serif text-sm text-ink-soft dark:text-cream/75">
						{mode === "signin" ? t("auth.noAccount") : t("auth.hasAccount")}{" "}
						<button
							type="button"
							onClick={() => {
								setMode(mode === "signin" ? "signup" : "signin");
								setError(null);
								setNotice(null);
							}}
							className="font-semibold text-terracotta underline underline-offset-2"
						>
							{mode === "signin" ? t("auth.signup") : t("auth.signin")}
						</button>
					</p>

					<p className="mt-6 flex items-center justify-center gap-2 text-center font-serif text-xs text-bronze/80">
						<AmazighStar className="size-3" strokeWidth={1.6} />
						{site.nameAmazigh}
					</p>
				</div>

				<p className="mt-4 text-center font-serif text-xs text-ink-soft/70 dark:text-cream/60">
					{t("auth.termsBefore")}
					<Link
						href="/cgv"
						className="underline decoration-bronze/40 underline-offset-2 transition-colors hover:text-terracotta"
					>
						{t("auth.termsConditions")}
					</Link>
					{t("auth.termsAnd")}
					<Link
						href="/confidentialite"
						className="underline decoration-bronze/40 underline-offset-2 transition-colors hover:text-terracotta"
					>
						{t("auth.termsPrivacy")}
					</Link>
					{t("auth.termsAfter")}
				</p>
			</div>
		</section>
	);
}
