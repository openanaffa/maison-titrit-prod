"use client";

import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { CategoryIcon } from "@/components/maison/category-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	useCreateCategory,
	useDeleteCategory,
	useUpdateCategory,
} from "@/hooks/api/categories";
import { useToast } from "@/hooks/use-toast";
import { useT } from "@/i18n/locale-provider";
import type { Category } from "@/lib/types";

export function CategoriesClient({ initial }: { initial: Category[] }) {
	const { t } = useT();
	const router = useRouter();
	const { toast } = useToast();
	const createCategory = useCreateCategory();
	const updateCategory = useUpdateCategory();
	const deleteCategory = useDeleteCategory();
	const [cats, setCats] = React.useState(initial);
	const [name, setName] = React.useState("");
	const [saving, setSaving] = React.useState(false);
	const [editingId, setEditingId] = React.useState<string | null>(null);
	const [editName, setEditName] = React.useState("");
	const [editSaving, setEditSaving] = React.useState<string | null>(null);

	async function onAdd(e: React.FormEvent) {
		e.preventDefault();
		if (!name.trim()) return;
		setSaving(true);
		try {
			await createCategory.mutateAsync({ name });
			setName("");
			toast({ title: "Catégorie ajoutée" });
			router.refresh();
		} catch {
			toast({ title: "Erreur", variant: "destructive" });
		} finally {
			setSaving(false);
		}
	}

	async function beginEdit(c: Category) {
		setEditingId(c.id);
		setEditName(c.name);
	}

	async function cancelEdit() {
		setEditingId(null);
		setEditName("");
	}

	async function saveEdit(id: string) {
		const n = editName.trim();
		if (!n) return;
		setEditSaving(id);
		try {
			await updateCategory.mutateAsync({ id, body: { name: n } });
			setCats((prev) => prev.map((c) => (c.id === id ? { ...c, name: n } : c)));
			setEditingId(null);
			setEditName("");
			toast({ title: "Catégorie modifiée" });
		} catch {
			toast({ title: "Erreur", variant: "destructive" });
			setEditingId(null);
			setEditName("");
		} finally {
			setEditSaving(null);
		}
	}

	async function onDelete(id: string, n: string) {
		if (!confirm(`Supprimer « ${n} » ?`)) return;
		try {
			await deleteCategory.mutateAsync(id);
			setCats((prev) => prev.filter((c) => c.id !== id));
			toast({ title: "Supprimée" });
		} catch {
			toast({ title: "Erreur", variant: "destructive" });
		}
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="heading-vintage-lg">{t("admin.categories.title")}</h1>
				<p className="mt-1 body-vintage">{t("admin.categories.subtitle")}</p>
			</div>

			<form onSubmit={onAdd} className="flex items-end gap-3">
				<div className="flex-1 max-w-xs">
					<label htmlFor="category-name" className="label-vintage">
						{t("admin.categories.name")}
					</label>
					<Input
						id="category-name"
						value={name}
						onChange={(e) => setName(e.target.value)}
						className="mt-1.5 field-vintage"
						placeholder="Robes"
					/>
				</div>
				<Button
					type="submit"
					disabled={saving}
					className="rounded-full bg-ink font-label text-[0.72rem] uppercase tracking-[0.16em] text-cream hover:bg-terracotta"
				>
					{saving ? (
						<Loader2 className="size-4 animate-spin" />
					) : (
						<Plus className="size-4" />
					)}
					{t("admin.categories.new")}
				</Button>
			</form>

			<div className="card-vintage overflow-hidden rounded-sm">
				<ul className="divide-y divide-bronze/15">
					{cats.length === 0 && (
						<li className="p-6 body-vintage-muted">Aucune catégorie.</li>
					)}
					{cats.map((c) => {
						const isEditing = editingId === c.id;
						return (
							<li key={c.id} className="flex items-center justify-between p-4">
								<div className="flex items-center gap-3">
									<span className="inline-flex size-9 items-center justify-center rounded-full bg-bronze/15 text-ink">
										<CategoryIcon slug={c.slug} className="size-5" />
									</span>
									<div>
										{isEditing ? (
											<div className="flex items-center gap-2">
												<Input
													value={editName}
													onChange={(e) => setEditName(e.target.value)}
													autoFocus
													className="field-vintage text-sm font-display"
													onKeyDown={(e) => {
														if (e.key === "Enter") saveEdit(c.id);
														if (e.key === "Escape") cancelEdit();
													}}
												/>
												<Button
													size="icon"
													className="size-8"
													disabled={editSaving === c.id}
													onClick={() => saveEdit(c.id)}
												>
													{editSaving === c.id ? (
														<Loader2 className="size-3 animate-spin" />
													) : (
														<Pencil className="size-3" />
													)}
												</Button>
												<Button
													variant="ghost"
													size="icon"
													className="size-8 text-ink hover:bg-bronze/10"
													onClick={cancelEdit}
												>
													<Trash2 className="size-3" />
												</Button>
											</div>
										) : (
											<>
												<p className="heading-vintage-sm">{c.name}</p>
												<p className="label-vintage-sm">
													/{c.slug} · {c.count} produit(s)
												</p>
											</>
										)}
									</div>
								</div>
								<div className="flex items-center gap-1.5">
									<Button
										variant="ghost"
										size="icon"
										className="size-8 text-ink hover:bg-bronze/10"
										onClick={() => beginEdit(c)}
									>
										<Pencil className="size-3.5" />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										className="size-8 text-ink hover:bg-terracotta/10"
										onClick={() => onDelete(c.id, c.name)}
									>
										<Trash2 className="size-3.5" />
									</Button>
								</div>
							</li>
						);
					})}
				</ul>
			</div>
		</div>
	);
}
