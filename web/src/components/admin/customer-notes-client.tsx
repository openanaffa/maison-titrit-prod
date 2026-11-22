"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { useToast } from "@/hooks/use-toast";
import { useT } from "@/i18n/locale-provider";
import { apiFetch } from "@/lib/react-query/fetch";
import type { CustomerNoteRow } from "@/lib/repositories/customers";

export function CustomerNotesClient({
	customerId,
	notes,
}: {
	customerId: string;
	notes: CustomerNoteRow[];
}) {
	const { t } = useT();
	const router = useRouter();
	const { toast } = useToast();
	const [pending, setPending] = React.useState(false);
	const [draft, setDraft] = React.useState("");

	async function addNote(e: React.FormEvent) {
		e.preventDefault();
		if (!draft.trim()) return;
		setPending(true);
		try {
			await apiFetch(`/api/admin/customers/${customerId}/notes`, {
				method: "POST",
				body: JSON.stringify({ body: draft }),
			});
			setDraft("");
			router.refresh();
		} catch {
			toast({ title: t("admin.customers.error"), variant: "destructive" });
		} finally {
			setPending(false);
		}
	}

	async function removeNote(noteId: string) {
		setPending(true);
		try {
			await apiFetch(`/api/admin/customers/${customerId}/notes/${noteId}`, {
				method: "DELETE",
			});
			router.refresh();
		} catch {
			toast({ title: t("admin.customers.error"), variant: "destructive" });
		} finally {
			setPending(false);
		}
	}

	async function setConsent(consent: string | null) {
		setPending(true);
		try {
			await apiFetch(`/api/admin/customers/${customerId}/consent`, {
				method: "POST",
				body: JSON.stringify({ consent }),
			});
			toast({ title: t("admin.customers.consentSaved") });
			router.refresh();
		} catch {
			toast({ title: t("admin.customers.error"), variant: "destructive" });
		} finally {
			setPending(false);
		}
	}

	return (
		<div className="pt-2">
			<p className="label-vintage-tight mb-2">{t("admin.customers.notes")}</p>
			<ul className="mb-3 space-y-2">
				{notes.length === 0 ? (
					<li className="body-vintage-muted">{t("admin.customers.noNotes")}</li>
				) : (
					notes.map((n) => (
						<li key={n.id} className="flex flex-wrap items-start gap-2">
							<p className="flex-1 body-vintage-sm">
								{n.body}
								<span className="ml-2 label-vintage-sm text-ink-soft dark:text-cream/60">
									— {n.authorName} ·{" "}
									{new Date(n.createdAt).toLocaleString("fr-FR")}
								</span>
							</p>
							<button
								type="button"
								onClick={() => removeNote(n.id)}
								disabled={pending}
								className="rounded border border-bronze/45 px-2 py-1 font-label text-[0.6rem] uppercase tracking-[0.12em] text-ink-soft hover:bg-bronze/10 disabled:opacity-50 dark:text-cream/70"
							>
								{t("admin.customers.removeNote")}
							</button>
						</li>
					))
				)}
			</ul>
			<form onSubmit={addNote} className="flex flex-wrap items-center gap-2">
				<input
					type="text"
					value={draft}
					onChange={(e) => setDraft(e.target.value)}
					placeholder={t("admin.customers.notePlaceholder")}
					className="flex-1 rounded border border-bronze/45 bg-transparent px-2 py-1.5 text-sm text-ink dark:text-cream"
				/>
				<button
					type="submit"
					disabled={pending || !draft.trim()}
					className="rounded bg-bronze px-3 py-1.5 font-label text-[0.62rem] uppercase tracking-[0.14em] text-cream hover:bg-terracotta disabled:opacity-50"
				>
					{t("admin.customers.addNote")}
				</button>
			</form>
			<div className="mt-3 flex flex-wrap items-center gap-2">
				<p className="label-vintage-tight">
					{t("admin.customers.consentLabel")}
				</p>
				<button
					type="button"
					onClick={() => setConsent("OPTED_IN")}
					disabled={pending}
					className="rounded border border-olive/60 px-2 py-1 font-label text-[0.6rem] uppercase tracking-[0.12em] text-olive hover:bg-olive/10 disabled:opacity-50"
				>
					{t("admin.customers.consentIn")}
				</button>
				<button
					type="button"
					onClick={() => setConsent("OPTED_OUT")}
					disabled={pending}
					className="rounded border border-terracotta/60 px-2 py-1 font-label text-[0.6rem] uppercase tracking-[0.12em] text-ink hover:bg-terracotta/10 disabled:opacity-50"
				>
					{t("admin.customers.consentOut")}
				</button>
				<button
					type="button"
					onClick={() => setConsent(null)}
					disabled={pending}
					className="rounded border border-bronze/45 px-2 py-1 font-label text-[0.6rem] uppercase tracking-[0.12em] text-ink-soft hover:bg-bronze/10 disabled:opacity-50 dark:text-cream/70"
				>
					{t("admin.customers.consentUnknown")}
				</button>
			</div>
		</div>
	);
}
