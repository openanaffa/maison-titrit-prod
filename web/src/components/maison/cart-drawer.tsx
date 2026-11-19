"use client";

import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import * as React from "react";
import { WhatsAppIcon } from "@/components/maison/motifs";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { site } from "@/config/site";
import { useT } from "@/i18n/locale-provider";
import { whatsappCatalog } from "@/lib/brand";
import { useCart } from "@/lib/cart";

/** Cart drawer — slide-in from the end side. */
export function CartDrawer({ darkSurface = false }: { darkSurface?: boolean }) {
	const { t, dir } = useT();
	const [open, setOpen] = React.useState(false);
	// Subscribe to item count for the badge + drawer contents
	const items = useCart((s) => s.items);
	const setQty = useCart((s) => s.setQty);
	const remove = useCart((s) => s.remove);
	const count = items.reduce((n, i) => n + i.qty, 0);
	const total = items.reduce((s, i) => s + i.price * i.qty, 0);

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger asChild>
				<button
					type="button"
					aria-label={
						count > 0
							? `${t("cart.title")} (${t("cart.items", { count })})`
							: t("cart.title")
					}
					className={`relative inline-flex size-11 items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze-light ${
						darkSurface
							? "border-cream/35 text-cream hover:bg-cream/10"
							: "border-bronze/40 text-ink hover:bg-bronze/10 dark:text-cream"
					}`}
				>
					<ShoppingBag className="size-4" />
					{count > 0 && (
						<span
							aria-hidden="true"
							className="absolute -inset-e-0.5 -top-0.5 inline-flex min-w-4 items-center justify-center rounded-full bg-terracotta px-1 font-label text-[0.5rem] text-cream"
						>
							{count}
						</span>
					)}
				</button>
			</SheetTrigger>
			<SheetContent
				side={dir === "rtl" ? "left" : "right"}
				className="vintage-paper w-[92vw] max-w-md border-bronze/40 p-0"
			>
				<SheetTitle className="sr-only">{t("cart.title")}</SheetTitle>
				<SheetDescription className="sr-only">
					{t("cart.items", { count })}
				</SheetDescription>
				<div className="flex h-full flex-col">
					{/* Header */}
					<div className="flex items-center justify-between border-b border-bronze/25 p-5">
						<h2 className="font-display text-xl font-semibold text-ink dark:text-cream">
							{t("cart.title")}
						</h2>
					</div>

					{/* Items */}
					<div className="flex-1 overflow-y-auto p-4 scroll-vintage">
						{items.length === 0 ? (
							<div className="flex h-full flex-col items-center justify-center gap-3 text-center">
								<ShoppingBag className="size-10 text-bronze/40" />
								<p className="font-serif text-base text-ink-soft dark:text-cream/70">
									{t("cart.empty")}
								</p>
								<p className="body-vintage-muted">{t("cart.emptyDesc")}</p>
								<SheetClose asChild>
									<Link
										href="#collection"
										className="mt-2 rounded-full border border-bronze/50 px-5 py-2 font-label text-[0.66rem] uppercase tracking-[0.16em] text-ink hover:border-terracotta hover:text-terracotta dark:text-cream"
									>
										{t("cta.continueShopping")}
									</Link>
								</SheetClose>
							</div>
						) : (
							<ul className="space-y-3">
								{items.map((item) => (
									<li
										key={`${item.productId}-${item.size}`}
										className="flex gap-3 rounded-sm border border-bronze/20 p-3"
									>
										<Image
											src={item.image}
											alt={item.name}
											width={64}
											height={64}
											className="size-16 shrink-0 rounded-sm object-cover"
										/>
										<div className="min-w-0 flex-1">
											<p className="truncate heading-vintage-sm">{item.name}</p>
											<p className="label-vintage-sm">
												{t("cart.size")}: {item.size} · {item.ref}
											</p>
											<div className="mt-2 flex items-center justify-between">
												<div className="inline-flex items-center rounded-full border border-bronze/40">
													<button
														type="button"
														onClick={() =>
															setQty(item.productId, item.size, item.qty - 1)
														}
														disabled={item.qty <= 1}
														aria-label={t("cart.decreaseQty")}
														className="inline-flex size-11 items-center justify-center text-ink transition-colors hover:text-terracotta disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze-light dark:text-cream"
													>
														<Minus className="size-3" />
													</button>
													<span
														aria-live="polite"
														className="w-7 text-center body-vintage-sm"
													>
														{item.qty}
													</span>
													<button
														type="button"
														onClick={() =>
															setQty(item.productId, item.size, item.qty + 1)
														}
														disabled={item.qty >= 20}
														aria-label={t("cart.increaseQty")}
														className="inline-flex size-11 items-center justify-center text-ink transition-colors hover:text-terracotta disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze-light dark:text-cream"
													>
														<Plus className="size-3" />
													</button>
												</div>
												<span className="heading-vintage-sm">
													{(item.price * item.qty).toLocaleString("fr-FR")}{" "}
													{item.currency}
												</span>
											</div>
										</div>
										<button
											type="button"
											onClick={() => remove(item.productId, item.size)}
											aria-label={t("cart.remove")}
											className="self-start inline-flex size-11 items-center justify-center rounded-full text-ink-soft/60 transition-colors hover:text-terracotta focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
										>
											<Trash2 className="size-4" />
										</button>
									</li>
								))}
							</ul>
						)}
					</div>

					{/* Footer */}
					{items.length > 0 && (
						<div className="border-t border-bronze/25 p-5">
							<div className="flex items-center justify-between">
								<span className="font-label text-[0.66rem] uppercase tracking-[0.18em] text-bronze">
									{t("cart.total")}
								</span>
								<span className="heading-vintage-md">
									{total.toLocaleString("fr-FR")} {site.currency}
								</span>
							</div>
							<div className="mt-4 space-y-2">
								<SheetClose asChild>
									<Button
										asChild
										className="h-12 w-full rounded-full bg-ink font-label text-[0.72rem] uppercase tracking-[0.18em] text-cream hover:bg-terracotta dark:bg-cream dark:text-ink"
									>
										<Link href="/panier">
											{t("cta.viewCart")}
											<ArrowRight className="size-4 rtl:rotate-180" />
										</Link>
									</Button>
								</SheetClose>
								<SheetClose asChild>
									<Button
										asChild
										variant="outline"
										className="h-11 w-full rounded-full border-bronze/50 font-label text-[0.68rem] uppercase tracking-[0.16em] text-ink hover:border-terracotta hover:text-terracotta dark:text-cream"
									>
										<a
											href={whatsappCatalog}
											target="_blank"
											rel="noopener noreferrer"
										>
											<WhatsAppIcon className="size-4 text-terracotta" />
											{t("cta.viewCatalog")}
										</a>
									</Button>
								</SheetClose>
							</div>
						</div>
					)}
				</div>
			</SheetContent>
		</Sheet>
	);
}
