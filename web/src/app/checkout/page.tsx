"use client";

import { ArrowLeft, Loader2, Truck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { CheckoutForm } from "@/components/maison/checkout-form";
import {
	CheckoutEmpty,
	CheckoutSuccess,
} from "@/components/maison/checkout-states";
import { WhatsAppIcon } from "@/components/maison/motifs";
import { useSupabaseAuth } from "@/components/maison/supabase-auth-provider";
import { Button } from "@/components/ui/button";
import { site } from "@/config/site";
import { useT } from "@/i18n/locale-provider";
import {
	getAttribution,
	trackBeginCheckout,
	trackPurchase,
} from "@/lib/analytics";
import { useCart } from "@/lib/cart";

type CheckoutValues = {
	name: string;
	phone: string;
	email: string;
	city: string;
	address: string;
	notes: string;
	utmSource?: string;
	utmMedium?: string;
	utmCampaign?: string;
	utmContent?: string;
	utmTerm?: string;
};

export default function CheckoutPage() {
	const { t } = useT();
	const router = useRouter();
	const { user } = useSupabaseAuth();
	const items = useCart((s) => s.items);
	const clear = useCart((s) => s.clear);
	const total = items.reduce((s, i) => s + i.price * i.qty, 0);

	const [form, setForm] = React.useState<CheckoutValues>({
		name: "",
		phone: "",
		email: user?.email ?? "",
		city: "",
		address: "",
		notes: "",
	});
	const [loading, setLoading] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);
	const [success, setSuccess] = React.useState<{
		number: string;
		whatsapp: string;
	} | null>(null);
	const [utm, setUtm] = React.useState<Record<string, string> | null>(null);
	// One stable idempotency key per checkout session: a customer retrying a
	// timed-out POST must hit the server's replay lookup, not create a
	// duplicate COD order (Codex P2).
	const [idempotencyKey] = React.useState(() =>
		typeof crypto !== "undefined" && crypto.randomUUID
			? crypto.randomUUID()
			: `checkout-${Date.now()}-${Math.random().toString(36).slice(2)}`,
	);

	// Initialise name/email from the logged-in user.
	React.useEffect(() => {
		const name =
			typeof user?.user_metadata?.name === "string"
				? user.user_metadata.name
				: typeof user?.user_metadata?.full_name === "string"
					? user.user_metadata.full_name
					: "";
		setForm((current) => ({
			...current,
			name: current.name || name,
			email: current.email || (user?.email ?? ""),
		}));
	}, [user]);

	// Capture UTM attribution on first visit (consent-gated via sessionStorage)
	React.useEffect(() => {
		const attribution = getAttribution();
		if (attribution) setUtm(attribution);
	}, []);

	// Fire begin_checkout once when checkout loads with items (consent-gated)
	// biome-ignore lint/correctness/useExhaustiveDependencies: analytics event must fire once on mount
	React.useEffect(() => {
		if (items.length > 0) {
			trackBeginCheckout(
				items.map((i) => ({
					ref: i.ref,
					name: i.name,
					price: i.price,
					qty: i.qty,
				})),
				total,
				"MAD",
			);
		}
	}, []);

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError(null);
		if (items.length === 0) {
			setError(t("checkout.empty"));
			return;
		}
		setLoading(true);
		try {
			const payload: CheckoutValues = {
				...form,
				utmSource: utm?.source ?? undefined,
				utmMedium: utm?.medium ?? undefined,
				utmCampaign: utm?.campaign ?? undefined,
				utmContent: utm?.content ?? undefined,
				utmTerm: utm?.term ?? undefined,
			};
			const res = await fetch("/api/checkout", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					items: items.map((i) => ({
						productId: i.productId,
						qty: i.qty,
						size: i.size,
					})),
					customer: payload,
					idempotencyKey,
				}),
			});
			const json = await res.json();
			if (!res.ok) {
				setError(json.error || "Erreur");
				return;
			}
			// Purchase is dispatched server-first via trackPurchase (See
			// src/lib/analytics.ts division of labor) — no separate client fbq fire,
			// which would double-send the event.
			await trackPurchase(
				{
					number: json.order.number,
					total: json.order.total,
					currency: "MAD",
					items: items.map((i) => ({
						ref: i.ref,
						name: i.name,
						price: i.price,
						qty: i.qty,
					})),
				},
				{
					email: form.email || undefined,
					phone: form.phone || undefined,
				},
			);
			setSuccess({ number: json.order.number, whatsapp: json.whatsapp });
			clear();
		} catch {
			setError("Erreur réseau");
		} finally {
			setLoading(false);
		}
	}

	// Success screen
	if (success)
		return (
			<CheckoutSuccess number={success.number} whatsapp={success.whatsapp} />
		);

	// Empty cart
	if (items.length === 0) return <CheckoutEmpty />;

	return (
		<section className="vintage-paper min-h-[80vh] py-12 sm:py-16">
			<div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
				<div className="text-center">
					<p className="eyebrow">{t("checkout.title")}</p>
					<h1 className="wordmark mt-3 text-3xl uppercase text-ink sm:text-4xl dark:text-cream">
						{t("checkout.title")}
					</h1>
					<p className="mt-2 font-serif text-base text-ink-soft dark:text-cream/70">
						{t("checkout.subtitle")}
					</p>
				</div>

				<form
					onSubmit={onSubmit}
					className="mt-10 grid gap-8 lg:grid-cols-[1fr_360px]"
				>
					<CheckoutForm form={form} onChange={setForm} user={user} />

					{/* Summary */}
					<div className="card-vintage h-fit rounded-sm p-6">
						<h2 className="heading-vintage">{t("checkout.summary")}</h2>
						<ul className="mt-4 space-y-2 font-serif text-sm">
							{items.map((i) => (
								<li
									key={`${i.productId}-${i.size}`}
									className="flex justify-between text-ink-soft dark:text-cream/75"
								>
									<span className="truncate pe-2">
										{i.name} × {i.qty} ({i.size})
									</span>
									<span>
										{(i.price * i.qty).toLocaleString("fr-FR")} {i.currency}
									</span>
								</li>
							))}
						</ul>
						<div className="mt-4 flex items-center justify-between border-t border-bronze/25 pt-4">
							<span className="font-label text-[0.66rem] uppercase tracking-[0.18em] text-bronze">
								{t("cart.total")}
							</span>
							<span className="heading-vintage-md">
								{total.toLocaleString("fr-FR")} {site.currency}
							</span>
						</div>
						<p className="mt-3 flex items-center gap-2 font-serif text-xs text-ink-soft/80 dark:text-cream/60">
							<Truck className="size-3.5 text-terracotta" />
							{t("checkout.payment")}
						</p>

						{error && (
							<p
								role="alert"
								aria-live="assertive"
								className="mt-4 rounded-sm bg-terracotta/10 p-3 text-center font-serif text-sm text-terracotta"
							>
								{error}
							</p>
						)}

						<Button
							type="submit"
							disabled={loading}
							className="mt-5 h-12 w-full rounded-full bg-ink font-label text-[0.72rem] uppercase tracking-[0.18em] text-cream hover:bg-terracotta focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze-light dark:bg-cream dark:text-ink"
						>
							{loading ? (
								<Loader2 className="size-4 animate-spin motion-reduce:animate-none" />
							) : (
								<WhatsAppIcon className="size-4" />
							)}
							{t("checkout.placeOrder")}
						</Button>
						<Link
							href="/panier"
							className="mt-3 flex items-center justify-center gap-1.5 font-label text-[0.62rem] uppercase tracking-[0.16em] text-bronze transition-colors hover:text-terracotta focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze-light"
						>
							<ArrowLeft className="size-3 rtl:rotate-180" />
							{t("cart.title")}
						</Link>
					</div>
				</form>
			</div>
		</section>
	);
}
