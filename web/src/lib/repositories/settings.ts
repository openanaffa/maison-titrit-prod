import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { VerificationConfig } from "@/lib/types/integrations";

/**
 * Settings repository — port for key/value settings (announcement bar,
 * analytics trackers, domain verifications).
 *
 * Exported as named async functions so they can be imported by route handlers
 * without tripping Next.js server-actions validation on non-function exports.
 */

/** Get the announcement bar. */
export async function getAnnouncement(
	supabase: SupabaseClient<Database>,
): Promise<{ active: boolean; message: string; link: string }> {
	const { data } = await supabase
		.from("Setting")
		.select("value")
		.eq("key", "announcement")
		.maybeSingle();
	if (!data) {
		return { active: false, message: "", link: "" };
	}
	try {
		const bar = JSON.parse(data.value) as Record<string, unknown>;
		return {
			active: !!bar.active,
			message: String(bar.message ?? ""),
			link: String(bar.link ?? ""),
		};
	} catch {
		return { active: false, message: "", link: "" };
	}
}

/** Upsert the announcement bar. */
export async function setAnnouncement(
	supabase: SupabaseClient<Database>,
	bar: { active: boolean; message: string; link: string },
) {
	const { error } = await supabase.from("Setting").upsert(
		{
			key: "announcement",
			value: JSON.stringify(bar),
			updatedAt: new Date().toISOString(),
		},
		{ onConflict: "key" },
	);
	if (error) throw error;
}

/** Get the stored analytics + verification settings (unsanitized). */
export async function getIntegrationsRaw(
	supabase: SupabaseClient<Database>,
): Promise<{
	analytics: Record<string, unknown>;
	verification: VerificationConfig;
}> {
	const { data: settings } = await supabase
		.from("Setting")
		.select("key,value")
		.in("key", ["integration.analytics", "integration.verification"])
		.throwOnError();
	const analyticsRow = settings?.find((s) => s.key === "integration.analytics");
	const verificationRow = settings?.find(
		(s) => s.key === "integration.verification",
	);
	return {
		analytics: analyticsRow
			? (JSON.parse(analyticsRow.value) as Record<string, unknown>)
			: {},
		verification: verificationRow
			? (JSON.parse(verificationRow.value) as VerificationConfig)
			: { google: "", facebook: "", instagram: "", tiktok: "", custom: [] },
	};
}

/** Upsert or delete analytics + verification settings. */
export async function setIntegrations(
	supabase: SupabaseClient<Database>,
	input: {
		analytics?: Record<string, unknown> | null;
		verification?: VerificationConfig | null;
	},
) {
	if (input.analytics !== undefined) {
		if (input.analytics && Object.keys(input.analytics).length) {
			const { error } = await supabase.from("Setting").upsert(
				{
					key: "integration.analytics",
					value: JSON.stringify(input.analytics),
					updatedAt: new Date().toISOString(),
				},
				{ onConflict: "key" },
			);
			if (error) throw error;
		} else {
			const { error } = await supabase
				.from("Setting")
				.delete()
				.eq("key", "integration.analytics");
			if (error) throw error;
		}
	}
	if (input.verification !== undefined) {
		if (
			input.verification &&
			(Object.keys(input.verification).some((k) => k !== "custom") ||
				input.verification.custom.length)
		) {
			const { error } = await supabase.from("Setting").upsert(
				{
					key: "integration.verification",
					value: JSON.stringify(input.verification),
					updatedAt: new Date().toISOString(),
				},
				{ onConflict: "key" },
			);
			if (error) throw error;
		} else {
			const { error } = await supabase
				.from("Setting")
				.delete()
				.eq("key", "integration.verification");
			if (error) throw error;
		}
	}
}
