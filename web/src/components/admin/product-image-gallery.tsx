"use client";

import { Loader2, Plus, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ProductFormImage } from "@/lib/types";

export type ProductImageGalleryProps = {
	images: ProductFormImage[];
	onAddImage: () => void;
	setImage: (i: number, patch: Partial<ProductFormImage>) => void;
	removeImage: (i: number) => void;
	onUpload: (file: File, i: number) => void;
	uploading: boolean;
	t: (key: string) => string;
};

/**
 * Product image gallery — extracted from ProductForm so the form stays
 * focused on the main fields. Renders the image list with URL/alt inputs,
 * per-image upload and remove controls.
 */
export function ProductImageGallery({
	images,
	onAddImage,
	setImage,
	removeImage,
	onUpload,
	uploading,
	t,
}: ProductImageGalleryProps) {
	function addImageUrl() {
		onAddImage();
	}

	return (
		<div className="space-y-5">
			<div className="card-vintage rounded-sm p-5">
				<div className="flex items-center justify-between">
					<h2 className="heading-vintage">Images</h2>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={addImageUrl}
						className="rounded-full border-bronze/50 text-xs"
					>
						<Plus className="size-3.5" /> Ajouter
					</Button>
				</div>
				<div className="mt-4 space-y-3">
					{images.length === 0 && (
						<p className="body-vintage-muted">
							Aucune image. Collez une URL ou uploadez.
						</p>
					)}
					{images.map((img, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: images have no stable id; add/remove only appends or removes at a known position
						<div key={i} className="rounded-sm border border-bronze/30 p-3">
							<div className="flex gap-3">
								<div className="size-20 shrink-0 overflow-hidden rounded-sm bg-sand/40">
									{img.url ? (
										<Image
											src={img.url}
											alt={img.alt || ""}
											width={80}
											height={80}
											className="h-full w-full object-cover"
										/>
									) : (
										<div className="flex h-full items-center justify-center text-bronze/40">
											{uploading ? (
												<Loader2 className="size-5 animate-spin" />
											) : (
												<Upload className="size-5" />
											)}
										</div>
									)}
								</div>
								<div className="flex-1 space-y-2">
									<Input
										placeholder="https://… /uploads/x.png"
										value={img.url}
										onChange={(e) => setImage(i, { url: e.target.value })}
										className="field-vintage text-xs"
									/>
									<Input
										placeholder="Texte alternatif"
										value={img.alt ?? ""}
										onChange={(e) => setImage(i, { alt: e.target.value })}
										className="field-vintage text-xs"
									/>
									<div className="flex items-center gap-2">
										<label className="inline-flex cursor-pointer items-center gap-1 font-label text-[0.58rem] uppercase tracking-[0.14em] text-bronze hover:text-terracotta">
											<Upload className="size-3" /> Uploader
											<input
												type="file"
												accept="image/*"
												className="hidden"
												onChange={(e) => {
													const f = e.target.files?.[0];
													if (f) onUpload(f, i);
												}}
											/>
										</label>
										<button
											type="button"
											onClick={() => removeImage(i)}
											className="ms-auto inline-flex items-center gap-1 font-label text-[0.58rem] uppercase tracking-[0.14em] text-terracotta hover:underline"
										>
											<Trash2 className="size-3" /> {t("admin.products.delete")}
										</button>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
