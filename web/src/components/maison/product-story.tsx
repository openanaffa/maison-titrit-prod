"use client";

import {
	AmazighStar,
	OrnamentDivider,
	Reveal,
} from "@/components/maison/motifs";
import { ProductCard } from "@/components/maison/product-card";
import { site } from "@/config/site";
import { useT } from "@/i18n/locale-provider";
import type { ProductDTO } from "@/lib/types";

export function ProductStory({ product }: { product: ProductDTO }) {
	const { t } = useT();

	return (
		<Reveal delay={0.1}>
			<div className="mt-16 vintage-frame rounded-sm p-7 sm:p-10">
				<div className="text-center">
					<AmazighStar className="mx-auto size-8 text-terracotta" />
					<h2 className="wordmark mt-4 text-xl uppercase text-ink dark:text-cream">
						{t("detail.story")}
					</h2>
					<OrnamentDivider className="mt-5" width={180} />
				</div>
				<p className="mt-6 max-w-2xl mx-auto text-center font-serif text-lg leading-relaxed text-ink-soft dark:text-cream/80">
					{product.description}
				</p>
				<p className="mt-4 max-w-2xl mx-auto text-center font-serif text-base leading-relaxed text-ink-soft/85 dark:text-cream/70">
					{product.materials}. {product.sizes}. {t("detail.cod")}.
				</p>
				<p
					className="mt-6 text-center font-serif text-base text-bronze"
					dir="rtl"
				>
					{site.arabicWelcome}
				</p>
			</div>
		</Reveal>
	);
}

export function ProductRelated({ related }: { related: ProductDTO[] }) {
	const { t } = useT();
	if (related.length === 0) return null;

	return (
		<div className="mt-20">
			<Reveal className="text-center">
				<p className="eyebrow">{t("detail.related")}</p>
				<h2 className="mt-2 font-display text-3xl font-semibold text-ink sm:text-4xl dark:text-cream">
					{t("detail.related")}
				</h2>
				<OrnamentDivider className="mt-5" width={180} />
			</Reveal>
			<div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{related.map((p, i) => (
					<Reveal key={p.id} delay={(i % 3) * 0.08}>
						<ProductCard product={p} />
					</Reveal>
				))}
			</div>
		</div>
	);
}
