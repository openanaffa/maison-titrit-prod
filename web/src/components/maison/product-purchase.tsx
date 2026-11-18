"use client";

import * as React from "react";
import { CategoryIcon } from "@/components/maison/category-icons";
import { NeedleThread, Reveal } from "@/components/maison/motifs";
import { ProductPurchaseActions } from "@/components/maison/product-purchase-actions";
import { Button } from "@/components/ui/button";
import { CATEGORIES } from "@/config/products";
import { site } from "@/config/site";
import { useToast } from "@/hooks/use-toast";
import { useT } from "@/i18n/locale-provider";
import { track, trackAddToCart, trackFacebook } from "@/lib/analytics";
import { whatsappCatalog } from "@/lib/brand";
import { useCart } from "@/lib/cart";
import type { ProductDTO } from "@/lib/types";

export function ProductPurchase({
	product,
	sizes,
}: {
	product: ProductDTO;
	sizes: string[];
}) {
	const { t } = useT();
	const { toast } = useToast();
	const addToCart = useCart((s) => s.add);

	const [size, setSize] = React.useState<string>(
		sizes.length === 1 ? sizes[0] : "",
	);
	const [qty, setQty] = React.useState(1);
	const [sizePrompt, setSizePrompt] = React.useState(false);
	const [copied, setCopied] = React.useState(false);

	const unitPrice = product.salePrice ?? product.price;
	const total = unitPrice * qty;
	const slugFor = (name: string) =>
		CATEGORIES.find((c) => c.name === name)?.slug;

	const orderMsg = t("card.orderMsg", {
		name: product.name,
		ref: product.ref,
		size: size || t("detail.selectSize"),
		price: total,
	});
	const orderHref = `https://wa.me/${site.whatsapp.chat}?text=${encodeURIComponent(orderMsg)}`;

	const handleOrder = () => {
		if (!size && sizes.length > 1) return setSizePrompt(true);
		setSizePrompt(false);
		track("select_item", {
			item_id: product.ref,
			item_name: product.name,
			price: total,
			currency: product.currency,
			quantity: qty,
		});
		trackFacebook("InitiateCheckout", {
			content_ids: [product.ref],
			content_name: product.name,
			value: total,
			currency: "MAD",
			num_items: qty,
		});
		window.open(orderHref, "_blank", "noopener,noreferrer");
	};

	const handleShare = async () => {
		const url = window.location.href;
		track("share", { method: "native", item_id: product.ref });
		if (navigator.share) {
			try {
				await navigator.share({
					title: product.name,
					text: product.shortStory,
					url,
				});
				return;
			} catch {
				/* user cancelled — fall through to copy */
			}
		}
		try {
			await navigator.clipboard.writeText(url);
			setCopied(true);
			window.setTimeout(() => setCopied(false), 2000);
		} catch {
			/* ignore */
		}
	};

	const handleAddToCart = () => {
		if (!size && sizes.length > 1) return setSizePrompt(true);
		setSizePrompt(false);
		addToCart(
			{
				productId: product.id,
				ref: product.ref,
				name: product.name,
				price: unitPrice,
				currency: product.currency,
				image: product.image,
				size: size || (sizes[0] ?? "—"),
			},
			qty,
		);
		trackAddToCart({
			ref: product.ref,
			name: product.name,
			price: unitPrice,
			currency: product.currency,
			qty,
		});
		toast({
			title: t("cart.itemAdded"),
			description: `${product.name} — ${size || sizes[0]}`,
		});
	};

	return (
		<Reveal delay={0.08} y={20}>
			<div>
				<p className="eyebrow inline-flex items-center gap-1.5">
					<CategoryIcon slug={slugFor(product.category)} className="size-3.5" />
					{product.category}
				</p>
				<h1 className="wordmark mt-3 text-3xl uppercase text-ink sm:text-4xl dark:text-cream">
					{product.name}
				</h1>
				{product.nameAmazigh && (
					<p className="tifinagh mt-2 text-lg text-bronze">
						{product.nameAmazigh}
					</p>
				)}

				<div className="mt-5 flex items-end gap-3">
					{product.salePrice ? (
						<>
							<p className="font-display text-4xl font-semibold text-terracotta">
								{product.salePrice.toLocaleString("fr-FR")}{" "}
								<span className="text-xl font-normal">{product.currency}</span>
							</p>
							<p className="mb-1 font-display text-xl text-ink-soft/60 line-through dark:text-cream/50">
								{product.price.toLocaleString("fr-FR")} {product.currency}
							</p>
						</>
					) : (
						<p className="font-display text-4xl font-semibold text-ink dark:text-cream">
							{product.price.toLocaleString("fr-FR")}{" "}
							<span className="text-xl font-normal text-bronze">
								{product.currency}
							</span>
						</p>
					)}
					<span className="body-vintage-soft font-label text-[0.6rem] uppercase tracking-[0.2em]">
						{t("detail.perUnit")}
					</span>
				</div>

				<NeedleThread className="mt-5 h-6 text-bronze/70" />
				<p className="mt-5 font-serif text-lg leading-relaxed text-ink-soft dark:text-cream/80">
					{product.shortStory}
				</p>

				<dl className="mt-6 space-y-2 border-t border-bronze/25 pt-5 text-sm">
					<div className="flex gap-3">
						<dt className="font-label w-28 shrink-0 uppercase tracking-[0.18em] text-bronze/80">
							{t("detail.materials")}
						</dt>
						<dd className="font-serif text-ink-soft dark:text-cream/80">
							{product.materials}
						</dd>
					</div>
				</dl>

				<ProductPurchaseActions
					product={product}
					sizes={sizes}
					size={size}
					qty={qty}
					unitPrice={unitPrice}
					total={total}
					catalogHref={whatsappCatalog}
					onSizeChange={setSize}
					onSizePromptDismiss={() => setSizePrompt(false)}
					onQtyChange={setQty}
					onSizePrompt={() => setSizePrompt(true)}
					onAddToCart={handleAddToCart}
					onOrder={handleOrder}
					onShare={handleShare}
					sizePrompt={sizePrompt}
					copied={copied}
				/>
			</div>
		</Reveal>
	);
}
