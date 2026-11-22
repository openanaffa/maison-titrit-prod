"use client";

import Image from "next/image";
import Link from "next/link";
import {
	AmazighStar,
	NeedleThread,
	WhatsAppIcon,
} from "@/components/maison/motifs";
import { SocialIcons } from "@/components/maison/social-icons";
import { site } from "@/config/site";
import { useT } from "@/i18n/locale-provider";
import { whatsappCatalog } from "@/lib/brand";
import { hasVerifiedLegalValue } from "@/lib/legal-identity-utils";
import type { LegalIdentity } from "@/lib/types/legal-identity";

type SiteFooterProps = {
	legalIdentity?: LegalIdentity;
};

export function SiteFooter({ legalIdentity }: SiteFooterProps) {
	const { t } = useT();
	const year = new Date().getFullYear();
	const legal = legalIdentity;
	const operatorLabel =
		legal?.operatorName || legal?.responsiblePublisher || "";
	const showOperator = hasVerifiedLegalValue(operatorLabel);
	const showLegalStatus = hasVerifiedLegalValue(legal?.legalStatus ?? "");
	const showPublisher = hasVerifiedLegalValue(
		legal?.responsiblePublisher ?? "",
	);
	const showAddress = hasVerifiedLegalValue(legal?.address ?? "");
	const showEmail = hasVerifiedLegalValue(legal?.email ?? "");
	const showPhone = hasVerifiedLegalValue(legal?.phone ?? "");
	const showRcRnae = hasVerifiedLegalValue(legal?.rcRnae ?? "");
	const showIce = hasVerifiedLegalValue(legal?.ice ?? "");
	const showIf = hasVerifiedLegalValue(legal?.taxIdIf ?? "");
	const showPatente = hasVerifiedLegalValue(legal?.patente ?? "");
	const showCndp = hasVerifiedLegalValue(legal?.cndpDeclarationNumber ?? "");
	const showDpo = hasVerifiedLegalValue(legal?.dpoContact ?? "");
	const showHost =
		hasVerifiedLegalValue(legal?.hostName ?? "") ||
		hasVerifiedLegalValue(legal?.hostAddress ?? "") ||
		hasVerifiedLegalValue(legal?.hostContact ?? "");

	return (
		<footer className="mt-auto border-t border-bronze/30 bg-ink text-cream dark:border-bronze/20">
			<div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
				<div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
					{/* Brand */}
					<div>
						<div className="flex items-center gap-3">
							<Image
								src="/assets/titrit-logo-mono.svg"
								alt=""
								aria-hidden="true"
								width={44}
								height={44}
								className="h-11 w-11 shrink-0 select-none"
								style={{
									filter:
										"invert(1) sepia(0.18) saturate(1.5) hue-rotate(-12deg) brightness(1.1)",
								}}
								draggable={false}
								unoptimized
							/>
							<div>
								<p className="wordmark text-xl uppercase text-cream">
									{site.name}
								</p>
								<p className="tifinagh text-[0.7rem] text-bronze-light">
									{site.nameAmazigh}
								</p>
							</div>
						</div>
						<p className="script-tagline mt-4 text-2xl text-bronze-light">
							{t("footer.tagline")}
						</p>
						<p className="mt-4 max-w-sm font-serif text-sm leading-relaxed text-cream/75">
							{t("footer.about")}
						</p>
						<p
							className="mt-3 font-serif text-base text-bronze-light"
							dir="rtl"
						>
							{site.arabicWelcome}
						</p>
						<NeedleThread className="mt-5 h-5 text-bronze-light/70" />
						<p className="mt-4 font-label text-[0.66rem] uppercase tracking-[0.28em] text-bronze-light">
							{site.signature}
						</p>
					</div>

					{/* Nav */}
					<nav aria-label={t("footer.nav")}>
						<p className="font-label text-[0.66rem] uppercase tracking-[0.24em] text-bronze-light">
							{t("footer.nav")}
						</p>
						<ul className="mt-4 space-y-2.5">
							{site.nav.map((n) => (
								<li key={n.href}>
									<a
										href={n.href}
										className="font-serif text-sm text-cream/80 transition-colors hover:text-bronze-light"
									>
										{t(n.labelKey)}
									</a>
								</li>
							))}
						</ul>
					</nav>

					{/* Contact + socials */}
					<div>
						<p className="font-label text-[0.66rem] uppercase tracking-[0.24em] text-bronze-light">
							{t("footer.contact")}
						</p>
						<ul className="mt-4 space-y-2.5 font-serif text-sm text-cream/80">
							<li>
								<a
									href={`tel:${site.phones[0].e164}`}
									className="hover:text-ink"
								>
									{site.phones[0].display}
								</a>
							</li>
							<li>
								<a
									href={`mailto:${site.email}`}
									className="break-all hover:text-ink"
								>
									{site.email}
								</a>
							</li>
							<li>
								<a
									href={whatsappCatalog}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-2 hover:text-ink"
								>
									<WhatsAppIcon className="size-3.5" />
									{t("cta.viewCatalog")}
								</a>
							</li>
						</ul>
						<div className="mt-5">
							<SocialIcons size={44} variant="solid" />
						</div>
					</div>
				</div>

				{/* Legal identity — only verified, owner-provided values are shown. */}
				<div className="mt-12 border-t border-cream/15 pt-6">
					<p className="max-w-4xl font-serif text-xs leading-relaxed text-cream/60">
						{t("footer.legal")}
					</p>
					<ul className="mt-3 flex flex-wrap gap-x-6 gap-y-1 font-serif text-xs text-cream/70">
						{showOperator ? (
							<li className="font-label text-[0.6rem] uppercase tracking-[0.18em] text-bronze-light">
								{operatorLabel}
							</li>
						) : null}
						{showLegalStatus ? <li>{legal?.legalStatus}</li> : null}
						{showPublisher && legal?.responsiblePublisher !== operatorLabel ? (
							<li>Publication&nbsp;: {legal?.responsiblePublisher}</li>
						) : null}
						{showAddress ? (
							<li className="whitespace-pre-line">{legal?.address}</li>
						) : null}
						{showEmail ? (
							<li>
								<a href={`mailto:${legal?.email}`} className="hover:text-ink">
									{legal?.email}
								</a>
							</li>
						) : null}
						{showPhone ? <li>{legal?.phone}</li> : null}
						<li>
							<Link href="/mentions-legales" className="hover:text-ink">
								{t("legal.notice")}
							</Link>
						</li>
						<li>
							<Link href="/confidentialite" className="hover:text-ink">
								{t("legal.privacy")}
							</Link>
						</li>
						<li>
							<Link href="/cookies" className="hover:text-ink">
								{t("legal.cookies")}
							</Link>
						</li>
						<li>
							<Link href="/cgv" className="hover:text-ink">
								{t("legal.terms")}
							</Link>
						</li>
						{showRcRnae ? <li>RNAE/RC&nbsp;: {legal?.rcRnae}</li> : null}
						{showIce ? <li>ICE&nbsp;: {legal?.ice}</li> : null}
						{showIf ? <li>IF&nbsp;: {legal?.taxIdIf}</li> : null}
						{showPatente ? <li>Patente&nbsp;: {legal?.patente}</li> : null}
						{showCndp ? (
							<li>Déclaration CNDP&nbsp;: {legal?.cndpDeclarationNumber}</li>
						) : null}
						{showDpo ? (
							<li>DPO / confidentialité&nbsp;: {legal?.dpoContact}</li>
						) : null}
						<li>
							<Link href="/livraison-retours" className="hover:text-ink">
								{t("legal.deliveryReturns")}
							</Link>
						</li>
						<li>
							<Link href="/guide-des-tailles" className="hover:text-ink">
								{t("legal.sizing")}
							</Link>
						</li>
						<li>
							<Link href="/contact" className="hover:text-ink">
								{t("nav.contact")}
							</Link>
						</li>
						{showHost ? (
							<li>
								Hébergeur&nbsp;:{" "}
								{[legal?.hostName, legal?.hostAddress, legal?.hostContact]
									.filter((v) => hasVerifiedLegalValue(v ?? ""))
									.join(" — ")}
							</li>
						) : null}
					</ul>
				</div>

				<div className="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
					<p className="font-serif text-xs text-cream/60">
						{t("footer.rights", { year })}
					</p>
					<div className="flex items-center gap-2 text-bronze-light/80">
						<AmazighStar className="size-4" strokeWidth={1.6} />
						<span className="font-label text-[0.6rem] uppercase tracking-[0.24em]">
							{t("footer.made")}
						</span>
						<AmazighStar className="size-4" strokeWidth={1.6} />
					</div>
				</div>
			</div>
		</footer>
	);
}
