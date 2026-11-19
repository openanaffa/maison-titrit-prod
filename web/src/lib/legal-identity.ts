import { unstable_cache } from "next/cache";
import { cache } from "react";
import { site } from "@/config/site";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import {
	EMPTY_LEGAL_IDENTITY,
	LEGAL_IDENTITY_KEYS,
	LEGAL_IDENTITY_SETTING_KEY,
	type LegalIdentity,
} from "@/lib/types/legal-identity";

/**
 * Public/store contact defaults are already verified site-wide facts.
 * Legal identifiers, host details and publisher naming stay empty until the
 * owner provides them in /makteb/settings (site.legal).
 */
const DEFAULT_LEGAL_IDENTITY: LegalIdentity = {
	...EMPTY_LEGAL_IDENTITY,
	address: [
		site.address.line1,
		site.address.line2,
		site.address.line3,
		[site.address.city, site.address.country].filter(Boolean).join(", "),
	]
		.filter((v) => v.trim())
		.join("\n"),
	email: site.email,
	phone: site.phones.map((p) => p.display).join(" / "),
};

const MAX_FIELD_LENGTHS: Record<keyof LegalIdentity, number> = {
	operatorName: 160,
	legalStatus: 120,
	responsiblePublisher: 160,
	address: 400,
	email: 160,
	phone: 120,
	rcRnae: 80,
	ice: 40,
	taxIdIf: 40,
	patente: 40,
	cndpDeclarationNumber: 80,
	dpoContact: 200,
	hostName: 160,
	hostAddress: 400,
	hostContact: 200,
};

import { hasVerifiedLegalValue } from "@/lib/legal-identity-utils";

export { hasVerifiedLegalValue };

function normalizeText(value: unknown, max: number): string {
	if (typeof value !== "string") return "";
	// Strip control chars except newlines/tabs in multiline-friendly fields,
	// trim, and cap length.
	const cleaned = value
		.replace(/\0/g, "")
		.replace(/\p{Cc}/gu, (ch) =>
			ch === "\n" || ch === "\r" || ch === "\t" ? ch : "",
		)
		.trim();
	if (!cleaned) return "";
	return cleaned.slice(0, max);
}

/** Sanitize an incoming payload to owner-provided, plain-text legal fields. */
export function sanitizeLegalIdentity(input: unknown): LegalIdentity {
	const raw = (input ?? {}) as Record<string, unknown>;
	const out = { ...EMPTY_LEGAL_IDENTITY };
	for (const key of LEGAL_IDENTITY_KEYS) {
		out[key] = normalizeText(raw[key], MAX_FIELD_LENGTHS[key]);
	}
	return out;
}

function mergeEffective(raw: Record<string, unknown>): LegalIdentity {
	const stored = sanitizeLegalIdentity(raw);
	const out = { ...DEFAULT_LEGAL_IDENTITY };
	for (const key of LEGAL_IDENTITY_KEYS) {
		out[key] = stored[key] || DEFAULT_LEGAL_IDENTITY[key] || "";
	}
	return out;
}

async function readRow(): Promise<Record<string, unknown>> {
	if (
		!process.env.NEXT_PUBLIC_SUPABASE_URL ||
		!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
	) {
		return {};
	}
	try {
		const { data: row, error } = await createSupabasePublicClient()
			.from("Setting")
			.select("value")
			.eq("key", LEGAL_IDENTITY_SETTING_KEY)
			.maybeSingle();
		if (error) {
			console.error("Unable to load public legal identity setting", error);
			return {};
		}
		return row ? (JSON.parse(row.value) as Record<string, unknown>) : {};
	} catch (error) {
		console.error("Unable to load public legal identity setting", error);
		return {};
	}
}

async function readLegalIdentity(): Promise<LegalIdentity> {
	const row = await readRow();
	return mergeEffective(row);
}

/** Cached effective legal identity (per-request + 60s revalidate). */
export const getLegalIdentity = cache(
	unstable_cache(readLegalIdentity, ["site-legal-identity"], {
		revalidate: 60,
	}),
);

export function getDefaultLegalIdentity(): LegalIdentity {
	return { ...DEFAULT_LEGAL_IDENTITY };
}
