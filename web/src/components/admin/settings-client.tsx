"use client";

import { Check, Clock, Loader2, Megaphone } from "lucide-react";
import * as React from "react";
import { IntegrationsForm } from "@/components/admin/integrations-form";
import { LegalIdentityForm } from "@/components/admin/legal-identity-form";
import { AmazighStar } from "@/components/maison/motifs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	useAnnouncement,
	useUpdateAnnouncement,
} from "@/hooks/api/announcement";
import { useToast } from "@/hooks/use-toast";
import { DAYS } from "@/lib/types/constants";

export function SettingsClient() {
	const { toast } = useToast();
	const announcement = useAnnouncement();
	const updateAnnouncement = useUpdateAnnouncement();
	const [ann, setAnn] = React.useState({
		active: false,
		message: "",
		link: "",
	});
	const [saving, setSaving] = React.useState<"ann" | null>(null);

	React.useEffect(() => {
		if (announcement.data?.bar) {
			setAnn(announcement.data.bar);
		}
	}, [announcement.data]);

	async function saveAnnouncement(e: React.FormEvent) {
		e.preventDefault();
		setSaving("ann");
		try {
			await updateAnnouncement.mutateAsync(ann);
			toast({ title: "Annonce enregistrée" });
		} catch {
			toast({ title: "Erreur", variant: "destructive" });
		} finally {
			setSaving(null);
		}
	}

	return (
		<div className="space-y-8">
			<div>
				<h1 className="heading-vintage-lg">Réglages</h1>
				<p className="mt-1 body-vintage">
					Barre d&apos;annonce, horaires, et intégrations.
				</p>
			</div>

			{/* Legal identity & mentions */}
			<LegalIdentityForm />

			{/* Announcement bar */}
			<form onSubmit={saveAnnouncement} className="card-vintage rounded-sm p-6">
				<div className="flex items-center gap-3">
					<span className="inline-flex size-10 items-center justify-center rounded-full bg-bronze/15 text-ink">
						<Megaphone className="size-5" />
					</span>
					<div>
						<h2 className="heading-vintage">Barre d&apos;annonce</h2>
						<p className="label-vintage-sm">
							Affiche un message en haut du site (dissmissible).
						</p>
					</div>
				</div>
				<div className="mt-5 space-y-4">
					<label className="inline-flex items-center gap-2 body-vintage-muted">
						<input
							type="checkbox"
							checked={ann.active}
							onChange={(e) => setAnn({ ...ann, active: e.target.checked })}
							className="size-4 accent-terracotta"
						/>
						Active
					</label>
					<div>
						<Label htmlFor="ann-message" className="label-vintage">
							Message
						</Label>
						<Textarea
							id="ann-message"
							value={ann.message}
							onChange={(e) => setAnn({ ...ann, message: e.target.value })}
							rows={2}
							maxLength={200}
							placeholder="Livraison gratuite à Casablanca ce week-end !"
							className="mt-1.5 field-vintage"
						/>
					</div>
					<div>
						<Label htmlFor="ann-link" className="label-vintage">
							Lien (optionnel)
						</Label>
						<Input
							id="ann-link"
							value={ann.link}
							onChange={(e) => setAnn({ ...ann, link: e.target.value })}
							placeholder="/#collection ou https://…"
							className="mt-1.5 field-vintage"
						/>
					</div>
					<Button
						type="submit"
						disabled={saving === "ann"}
						className="h-10 rounded-full bg-ink font-label text-[0.68rem] uppercase tracking-[0.16em] text-cream hover:bg-terracotta dark:bg-cream dark:text-ink"
					>
						{saving === "ann" ? (
							<Loader2 className="size-4 animate-spin" />
						) : (
							<Check className="size-4" />
						)}
						Enregistrer
					</Button>
				</div>
			</form>

			{/* Store hours (read-only display for now; editing arrives in a later pass) */}
			<div className="card-vintage rounded-sm p-6">
				<div className="flex items-center gap-3">
					<span className="inline-flex size-10 items-center justify-center rounded-full bg-bronze/15 text-ink">
						<Clock className="size-5" />
					</span>
					<div>
						<h2 className="heading-vintage">Horaires</h2>
						<p className="label-vintage-sm">Atelier de Bouskoura</p>
					</div>
				</div>
				<ul className="mt-5 space-y-2">
					{DAYS.map((d) => (
						<li
							key={d.key}
							className="flex items-center justify-between border-b border-bronze/15 pb-2 font-serif text-sm"
						>
							<span className="text-ink-soft dark:text-cream/80">
								{d.label}
							</span>
							<span
								className={
									d.key === "sun"
										? "text-ink"
										: "text-ink dark:text-cream"
								}
							>
								{d.key === "sun"
									? "Fermé"
									: d.key === "sat"
										? "10:00 — 21:00"
										: "10:00 — 20:00"}
							</span>
						</li>
					))}
				</ul>
				<p className="mt-4 font-serif text-xs text-ink-soft/70 dark:text-cream/60">
					L&apos;édition des horaires arrive dans une prochaine itération.
				</p>
			</div>

			{/* Integrations: trackers + domain verification */}
			<IntegrationsForm mode="full" />

			{/* SEO files */}
			<div className="card-vintage rounded-sm p-6">
				<div className="flex items-center gap-3">
					<span className="inline-flex size-10 items-center justify-center rounded-full bg-bronze/15 text-ink">
						<AmazighStar className="size-5" strokeWidth={1.5} />
					</span>
					<div>
						<h2 className="heading-vintage">Fichiers SEO</h2>
						<p className="label-vintage-sm">Auto-générés</p>
					</div>
				</div>
				<ul className="mt-5 space-y-2 font-serif text-sm">
					<li className="flex items-center justify-between">
						<span>robots.txt</span>
						<a
							href="/robots.txt"
							target="_blank"
							className="text-ink hover:text-ink"
							rel="noopener"
						>
							/robots.txt
						</a>
					</li>
					<li className="flex items-center justify-between">
						<span>sitemap.xml</span>
						<a
							href="/sitemap.xml"
							target="_blank"
							className="text-ink hover:text-ink"
							rel="noopener"
						>
							/sitemap.xml
						</a>
					</li>
					<li className="flex items-center justify-between">
						<span>Google Merchant feed</span>
						<a
							href="/feed.xml"
							target="_blank"
							className="text-ink hover:text-ink"
							rel="noopener"
						>
							/feed.xml
						</a>
					</li>
					<li className="flex items-center justify-between">
						<span>LLMs.md</span>
						<a
							href="/LLMs.md"
							target="_blank"
							className="text-ink hover:text-ink"
							rel="noopener"
						>
							/LLMs.md
						</a>
					</li>
					<li className="flex items-center justify-between">
						<span>humans.txt</span>
						<a
							href="/humans.txt"
							target="_blank"
							className="text-ink hover:text-ink"
							rel="noopener"
						>
							/humans.txt
						</a>
					</li>
				</ul>
			</div>
		</div>
	);
}
