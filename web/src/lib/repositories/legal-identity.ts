import type { SupabaseClient } from "@supabase/supabase-js";
import { sanitizeLegalIdentity } from "@/lib/legal-identity";
import type { Database } from "@/lib/supabase/database.types";
import {
	LEGAL_IDENTITY_SETTING_KEY,
	type LegalIdentity,
} from "@/lib/types/legal-identity";

/** Read stored legal identity override (unsanitized). */
export async function getLegalIdentityRaw(
	supabase: SupabaseClient<Database>,
): Promise<Record<string, unknown>> {
	const { data } = await supabase
		.from("Setting")
		.select("value")
		.eq("key", LEGAL_IDENTITY_SETTING_KEY)
		.maybeSingle();
	if (!data) return {};
	try {
		return JSON.parse(data.value) as Record<string, unknown>;
	} catch {
		return {};
	}
}

/** Upsert or delete the legal identity override. */
export async function setLegalIdentity(
	supabase: SupabaseClient<Database>,
	input: LegalIdentity | null,
) {
	const sanitized = input ? sanitizeLegalIdentity(input) : null;
	const hasAny = sanitized
		? Object.values(sanitized).some((v) => v.trim().length > 0)
		: false;
	if (!sanitized || !hasAny) {
		const { error } = await supabase
			.from("Setting")
			.delete()
			.eq("key", LEGAL_IDENTITY_SETTING_KEY);
		if (error) throw error;
		return sanitizeLegalIdentity({});
	}
	const { error } = await supabase.from("Setting").upsert(
		{
			key: LEGAL_IDENTITY_SETTING_KEY,
			value: JSON.stringify(sanitized),
			updatedAt: new Date().toISOString(),
		},
		{ onConflict: "key" },
	);
	if (error) throw error;
	return sanitized;
}
