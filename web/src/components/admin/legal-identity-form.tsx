"use client";

import { Check, Loader2, Scale } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	useLegalIdentity,
	useUpdateLegalIdentity,
} from "@/hooks/api/legal-identity";
import { useToast } from "@/hooks/use-toast";
import {
	EMPTY_LEGAL_IDENTITY,
	type LegalIdentity,
} from "@/lib/types/legal-identity";

const FIELDS: Array<{
	key: keyof LegalIdentity;
	label: string;
	placeholder?: string;
	multiline?: boolean;
	hint?: string;
}> = [
	{
		key: "operatorName",
		label: "Raison sociale / nom de l'exploitant",
		placeholder: "Ex. Maison Titrit (ou nom légal exact)",
	},
	{
		key: "legalStatus",
		label: "Statut juridique",
		placeholder: "Ex. Auto-entrepreneur, SARL, personne physique…",
	},
	{
		key: "responsiblePublisher",
		label: "Responsable de la publication",
		placeholder: "Nom et qualité du directeur de publication",
	},
	{
		key: "address",
		label: "Adresse légale / commerciale",
		placeholder: "Adresse complète (plusieurs lignes possibles)",
		multiline: true,
	},
	{
		key: "email",
		label: "Email de contact",
		placeholder: "contact@exemple.ma",
	},
	{
		key: "phone",
		label: "Téléphone",
		placeholder: "+212 6 00 00 00 00",
	},
	{
		key: "rcRnae",
		label: "RC / RNAE",
		placeholder: "Numéro de registre (RC ou RNAE)",
		hint: "Uniquement si applicable et vérifié.",
	},
	{
		key: "ice",
		label: "ICE",
		placeholder: "Identifiant Commun de l'Entreprise",
	},
	{
		key: "taxIdIf",
		label: "IF (Identifiant fiscal)",
		placeholder: "Numéro IF",
	},
	{
		key: "patente",
		label: "Patente",
		placeholder: "Numéro de patente",
	},
	{
		key: "cndpDeclarationNumber",
		label: "N° de déclaration CNDP",
		placeholder: "Référence de déclaration (si applicable)",
	},
	{
		key: "dpoContact",
		label: "Contact DPO / protection des données",
		placeholder: "Email ou coordonnées du DPO/contact confidentialité",
	},
	{
		key: "hostName",
		label: "Hébergeur — nom",
		placeholder: "Ex. Vercel Inc.",
	},
	{
		key: "hostAddress",
		label: "Hébergeur — adresse",
		placeholder: "Adresse de l'hébergeur",
		multiline: true,
	},
	{
		key: "hostContact",
		label: "Hébergeur — contact",
		placeholder: "Site web, email ou téléphone de l'hébergeur",
	},
];

function toForm(value?: Partial<LegalIdentity> | null): LegalIdentity {
	return { ...EMPTY_LEGAL_IDENTITY, ...(value ?? {}) };
}

export function LegalIdentityForm() {
	const { toast } = useToast();
	const legal = useLegalIdentity();
	const update = useUpdateLegalIdentity();
	const [form, setForm] = React.useState<LegalIdentity>(EMPTY_LEGAL_IDENTITY);

	React.useEffect(() => {
		if (legal.data?.stored) {
			setForm(toForm(legal.data.stored));
		}
	}, [legal.data?.stored]);

	async function save(e: React.FormEvent) {
		e.preventDefault();
		try {
			await update.mutateAsync(form);
			toast({
				title: "Identité légale enregistrée",
				description:
					"Les informations vérifiées seront affichées sur le site (propagation ~60s).",
			});
		} catch {
			toast({ title: "Erreur", variant: "destructive" });
		}
	}

	function set<K extends keyof LegalIdentity>(key: K, value: string) {
		setForm((prev) => ({ ...prev, [key]: value }));
	}

	return (
		<form onSubmit={save} className="card-vintage rounded-sm p-6">
			<div className="flex items-center gap-3">
				<span className="inline-flex size-10 items-center justify-center rounded-full bg-bronze/15 text-ink">
					<Scale className="size-5" />
				</span>
				<div>
					<h2 className="heading-vintage">Identité légale & mentions</h2>
					<p className="label-vintage-sm">
						Informations vérifiées de l&apos;exploitant (éditeur/vendeur). Tous
						les champs sont facultatifs — seules les valeurs renseignées sont
						affichées publiquement.
					</p>
				</div>
			</div>

			<p className="mt-4 font-serif text-xs text-ink-soft/70 dark:text-cream/60">
				Ne saisissez que des informations exactes et vérifiées.
				L&apos;exploitant (propriétaire du site) est responsable de ces mentions
				; le développeur ne doit pas figurer comme
				commerçant/éditeur/responsable de traitement.
			</p>

			<div className="mt-6 grid gap-4 sm:grid-cols-2">
				{FIELDS.map((field) => {
					const id = `legal-${field.key}`;
					const span =
						field.multiline || field.key === "address" ? "sm:col-span-2" : "";
					return (
						<div key={field.key} className={span}>
							<Label htmlFor={id} className="label-vintage">
								{field.label}
							</Label>
							{field.multiline ? (
								<Textarea
									id={id}
									value={form[field.key]}
									onChange={(e) => set(field.key, e.target.value)}
									placeholder={field.placeholder}
									rows={3}
									className="mt-1.5 field-vintage"
								/>
							) : (
								<Input
									id={id}
									value={form[field.key]}
									onChange={(e) => set(field.key, e.target.value)}
									placeholder={field.placeholder}
									className="mt-1.5 field-vintage"
								/>
							)}
							{field.hint ? (
								<p className="mt-1 font-serif text-[0.68rem] text-ink-soft/60 dark:text-cream/50">
									{field.hint}
								</p>
							) : null}
						</div>
					);
				})}
			</div>

			<div className="mt-6 flex items-center gap-3">
				<Button
					type="submit"
					disabled={update.isPending || legal.isLoading}
					className="h-10 rounded-full bg-ink font-label text-[0.68rem] uppercase tracking-[0.16em] text-cream hover:bg-terracotta dark:bg-cream dark:text-ink"
				>
					{update.isPending ? (
						<Loader2 className="size-4 animate-spin" />
					) : (
						<Check className="size-4" />
					)}
					Enregistrer l&apos;identité légale
				</Button>
				{legal.isLoading ? (
					<span className="font-serif text-xs text-ink-soft/60 dark:text-cream/50">
						Chargement…
					</span>
				) : null}
			</div>
		</form>
	);
}
