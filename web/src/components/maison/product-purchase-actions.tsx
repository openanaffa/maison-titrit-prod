"use client";

import { Minus, Plus, Share2, ShoppingBag, Truck } from "lucide-react";
import { WhatsAppIcon } from "@/components/maison/motifs";
import { Button } from "@/components/ui/button";
import { useT } from "@/i18n/locale-provider";

export type ProductPurchaseActionsProps = {
	product: {
		currency: string;
		inStock?: boolean;
	};
	sizes: string[];
	size: string;
	qty: number;
	total: number;
	onSizeChange: (v: string) => void;
	onSizePromptDismiss: () => void;
	onQtyChange: (v: number) => void;
	onAddToCart: () => void;
	onOrder: () => void;
	onShare: () => void;
	sizePrompt: boolean;
	copied: boolean;
};

/**
 * Product purchase actions — extracted from ProductPurchase. Renders the
 * size selector, quantity selector and the Add to Cart / WhatsApp / Share
 * buttons. Purely presentational; all behaviour is passed in as callbacks.
 */
export function ProductPurchaseActions({
	product,
	sizes,
	size,
	qty,
	total,
	onSizeChange,
	onSizePromptDismiss,
	onQtyChange,
	onAddToCart,
	onOrder,
	onShare,
	sizePrompt,
	copied,
}: ProductPurchaseActionsProps) {
	const { t } = useT();
	const inStock = product.inStock ?? true;

	return (
		<>
			<div className="mt-6">
				<p className="font-label text-[0.66rem] uppercase tracking-[0.18em] text-bronze/80">
					{t("detail.sizes")}
				</p>
				<div className="mt-3 flex flex-wrap gap-2">
					{sizes.map((s) => {
						const active = s === size;
						return (
							<button
								key={s}
								type="button"
								onClick={() => {
									onSizeChange(s);
									onSizePromptDismiss();
								}}
								aria-pressed={active}
								className={`h-11 min-w-11 rounded-full border px-4 font-label text-[0.72rem] uppercase tracking-[0.14em] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze-light ${
									active
										? "border-ink bg-ink text-cream dark:border-cream dark:bg-cream dark:text-ink"
										: "border-bronze/45 text-ink/80 hover:border-terracotta hover:text-terracotta dark:text-cream/80"
								}`}
							>
								{s}
							</button>
						);
					})}
				</div>
				{sizePrompt && (
					<p className="mt-2 font-label text-[0.6rem] uppercase tracking-[0.18em] text-terracotta">
						{t("detail.sizePrompt")}
					</p>
				)}
			</div>

			<div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-bronze/25 pt-5">
				<div>
					<p className="font-label text-[0.66rem] uppercase tracking-[0.18em] text-bronze/80">
						{t("detail.quantity")}
					</p>
					<div className="mt-2 inline-flex items-center rounded-full border border-bronze/45">
						<button
							type="button"
							onClick={() => onQtyChange(Math.max(1, qty - 1))}
							disabled={qty <= 1}
							aria-label={t("cart.decreaseQty")}
							className="inline-flex size-11 items-center justify-center text-ink transition-colors hover:text-terracotta disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze-light dark:text-cream"
						>
							<Minus className="size-4" />
						</button>
						<span
							aria-live="polite"
							className="w-10 text-center font-display text-lg text-ink dark:text-cream"
						>
							{qty}
						</span>
						<button
							type="button"
							onClick={() => onQtyChange(Math.min(10, qty + 1))}
							disabled={qty >= 10}
							aria-label={t("cart.increaseQty")}
							className="inline-flex size-11 items-center justify-center text-ink transition-colors hover:text-terracotta disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze-light dark:text-cream"
						>
							<Plus className="size-4" />
						</button>
					</div>
				</div>
				<div className="text-end">
					<p className="body-vintage-soft font-label text-[0.6rem] uppercase tracking-[0.2em]">
						{t("detail.total")}
					</p>
					<p className="heading-vintage-lg">
						{total.toLocaleString("fr-FR")}{" "}
						<span className="text-lg font-normal text-bronze">
							{product.currency}
						</span>
					</p>
				</div>
			</div>

			<div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
				<Button
					onClick={onAddToCart}
					disabled={!inStock}
					className="h-12 flex-1 rounded-full bg-ink font-label text-[0.74rem] uppercase tracking-[0.18em] text-cream transition-all hover:bg-terracotta dark:bg-cream dark:text-ink dark:hover:bg-terracotta dark:hover:text-cream"
				>
					<ShoppingBag className="size-4" />
					{inStock ? t("cta.addToCart") : t("admin.products.outOfStock")}
				</Button>
				<Button
					onClick={onOrder}
					disabled={!inStock}
					variant="outline"
					className="h-12 rounded-full border-bronze/50 px-5 font-label text-[0.74rem] uppercase tracking-[0.16em] text-ink hover:border-terracotta hover:bg-bronze/10 hover:text-terracotta dark:text-cream"
				>
					<WhatsAppIcon className="size-4" />
					{t("cta.orderWhatsapp")}
				</Button>
				<Button
					onClick={onShare}
					variant="outline"
					className="h-12 rounded-full border-bronze/50 px-5 font-label text-[0.72rem] uppercase tracking-[0.16em] text-ink hover:border-terracotta hover:text-terracotta dark:text-cream"
				>
					<Share2 className="size-4" />
					{copied ? t("detail.shareCopied") : t("detail.share")}
				</Button>
			</div>

			<div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-bronze/25 pt-4">
				<a
					href="/guide-des-tailles"
					className="min-h-11 inline-flex items-center font-label text-xs font-semibold text-ink underline decoration-bronze/60 underline-offset-4 hover:text-terracotta focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink dark:text-cream dark:focus-visible:outline-cream"
				>
					{t("legal.sizing")}
				</a>
				<a
					href="/livraison-retours"
					className="min-h-11 inline-flex items-center gap-2 font-serif text-sm font-medium text-ink underline decoration-bronze/60 underline-offset-4 hover:text-terracotta focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink dark:text-cream dark:focus-visible:outline-cream"
				>
					<Truck className="size-4 text-terracotta" />
					{t("legal.deliveryReturns")}
				</a>
			</div>
			<p className="mt-1 font-serif text-sm text-ink-soft dark:text-cream/75">
				{t("detail.cod")}
			</p>
		</>
	);
}
