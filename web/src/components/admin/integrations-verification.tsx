"use client";

import { ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { VERIFICATION_HINTS } from "@/lib/types/constants";

export type VerificationFormValues = {
	google: string;
	facebook: string;
	instagram: string;
	tiktok: string;
	customText: string;
};

export type IntegrationsVerificationProps = {
	verification: VerificationFormValues;
	onChange: (
		next: (current: VerificationFormValues) => VerificationFormValues,
	) => void;
};

/**
 * Domain verification inputs — extracted from IntegrationsForm. Only rendered
 * in "full" (owner) mode. Lets the founder paste platform verification codes.
 */
export function IntegrationsVerification({
	verification,
	onChange,
}: IntegrationsVerificationProps) {
	function set<K extends keyof VerificationFormValues>(k: K, v: string) {
		onChange((current) => ({ ...current, [k]: v }));
	}

	return (
		<>
			{/* Domain verification */}
			<div className="flex items-center gap-3 pt-2">
				<span className="inline-flex size-10 items-center justify-center rounded-full bg-bronze/15 text-ink">
					<ShieldCheck className="size-5" />
				</span>
				<div>
					<h2 className="heading-vintage">Vérification du domaine</h2>
					<p className="label-vintage-sm">
						Collez le code fourni par chaque plateforme.
					</p>
				</div>
			</div>
			<div className="grid gap-4 sm:grid-cols-2">
				{VERIFICATION_HINTS.map((h) => (
					<div key={h.key}>
						<Label htmlFor={`int-${h.key}`} className="label-vintage">
							{h.label}
						</Label>
						<Input
							id={`int-${h.key}`}
							value={verification[h.key as keyof typeof verification]}
							onChange={(e) =>
								set(h.key as keyof typeof verification, e.target.value)
							}
							placeholder={h.meta}
							className="mt-1.5 field-vintage font-mono text-[0.72rem]"
						/>
						<p className="mt-1 font-serif text-[0.68rem] text-ink-soft/60 dark:text-cream/50">
							&lt;meta name=&quot;{h.meta}&quot; /&gt; — collez le contenu (ou
							la balise entière, on extrait le code).
						</p>
					</div>
				))}
			</div>

			<div>
				<Label htmlFor="int-custom" className="label-vintage">
					Autres balises de vérification (Pinterest, Bing, Clarity…)
				</Label>
				<Textarea
					id="int-custom"
					value={verification.customText}
					onChange={(e) => set("customText", e.target.value)}
					rows={3}
					placeholder={
						'<meta name="p:domain_verify" content="abcdef123456789" />'
					}
					className="mt-1.5 field-vintage font-mono text-[0.72rem]"
				/>
				<p className="mt-1 font-serif text-[0.68rem] text-ink-soft/60 dark:text-cream/50">
					Une balise par ligne — seul le couple nom/contenu est extrait
					(l&apos;HTML brut n&apos;est jamais stocké).
				</p>
			</div>
		</>
	);
}
