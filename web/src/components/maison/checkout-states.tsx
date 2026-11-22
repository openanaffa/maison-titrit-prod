"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import {
	AmazighStar,
	OrnamentDivider,
	WhatsAppIcon,
} from "@/components/maison/motifs";
import { Button } from "@/components/ui/button";
import { useT } from "@/i18n/locale-provider";

export function CheckoutSuccess({
	number,
	whatsapp,
}: {
	number: string;
	whatsapp: string;
}) {
	const { t } = useT();
	return (
		<section
			className="vintage-paper flex min-h-[80vh] items-center justify-center px-4 py-16"
			aria-live="polite"
			aria-atomic="true"
		>
			<div className="vintage-frame max-w-md rounded-sm bg-card/95 p-9 text-center">
				<span className="mx-auto inline-flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
					<Check className="size-7" aria-hidden="true" />
				</span>
				<h1 className="wordmark mt-4 text-2xl uppercase text-ink dark:text-cream">
					{t("checkout.success")}
				</h1>
				<OrnamentDivider className="mt-4" width={160} />
				<p className="mt-5 font-serif text-base text-ink-soft dark:text-cream/80">
					{t("checkout.orderNumber")}:{" "}
					<span className="font-display font-semibold text-ink dark:text-cream">
						{number}
					</span>
				</p>
				<p className="mt-2 font-serif text-sm text-ink-soft/80 dark:text-cream/60">
					{t("checkout.successDesc")}
				</p>
				<a
					href={whatsapp}
					target="_blank"
					rel="noopener noreferrer"
					className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ink font-label text-[0.72rem] uppercase tracking-[0.18em] text-cream transition-colors hover:bg-terracotta dark:bg-cream dark:text-ink"
				>
					<WhatsAppIcon className="size-4" />
					{t("cta.placeOrder")}
				</a>
				<Link
					href="/#collection"
					className="mt-3 inline-block font-label text-[0.62rem] uppercase tracking-[0.16em] text-ink hover:text-ink"
				>
					{t("cta.continueShopping")}
				</Link>
			</div>
		</section>
	);
}

export function CheckoutEmpty() {
	const { t } = useT();
	return (
		<section className="vintage-paper flex min-h-[80vh] items-center justify-center px-4 py-16">
			<div className="text-center">
				<AmazighStar
					className="mx-auto size-12 text-ink/40"
					strokeWidth={1.4}
				/>
				<p className="mt-4 font-serif text-lg text-ink-soft dark:text-cream/70">
					{t("checkout.empty")}
				</p>
				<Button
					asChild
					className="mt-4 rounded-full bg-ink px-6 font-label text-[0.72rem] uppercase tracking-[0.18em] text-cream dark:bg-cream dark:text-ink"
				>
					<Link href="/#collection">{t("cta.continueShopping")}</Link>
				</Button>
			</div>
		</section>
	);
}
