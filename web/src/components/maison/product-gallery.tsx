"use client";

import { Sparkles } from "lucide-react";
import Image from "next/image";

import { Reveal } from "@/components/maison/motifs";
import { useT } from "@/i18n/locale-provider";
import type { ProductDTO } from "@/lib/types";

export type GalleryImage = { url: string; alt: string };

export function ProductGallery({
	product,
	images,
	activeImg,
	onSelect,
}: {
	product: ProductDTO;
	images: GalleryImage[];
	activeImg: number;
	onSelect: (index: number) => void;
}) {
	const { t } = useT();

	return (
		<Reveal y={20}>
			<figure className="vintage-frame relative aspect-4/5 overflow-hidden rounded-sm bg-sand/30">
				<Image
					src={images[activeImg]?.url ?? product.image}
					alt={images[activeImg]?.alt ?? product.name}
					fill
					sizes="(min-width: 1024px) 31.5rem, 92vw"
					className="object-cover transition-opacity duration-300"
					priority
				/>
				{product.featured && (
					<span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-cream/90 px-2.5 py-1 font-label text-[0.6rem] uppercase tracking-[0.18em] text-ink backdrop-blur dark:bg-ink/80">
						<Sparkles className="size-3" />
						{t("card.signature")}
					</span>
				)}
				{!product.inStock && (
					<span className="absolute right-3 top-3 rounded-full bg-terracotta/90 px-2.5 py-1 font-label text-[0.58rem] uppercase tracking-[0.2em] text-cream backdrop-blur">
						{t("admin.products.outOfStock")}
					</span>
				)}
				{product.salePrice && (
					<span className="absolute bottom-3 left-3 rounded-full bg-terracotta px-2.5 py-1 font-label text-[0.58rem] uppercase tracking-[0.18em] text-cream">
						Promo
					</span>
				)}
			</figure>
			{images.length > 1 && (
				<div className="mt-3 flex gap-2">
					{images.map((img, i) => (
						<button
							key={String(i)}
							type="button"
							onClick={() => onSelect(i)}
							aria-label={`Image ${i + 1}`}
							className={`relative size-16 shrink-0 overflow-hidden rounded-sm border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta ${
								i === activeImg
									? "border-terracotta"
									: "border-transparent opacity-70 hover:opacity-100"
							}`}
						>
							<Image
								src={img.url}
								alt={img.alt}
								fill
								sizes="64px"
								loading="lazy"
								className="object-cover"
							/>
						</button>
					))}
				</div>
			)}
		</Reveal>
	);
}
