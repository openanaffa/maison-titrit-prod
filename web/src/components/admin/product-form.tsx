"use client";

import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { ProductImageGallery } from "@/components/admin/product-image-gallery";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	useCreateProduct,
	useUpdateProduct,
	useUploadImage,
} from "@/hooks/api/products";
import { useToast } from "@/hooks/use-toast";
import { useT } from "@/i18n/locale-provider";
import { track } from "@/lib/analytics";
import type { ProductFormImage, ProductFormValues } from "@/lib/types";

export function ProductForm({
	mode,
	initial,
	categories,
	productId,
}: {
	mode: "create" | "edit";
	initial: ProductFormValues;
	categories: { id: string; name: string }[];
	productId?: string;
}) {
	const { t } = useT();
	const router = useRouter();
	const { toast } = useToast();
	const uploadImage = useUploadImage();
	const createProduct = useCreateProduct();
	const updateProduct = useUpdateProduct();
	const [values, setValues] = React.useState<ProductFormValues>(initial);
	const [saving, setSaving] = React.useState(false);
	const [uploading, setUploading] = React.useState(false);

	function set<K extends keyof ProductFormValues>(
		k: K,
		v: ProductFormValues[K],
	) {
		setValues((s) => ({ ...s, [k]: v }));
	}

	function addImageUrl() {
		set("images", [...values.images, { url: "", alt: "" }]);
	}
	function setImage(i: number, patch: Partial<ProductFormImage>) {
		const next = [...values.images];
		next[i] = { ...next[i], ...patch };
		set("images", next);
	}
	function removeImage(i: number) {
		set(
			"images",
			values.images.filter((_, idx) => idx !== i),
		);
	}

	async function onUpload(file: File, i: number) {
		setUploading(true);
		try {
			const { url } = await uploadImage.mutateAsync({ file, index: i });
			setImage(i, { url, alt: file.name.replace(/\.[^.]+$/, "") });
			toast({ title: "Image ajoutée" });
		} catch {
			toast({ title: "Upload échoué", variant: "destructive" });
		} finally {
			setUploading(false);
		}
	}

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		setSaving(true);
		try {
			const payload = {
				...values,
				images: values.images.filter((x) => x.url.trim()),
			};
			if (mode === "create") {
				await createProduct.mutateAsync(payload);
				track("admin_product_create", { ref: values.ref });
				toast({ title: "Produit créé" });
			} else {
				await updateProduct.mutateAsync({
					id: productId!,
					body: payload,
				});
				track("admin_product_update", { ref: values.ref });
				toast({ title: "Produit mis à jour" });
			}
			router.push("/makteb/products");
			router.refresh();
		} catch (e) {
			toast({
				title: "Erreur",
				description: String(e).slice(0, 100),
				variant: "destructive",
			});
		} finally {
			setSaving(false);
		}
	}

	return (
		<form onSubmit={onSubmit} className="space-y-8">
			<div className="flex items-center justify-between gap-3">
				<div>
					<Link
						href="/makteb/products"
						className="inline-flex items-center gap-2 font-label text-[0.62rem] uppercase tracking-[0.18em] text-ink hover:text-ink"
					>
						<ArrowLeft className="size-3.5" />
						{t("admin.common.back")}
					</Link>
					<h1 className="mt-2 heading-vintage-lg">
						{mode === "create"
							? t("admin.products.new")
							: t("admin.products.edit")}
					</h1>
				</div>
				<div className="flex gap-2">
					<Button
						asChild
						variant="outline"
						className="rounded-full border-bronze/50 font-label text-[0.68rem] uppercase tracking-[0.16em]"
					>
						<Link href="/makteb/products">{t("admin.common.cancel")}</Link>
					</Button>
					<Button
						type="submit"
						disabled={saving}
						className="rounded-full bg-ink font-label text-[0.72rem] uppercase tracking-[0.16em] text-cream hover:bg-terracotta dark:bg-cream dark:text-ink"
					>
						{saving ? <Loader2 className="size-4 animate-spin" /> : null}
						{t("admin.common.save")}
					</Button>
				</div>
			</div>

			<div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
				{/* Left — main fields */}
				<div className="space-y-5">
					<div className="card-vintage rounded-sm p-5">
						<h2 className="heading-vintage">Informations</h2>
						<div className="mt-4 grid gap-4 sm:grid-cols-2">
							<Field label="Référence *">
								<Input
									value={values.ref}
									onChange={(e) => set("ref", e.target.value)}
									required
									className="field-vintage"
									disabled={mode === "edit"}
								/>
							</Field>
							<Field label="Nom *">
								<Input
									value={values.name}
									onChange={(e) => set("name", e.target.value)}
									required
									className="field-vintage"
								/>
							</Field>
							<Field label="Nom amazigh (Tifinagh)">
								<Input
									value={values.nameAmazigh ?? ""}
									onChange={(e) => set("nameAmazigh", e.target.value)}
									className="tifinagh field-vintage"
								/>
							</Field>
							<Field label="Catégorie">
								<select
									value={values.categoryId ?? ""}
									onChange={(e) => set("categoryId", e.target.value || null)}
									className="h-9 w-full rounded-sm border border-bronze/45 bg-card px-3 body-vintage-sm"
								>
									<option value="">—</option>
									{categories.map((c) => (
										<option key={c.id} value={c.id}>
											{c.name}
										</option>
									))}
								</select>
							</Field>
						</div>
						<div className="mt-4">
							<Field label="Description (longue)">
								<Textarea
									value={values.description}
									onChange={(e) => set("description", e.target.value)}
									rows={4}
									className="field-vintage"
								/>
							</Field>
						</div>
						<div className="mt-4">
							<Field label="Story courte (carte)">
								<Textarea
									value={values.shortStory}
									onChange={(e) => set("shortStory", e.target.value)}
									rows={2}
									className="field-vintage"
								/>
							</Field>
						</div>
					</div>

					<div className="card-vintage rounded-sm p-5">
						<h2 className="heading-vintage">Détails</h2>
						<div className="mt-4 grid gap-4 sm:grid-cols-2">
							<Field label="Matières">
								<Input
									value={values.materials}
									onChange={(e) => set("materials", e.target.value)}
									className="field-vintage"
								/>
							</Field>
							<Field label="Couleurs">
								<Input
									value={values.colors}
									onChange={(e) => set("colors", e.target.value)}
									placeholder="Beige · Bleu Ciel · Rose Baby"
									className="field-vintage"
								/>
							</Field>
							<Field label="Tailles">
								<Input
									value={values.sizes}
									onChange={(e) => set("sizes", e.target.value)}
									placeholder="S · M · L · XL"
									className="field-vintage"
								/>
							</Field>
							<Field label="Devise">
								<Input
									value={values.currency}
									onChange={(e) => set("currency", e.target.value)}
									className="field-vintage"
								/>
							</Field>
						</div>
					</div>

					<div className="card-vintage rounded-sm p-5">
						<h2 className="heading-vintage">Prix & stock</h2>
						<div className="mt-4 grid gap-4 sm:grid-cols-2">
							<Field label="Prix (MAD) *">
								<Input
									type="number"
									value={values.price}
									onChange={(e) => set("price", Number(e.target.value))}
									required
									className="field-vintage"
								/>
							</Field>
							<Field label="Prix promo (optionnel)">
								<Input
									type="number"
									value={values.salePrice ?? ""}
									onChange={(e) =>
										set(
											"salePrice",
											e.target.value ? Number(e.target.value) : null,
										)
									}
									className="field-vintage"
								/>
							</Field>
						</div>
						<div className="mt-4 flex gap-6">
							<label className="inline-flex items-center gap-2 body-vintage-muted">
								<input
									type="checkbox"
									checked={values.inStock}
									onChange={(e) => set("inStock", e.target.checked)}
									className="size-4 accent-terracotta"
								/>
								{t("admin.products.inStock")}
							</label>
							<label className="inline-flex items-center gap-2 body-vintage-muted">
								<input
									type="checkbox"
									checked={values.featured}
									onChange={(e) => set("featured", e.target.checked)}
									className="size-4 accent-terracotta"
								/>
								{t("admin.dashboard.featured")}
							</label>
						</div>
					</div>
				</div>

				{/* Right — images */}
				<ProductImageGallery
					images={values.images}
					onAddImage={addImageUrl}
					setImage={setImage}
					removeImage={removeImage}
					onUpload={onUpload}
					uploading={uploading}
					t={(key) => t(key)}
				/>
			</div>
		</form>
	);
}

export function Field({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div>
			<Label className="label-vintage">{label}</Label>
			<div className="mt-1.5">{children}</div>
		</div>
	);
}
