"use client";

import { Activity, Check, Loader2 } from "lucide-react";
import * as React from "react";
import { IntegrationsVerification } from "@/components/admin/integrations-verification";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	useIntegrations,
	useUpdateIntegrations,
} from "@/hooks/api/integrations";
import { useToast } from "@/hooks/use-toast";
import { EMPTY_ANALYTICS, EMPTY_VERIFICATION } from "@/lib/types/constants";
import type {
	AnalyticsConfig,
	VerificationConfig,
} from "@/lib/types/integrations";

/**
 * Trackers + domain-verification integrations editor.
 * mode "trackers" — tags only (MARKETER, /makteb/tags): saves the analytics
 *   key alone; verification inputs are hidden and never sent.
 * mode "full"     — owners (Réglages): trackers + domain verifications.
 */
export function IntegrationsForm({ mode }: { mode: "full" | "trackers" }) {
	const { toast } = useToast();
	const integrations = useIntegrations();
	const updateIntegrations = useUpdateIntegrations();
	const [ints, setInts] = React.useState({
		analytics: EMPTY_ANALYTICS,
		verification: EMPTY_VERIFICATION,
	});
	const [savedIds, setSavedIds] = React.useState<string[]>([]);
	const [saving, setSaving] = React.useState(false);
	const full = mode === "full";

	React.useEffect(() => {
		const stored = integrations.data;
		if (!stored) return;
		const storedA = (stored.analyticsValue ?? {}) as AnalyticsConfig;
		const customTags: { name: string; content: string }[] = (stored
			.verificationValue?.custom ?? []) as {
			name: string;
			content: string;
		}[];
		setInts((prev) => {
			const effectiveA = (
				stored.effective as {
					analytics?: AnalyticsConfig;
				}
			)?.analytics;
			return {
				analytics: {
					gtmId: storedA.gtmId ?? effectiveA?.gtmId ?? "",
					ga4Id: storedA.ga4Id ?? effectiveA?.ga4Id ?? "",
					fbPixelId: storedA.fbPixelId ?? effectiveA?.fbPixelId ?? "",
					pinterestTagId:
						storedA.pinterestTagId ?? effectiveA?.pinterestTagId ?? "",
					tiktokPixelId:
						storedA.tiktokPixelId ?? effectiveA?.tiktokPixelId ?? "",
					youtubeChannelId:
						storedA.youtubeChannelId ?? effectiveA?.youtubeChannelId ?? "",
				},
				verification: full
					? {
							google:
								(stored.verificationValue as VerificationConfig | undefined)
									?.google ?? "",
							facebook:
								(stored.verificationValue as VerificationConfig | undefined)
									?.facebook ?? "",
							instagram:
								(stored.verificationValue as VerificationConfig | undefined)
									?.instagram ?? "",
							tiktok:
								(stored.verificationValue as VerificationConfig | undefined)
									?.tiktok ?? "",
							customText: customTags
								.map((m) => `<meta name="${m.name}" content="${m.content}" />`)
								.join("\n"),
						}
					: prev.verification,
			};
		});
		const effective =
			(
				stored.effective as {
					analytics?: Record<string, unknown>;
				}
			)?.analytics ?? {};
		setSavedIds(
			Object.values(effective).filter(
				(v) => typeof v === "string" && v,
			) as string[],
		);
	}, [integrations.data, full]);

	async function saveIntegrations(e: React.FormEvent) {
		e.preventDefault();
		setSaving(true);
		try {
			await updateIntegrations.mutateAsync({
				analytics: full ? ints.analytics : null,
				verification: full
					? {
							google: ints.verification.google,
							facebook: ints.verification.facebook,
							instagram: ints.verification.instagram,
							tiktok: ints.verification.tiktok,
							custom: ints.verification.customText, // raw paste, sanitized server-side
						}
					: null,
			});
			toast({
				title: full
					? "Intégrations enregistrées — actives dans ~60s sur tout le site."
					: "Tags enregistrés — actifs dans ~60s sur tout le site.",
			});
		} catch {
			toast({ title: "Erreur", variant: "destructive" });
		} finally {
			setSaving(false);
		}
	}

	return (
		<form
			onSubmit={saveIntegrations}
			className="card-vintage rounded-sm p-6 space-y-8"
		>
			<div className="flex items-center gap-3">
				<span className="inline-flex size-10 items-center justify-center rounded-full bg-bronze/15 text-ink">
					<Activity className="size-5" />
				</span>
				<div>
					<h2 className="heading-vintage">Trackers &amp; mesure</h2>
					<p className="label-vintage-sm">
						Actifs seulement si le visiteur accepte les cookies correspondants.
					</p>
				</div>
			</div>

			{savedIds.length > 0 && (
				<p className="font-serif text-xs text-ink-soft/75 dark:text-cream/60">
					IDs effectifs : {savedIds.join(" · ")}
				</p>
			)}

			<div className="grid gap-4 sm:grid-cols-3">
				<div>
					<Label htmlFor="int-gtm" className="label-vintage">
						Google Tag Manager
					</Label>
					<Input
						id="int-gtm"
						value={ints.analytics.gtmId}
						onChange={(e) =>
							setInts({
								...ints,
								analytics: { ...ints.analytics, gtmId: e.target.value },
							})
						}
						placeholder="GTM-XXXXXXX"
						className="mt-1.5 field-vintage"
					/>
				</div>
				<div>
					<Label htmlFor="int-ga4" className="label-vintage">
						Google Analytics 4
					</Label>
					<Input
						id="int-ga4"
						value={ints.analytics.ga4Id}
						onChange={(e) =>
							setInts({
								...ints,
								analytics: { ...ints.analytics, ga4Id: e.target.value },
							})
						}
						placeholder="G-XXXXXXXXXX"
						className="mt-1.5 field-vintage"
					/>
				</div>
				<div>
					<Label htmlFor="int-fb" className="label-vintage">
						Pixel Facebook
					</Label>
					<Input
						id="int-fb"
						value={ints.analytics.fbPixelId}
						onChange={(e) =>
							setInts({
								...ints,
								analytics: { ...ints.analytics, fbPixelId: e.target.value },
							})
						}
						placeholder="123456789012345"
						className="mt-1.5 field-vintage"
					/>
				</div>
			</div>

			<div className="grid gap-4 sm:grid-cols-3">
				<div>
					<Label className="label-vintage">Pinterest Tag</Label>
					<Input
						value={ints.analytics.pinterestTagId}
						onChange={(e) =>
							setInts({
								...ints,
								analytics: {
									...ints.analytics,
									pinterestTagId: e.target.value,
								},
							})
						}
						placeholder="1234567890123"
						className="mt-1.5 field-vintage"
					/>
				</div>
				<div>
					<Label className="label-vintage">Pixel TikTok</Label>
					<Input
						value={ints.analytics.tiktokPixelId}
						onChange={(e) =>
							setInts({
								...ints,
								analytics: { ...ints.analytics, tiktokPixelId: e.target.value },
							})
						}
						placeholder="1234567890"
						className="mt-1.5 field-vintage"
					/>
				</div>
				<div>
					<Label className="label-vintage">YouTube channel</Label>
					<Input
						value={ints.analytics.youtubeChannelId}
						onChange={(e) =>
							setInts({
								...ints,
								analytics: {
									...ints.analytics,
									youtubeChannelId: e.target.value,
								},
							})
						}
						placeholder="@maison__titrit"
						className="mt-1.5 field-vintage"
					/>
				</div>
			</div>

			{full && (
				<IntegrationsVerification
					verification={ints.verification}
					onChange={(next) =>
						setInts((prev) => ({
							...prev,
							verification: next(prev.verification),
						}))
					}
				/>
			)}

			<Button
				type="submit"
				disabled={saving}
				className="h-10 rounded-full bg-ink font-label text-[0.68rem] uppercase tracking-[0.16em] text-cream hover:bg-terracotta dark:bg-cream dark:text-ink"
			>
				{saving ? (
					<Loader2 className="size-4 animate-spin" />
				) : (
					<Check className="size-4" />
				)}
				{full ? "Enregistrer les intégrations" : "Enregistrer les tags"}
			</Button>
		</form>
	);
}
