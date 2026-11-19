"use client";

import Link from "next/link";
import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useT } from "@/i18n/locale-provider";

export type CheckoutValues = {
	name: string;
	phone: string;
	email: string;
	city: string;
	address: string;
	notes: string;
};

export type CheckoutFormProps = {
	form: CheckoutValues;
	onChange: (next: (current: CheckoutValues) => CheckoutValues) => void;
	user: {
		email?: string | null;
		user_metadata?: { name?: string; full_name?: string };
	} | null;
};

/**
 * Checkout form fields — presentational client component. Owns no submission;
 * the parent page owns the `<form>` tag, form state and the place-order
 * button (which lives in the summary card).
 */
export function CheckoutForm({ form, onChange, user }: CheckoutFormProps) {
	const { t } = useT();

	React.useEffect(() => {
		const email = user?.email ?? "";
		const name =
			typeof user?.user_metadata?.name === "string"
				? user.user_metadata.name
				: typeof user?.user_metadata?.full_name === "string"
					? user.user_metadata.full_name
					: "";
		onChange((current) => ({
			...current,
			name: current.name || name,
			email: current.email || email,
		}));
	}, [user, onChange]);

	function set<K extends keyof typeof form>(k: K, v: string) {
		onChange((current) => ({ ...current, [k]: v }));
	}

	return (
		<div className="mt-10 grid gap-8">
			{/* Form fields */}
			<div className="space-y-5">
				{!user && (
					<div className="rounded-sm bg-bronze/10 p-4 font-serif text-sm text-ink-soft dark:text-cream/75">
						<Link
							href={`/auth/signin?callbackUrl=/checkout`}
							className="font-display font-semibold text-terracotta hover:underline"
						>
							{t("auth.signin")}
						</Link>{" "}
						— {t("checkout.loginRequired")}
					</div>
				)}
				<div className="card-vintage rounded-sm p-5">
					<h2 className="heading-vintage">{t("compte.profile")}</h2>
					<div className="mt-4 grid gap-4 sm:grid-cols-2">
						<CheckoutField id="checkout-name" label={t("checkout.name")}>
							<Input
								id="checkout-name"
								name="name"
								autoComplete="name"
								required
								value={form.name}
								onChange={(e) => set("name", e.target.value)}
								className="field-vintage"
							/>
						</CheckoutField>
						<CheckoutField id="checkout-phone" label={t("checkout.phone")}>
							<Input
								id="checkout-phone"
								name="phone"
								autoComplete="tel"
								required
								type="tel"
								value={form.phone}
								onChange={(e) => set("phone", e.target.value)}
								className="field-vintage"
							/>
						</CheckoutField>
						<CheckoutField id="checkout-email" label={t("checkout.email")}>
							<Input
								id="checkout-email"
								name="email"
								autoComplete="email"
								type="email"
								value={form.email}
								onChange={(e) => set("email", e.target.value)}
								className="field-vintage"
							/>
						</CheckoutField>
						<CheckoutField id="checkout-city" label={t("checkout.city")}>
							<Input
								id="checkout-city"
								name="city"
								autoComplete="address-level2"
								required
								value={form.city}
								onChange={(e) => set("city", e.target.value)}
								className="field-vintage"
							/>
						</CheckoutField>
					</div>
					<div className="mt-4">
						<CheckoutField id="checkout-address" label={t("checkout.address")}>
							<Textarea
								id="checkout-address"
								name="address"
								autoComplete="street-address"
								required
								value={form.address}
								onChange={(e) => set("address", e.target.value)}
								rows={2}
								className="field-vintage"
							/>
						</CheckoutField>
					</div>
					<div className="mt-4">
						<CheckoutField id="checkout-notes" label={t("checkout.notes")}>
							<Textarea
								id="checkout-notes"
								name="notes"
								autoComplete="off"
								value={form.notes}
								onChange={(e) => set("notes", e.target.value)}
								rows={2}
								className="field-vintage"
							/>
						</CheckoutField>
					</div>
				</div>
			</div>
		</div>
	);
}

function CheckoutField({
	id,
	label,
	children,
}: {
	id: string;
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div>
			<Label htmlFor={id} className="label-vintage">
				{label}
			</Label>
			<div className="mt-1.5">{children}</div>
		</div>
	);
}
