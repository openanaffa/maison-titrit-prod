"use client";

import Image from "next/image";
import Link from "next/link";
import { GoogleIcon } from "@/components/maison/google-icon";
import { AmazighStar, OrnamentDivider } from "@/components/maison/motifs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { site } from "@/config/site";

import type { Ctx } from "@/i18n/locale-provider";

export type SigninFormProps = {
	mode: "signin" | "signup";
	isStaffIntent: boolean;
	t: Ctx["t"];
	onModeToggle: () => void;
	onSubmit: (payload: {
		email: string;
		password: string;
		name: string;
		mode: "signin" | "signup";
	}) => void | Promise<void>;
	onGoogle: () => void | Promise<void>;
	loading: boolean;
	error: string | null;
	notice: string | null;
	name: string;
	email: string;
	password: string;
	setName: (v: string) => void;
	setEmail: (v: string) => void;
	setPassword: (v: string) => void;
};

/**
 * Signin/signup form — small client component extracted from the auth page.
 * Purely presentational: the parent page owns mode, submission, auth and
 * post-sign-in navigation.
 */
export function SigninForm({
	mode,
	isStaffIntent,
	t,
	onModeToggle,
	onSubmit,
	onGoogle,
	loading,
	error,
	notice,
	name,
	email,
	password,
	setName,
	setEmail,
	setPassword,
}: SigninFormProps) {
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

					<form
						onSubmit={(e) => {
							e.preventDefault();
							onSubmit({ email, password, name, mode });
						}}
						className="mt-6 space-y-4"
					>
						{mode === "signup" && (
							<div>
								<Label htmlFor="auth-name">{t("auth.fullName")}</Label>
								<Input
									id="auth-name"
									autoComplete="name"
									required
									value={name}
									onChange={(e) => setName(e.target.value)}
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
								onChange={(e) => setEmail(e.target.value)}
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
								onChange={(e) => setPassword(e.target.value)}
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
							onClick={onModeToggle}
							className="font-semibold text-terracotta underline underline-offset-2"
						>
							{mode === "signin" ? t("auth.signup") : t("auth.signin")}
						</button>
					</p>

					<p className="mt-6 flex items-center justify-center gap-2 text-center font-serif text-xs text-bronze/80">
						<AmazighStar className="size-3" strokeWidth={1.6} />
						{site.nameAmazigh}
					</p>

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
			</div>
		</section>
	);
}
