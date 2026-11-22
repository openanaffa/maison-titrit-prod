"use client";

import { Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { useDeleteArticle, useUpdateArticle } from "@/hooks/api/articles";
import { useToast } from "@/hooks/use-toast";
import { useT } from "@/i18n/locale-provider";
import type { ArticleTableRow } from "@/lib/types";

export function ArticlesTableClient({ rows }: { rows: ArticleTableRow[] }) {
	const { t } = useT();
	const router = useRouter();
	const { toast } = useToast();
	const deleteArticle = useDeleteArticle();
	const updateArticle = useUpdateArticle();

	async function onDelete(row: ArticleTableRow) {
		if (!confirm(`Supprimer « ${row.title} » ?`)) return;
		try {
			await deleteArticle.mutateAsync(row.id);
			toast({ title: "Supprimé" });
			router.refresh();
		} catch {
			toast({ title: "Erreur", variant: "destructive" });
		}
	}

	async function togglePublish(row: ArticleTableRow) {
		try {
			await updateArticle.mutateAsync({
				id: row.id,
				body: { published: !row.published },
			});
			toast({ title: row.published ? "Dépublié" : "Publié" });
			router.refresh();
		} catch {
			toast({ title: "Erreur", variant: "destructive" });
		}
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-end justify-between gap-3">
				<div>
					<h1 className="heading-vintage-lg">Journal</h1>
					<p className="mt-1 body-vintage">
						Articles pour la portée et le SEO.
					</p>
				</div>
				<Button
					asChild
					className="rounded-full bg-ink font-label text-[0.72rem] uppercase tracking-[0.16em] text-cream hover:bg-terracotta dark:bg-cream dark:text-ink"
				>
					<Link href="/makteb/blog/new">
						<Plus className="size-4" />
						Nouvel article
					</Link>
				</Button>
			</div>

			<div className="card-vintage overflow-hidden rounded-sm">
				<ul className="divide-y divide-bronze/15">
					{rows.length === 0 && (
						<li className="p-8 text-center body-vintage-muted">
							Aucun article. Créez le premier.
						</li>
					)}
					{rows.map((a) => (
						<li key={a.id} className="flex items-center justify-between p-4">
							<div className="min-w-0">
								<p className="truncate heading-vintage-sm">
									{a.published ? null : (
										<EyeOff className="me-1 inline size-3.5 text-ink-soft/50" />
									)}
									{a.title}
								</p>
								<p className="label-vintage-sm">
									/blog/{a.slug} ·{" "}
									{a.publishedAt
										? new Date(a.publishedAt).toLocaleDateString("fr-FR")
										: "brouillon"}
								</p>
							</div>
							<div className="flex items-center gap-1">
								<Button asChild variant="ghost" size="icon" className="size-8">
									<Link
										href={`/blog/${a.slug}`}
										target="_blank"
										aria-label="Voir"
									>
										<Eye className="size-3.5" />
									</Link>
								</Button>
								<Button
									variant="ghost"
									size="icon"
									className="size-8"
									onClick={() => togglePublish(a)}
									aria-label="Publier"
								>
									{a.published ? (
										<Eye className="size-3.5 text-emerald-600" />
									) : (
										<EyeOff className="size-3.5" />
									)}
								</Button>
								<Button asChild variant="ghost" size="icon" className="size-8">
									<Link href={`/makteb/blog/${a.id}`} aria-label="Modifier">
										<Pencil className="size-3.5" />
									</Link>
								</Button>
								<Button
									variant="ghost"
									size="icon"
									className="size-8 text-ink hover:bg-terracotta/10"
									onClick={() => onDelete(a)}
									aria-label="Supprimer"
								>
									<Trash2 className="size-3.5" />
								</Button>
							</div>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}
