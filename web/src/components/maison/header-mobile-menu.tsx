"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { ThemeToggle } from "@/components/maison/header-theme-toggle";
import { WhatsAppIcon } from "@/components/maison/motifs";
import { TitritLogo } from "@/components/maison/titrit-logo";
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
import { whatsappContactLink } from "@/lib/brand";

export function MobileMenu({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const { t, dir } = useT();

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetTrigger asChild>
				<button
					type="button"
					aria-label={t("cta.openMenu")}
					className="inline-flex size-11 items-center justify-center rounded-full border border-bronze/40 text-ink transition-colors hover:bg-bronze/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze-light dark:border-cream/35 dark:text-cream dark:hover:bg-cream/10 lg:hidden"
				>
					<Menu className="size-4" />
				</button>
			</SheetTrigger>
			<SheetContent
				side={dir === "rtl" ? "left" : "right"}
				className="vintage-paper w-[88vw] max-w-sm border-bronze/40 p-0"
			>
				<SheetTitle className="sr-only">{t("nav.mobileTitle")}</SheetTitle>
				<SheetDescription className="sr-only">
					{t("footer.menu")}
				</SheetDescription>
				<div className="flex h-full flex-col p-6">
					<Link
						href="/#accueil"
						aria-label={t("nav.homeAria")}
						onClick={() => onOpenChange(false)}
					>
						<TitritLogo showWordmark={false} logoClassName="h-10 w-10" />
					</Link>
					<div className="mt-6 flex items-center gap-2 border-y border-bronze/25 py-3">
						<LanguageSwitcher />
						<ThemeToggle />
					</div>
					<nav className="mt-6 flex flex-col" aria-label={t("footer.menu")}>
						{site.nav.map((item) => (
							<SheetClose asChild key={item.href}>
								<a
									href={item.href}
									className="flex min-h-12 items-center border-b border-bronze/20 font-label text-[0.75rem] uppercase tracking-[0.16em] text-ink transition-colors duration-200 hover:text-terracotta focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze-light dark:text-cream dark:hover:text-bronze-light"
								>
									{t(item.labelKey)}
								</a>
							</SheetClose>
						))}
					</nav>
					<div className="mt-auto pt-6">
						<SheetClose asChild>
							<a
								href={whatsappContactLink(t("float.msg"))}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ink px-5 font-label text-xs uppercase tracking-[0.16em] text-cream transition-colors hover:bg-terracotta focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta dark:bg-cream dark:text-ink"
							>
								<WhatsAppIcon className="size-4" />
								{t("cta.order")}
							</a>
						</SheetClose>
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
}
