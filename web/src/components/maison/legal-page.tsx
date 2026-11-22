"use client";

import Link from "next/link";
import {
	AmazighStar,
	OrnamentDivider,
	Reveal,
} from "@/components/maison/motifs";
import { type LegalDocKey, legalDocs } from "@/i18n/legal-docs";
import { useT } from "@/i18n/locale-provider";
import { hasVerifiedLegalValue } from "@/lib/legal-identity-utils";
import type { LegalIdentity } from "@/lib/types/legal-identity";

const IDENTITY_LABELS: Record<string, Record<string, string>> = {
	fr: {
		heading: "Mentions légales vérifiées",
		operator: "Exploitant",
		status: "Statut juridique",
		publisher: "Responsable de la publication",
		address: "Adresse",
		email: "Email",
		phone: "Téléphone",
		rcRnae: "RC / RNAE",
		ice: "ICE",
		taxIdIf: "IF",
		patente: "Patente",
		cndp: "Déclaration CNDP",
		dpo: "Contact confidentialité / DPO",
		host: "Hébergeur",
	},
	ar: {
		heading: "الإشعارات القانونية الموثوقة",
		operator: "المُشغِّل",
		status: "الوضع القانوني",
		publisher: "المسؤول عن النشر",
		address: "العنوان",
		email: "البريد الإلكتروني",
		phone: "الهاتف",
		rcRnae: "السجل التجاري / RNAE",
		ice: "ICE",
		taxIdIf: "المعرف الضريبي (IF)",
		patente: "الضريبة المهنية (Patente)",
		cndp: "تصريح CNDP",
		dpo: "مسؤول حماية البيانات / الخصوصية",
		host: "المستضيف",
	},
	en: {
		heading: "Verified legal information",
		operator: "Operator",
		status: "Legal status",
		publisher: "Publication director",
		address: "Address",
		email: "Email",
		phone: "Phone",
		rcRnae: "RC / RNAE",
		ice: "ICE",
		taxIdIf: "Tax ID (IF)",
		patente: "Patente",
		cndp: "CNDP declaration",
		dpo: "Privacy / DPO contact",
		host: "Host",
	},
};

function rows(
	legal: LegalIdentity | undefined,
	labels: Record<string, string>,
): Array<{ label: string; value: string }> {
	if (!legal) return [];
	const host = [
		hasVerifiedLegalValue(legal.hostName) ? legal.hostName : "",
		hasVerifiedLegalValue(legal.hostAddress) ? legal.hostAddress : "",
		hasVerifiedLegalValue(legal.hostContact) ? legal.hostContact : "",
	]
		.filter(Boolean)
		.join(" — ");
	const items: Array<[string, string]> = [
		[labels.operator, legal.operatorName],
		[labels.status, legal.legalStatus],
		[labels.publisher, legal.responsiblePublisher],
		[labels.address, legal.address],
		[labels.email, legal.email],
		[labels.phone, legal.phone],
		[labels.rcRnae, legal.rcRnae],
		[labels.ice, legal.ice],
		[labels.taxIdIf, legal.taxIdIf],
		[labels.patente, legal.patente],
		[labels.cndp, legal.cndpDeclarationNumber],
		[labels.dpo, legal.dpoContact],
		[labels.host, host],
	];
	return items
		.filter(([, value]) => hasVerifiedLegalValue(value))
		.map(([label, value]) => ({ label, value }));
}

/**
 * Long-form legal document renderer (privacy policy & CGV).
 * Content lives in src/i18n/legal-docs.ts; this component lays it out in the
 * vintage design system, follows the active locale, and displays only verified
 * owner-provided legal identity details when available.
 */
export function LegalPage({
	doc,
	legalIdentity,
}: {
	doc: LegalDocKey;
	legalIdentity?: LegalIdentity;
}) {
	const { locale, t } = useT();
	const d = legalDocs[locale][doc];
	const labels = IDENTITY_LABELS[locale] ?? IDENTITY_LABELS.fr;
	const identityRows = rows(legalIdentity, labels);

	return (
		<section className="vintage-paper min-h-[80vh] py-16 sm:py-20">
			<div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
				<Reveal className="text-center">
					<AmazighStar className="mx-auto size-9 text-ink" />
					<p className="eyebrow mt-4">{d.eyebrow}</p>
					<h1 className="wordmark mt-3 text-3xl uppercase text-ink sm:text-4xl dark:text-cream">
						{d.title}
					</h1>
					<OrnamentDivider className="mt-5" />
					<p className="mt-4 font-serif text-xs text-ink-soft/70 dark:text-cream/60">
						{d.updated}
					</p>
				</Reveal>

				<Reveal className="mt-10">
					<p className="font-serif text-[0.95rem] leading-relaxed text-ink-soft dark:text-cream/80">
						{d.intro}
					</p>
				</Reveal>

				{identityRows.length > 0 ? (
					<Reveal className="mt-10 rounded-sm border border-bronze/25 bg-cream/60 p-5 dark:bg-ink/30">
						<h2 className="heading-vintage">{labels.heading}</h2>
						<dl className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
							{identityRows.map((row) => (
								<div key={row.label}>
									<dt className="font-label text-[0.62rem] uppercase tracking-[0.18em] text-ink">
										{row.label}
									</dt>
									<dd className="mt-1 whitespace-pre-line font-serif text-sm text-ink-soft dark:text-cream/80">
										{row.value}
									</dd>
								</div>
							))}
						</dl>
					</Reveal>
				) : null}

				<div className="mt-10 space-y-8">
					{d.sections.map((s) => (
						<Reveal key={s.h}>
							<h2 className="heading-vintage">{s.h}</h2>
							{s.p.map((para) => (
								<p
									key={`${s.h}-${para}`}
									className="mt-2 font-serif text-sm leading-relaxed text-ink-soft dark:text-cream/75"
								>
									{para}
								</p>
							))}
						</Reveal>
					))}
				</div>

				<Reveal className="mt-12 border-t border-bronze/30 pt-8">
					<div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
						<Link
							href="/"
							className="font-label text-[0.7rem] uppercase tracking-[0.18em] text-ink transition-colors hover:text-ink"
						>
							{t("detail.home")}
						</Link>
						{d.related.map((r) => (
							<Link
								key={r.href}
								href={r.href}
								className="font-label text-[0.7rem] uppercase tracking-[0.18em] text-ink transition-colors hover:text-ink"
							>
								{r.label}
							</Link>
						))}
					</div>
				</Reveal>
			</div>
		</section>
	);
}
