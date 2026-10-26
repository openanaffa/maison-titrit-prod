"use client";

import * as React from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Menu, Moon, Sun, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession, signOut } from "next-auth/react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { site } from "@/config/site";
import { whatsappContactLink, whatsappCatalog } from "@/lib/brand";
import { OrnamentDivider, WhatsAppIcon } from "@/components/maison/motifs";
import { TitritLogo } from "@/components/maison/titrit-logo";
import { useT } from "@/i18n/locale-provider";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { SocialIcons } from "@/components/maison/social-icons";
import { CartDrawer } from "@/components/maison/cart-drawer";

function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const current = theme === "system" ? resolvedTheme : theme;
  return (
    <button
      type="button"
      aria-label="Changer de thème"
      onClick={() => setTheme(current === "dark" ? "light" : "dark")}
      className="inline-flex size-9 items-center justify-center rounded-full border border-bronze/40 text-ink transition-colors hover:bg-bronze/10 dark:text-cream"
    >
      {mounted ? (
        current === "dark" ? (
          <Sun className="size-4" />
        ) : (
          <Moon className="size-4" />
        )
      ) : (
        <span className="size-4" />
      )}
    </button>
  );
}

export function SiteHeader() {
  const { t } = useT();
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-background/90 backdrop-blur-md border-b border-bronze/25 shadow-[0_8px_30px_-22px_rgba(28,26,23,0.5)]"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:h-20 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="#accueil" className="group" aria-label="Maison Titrit — accueil">
          <TitritLogo />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {site.nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="font-label text-[0.78rem] uppercase tracking-[0.22em] text-ink/80 transition-colors hover:text-terracotta dark:text-cream/80"
            >
              {t(item.labelKey)}
            </a>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href={`tel:${site.phones[0].e164}`}
            className="hidden size-9 items-center justify-center rounded-full border border-bronze/40 text-ink transition-colors hover:bg-bronze/10 sm:inline-flex dark:text-cream"
            aria-label={t("cta.call")}
          >
            <Phone className="size-4" />
          </a>
          <LanguageSwitcher />
          <ThemeToggle />
          <AccountButton />
          <CartDrawer />
          <Button
            asChild
            className="hidden h-9 rounded-full bg-ink px-5 font-label text-[0.72rem] uppercase tracking-[0.18em] text-cream hover:bg-ink/90 sm:inline-flex dark:bg-cream dark:text-ink dark:hover:bg-cream/90"
          >
            <a
              href={whatsappContactLink(t("float.msg"))}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsAppIcon className="size-4" />
              {t("cta.order")}
            </a>
          </Button>

          {/* Mobile menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label={t("cta.openMenu")}
                className="inline-flex size-9 items-center justify-center rounded-full border border-bronze/40 text-ink md:hidden dark:text-cream"
              >
                <Menu className="size-4" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="vintage-paper w-[88vw] max-w-sm border-bronze/40 p-0"
            >
              <SheetTitle className="sr-only">Navigation Maison Titrit</SheetTitle>
              <SheetDescription className="sr-only">{t("footer.menu")}</SheetDescription>
              <div className="flex h-full flex-col p-6">
                <TitritLogo logoClassName="h-10 w-10" wordmarkClassName="text-base" />
                <OrnamentDivider className="mt-6" width={180} />
                <nav className="mt-8 flex flex-col gap-1">
                  {site.nav.map((item) => (
                    <SheetClose asChild key={item.href}>
                      <a
                        href={item.href}
                        className="font-display text-2xl text-ink transition-colors hover:text-terracotta dark:text-cream"
                      >
                        {t(item.labelKey)}
                      </a>
                    </SheetClose>
                  ))}
                </nav>

                <div className="mt-8">
                  <SocialIcons size={36} />
                </div>

                <div className="mt-auto space-y-3">
                  <SheetClose asChild>
                    <Button
                      asChild
                      className="h-11 w-full rounded-full bg-ink font-label text-[0.75rem] uppercase tracking-[0.18em] text-cream dark:bg-cream dark:text-ink"
                    >
                      <a href={whatsappCatalog} target="_blank" rel="noopener noreferrer">
                        <WhatsAppIcon className="size-4" />
                        {t("cta.viewCatalog")}
                      </a>
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button
                      asChild
                      variant="outline"
                      className="h-11 w-full rounded-full border-bronze/50 font-label text-[0.72rem] uppercase tracking-[0.16em] text-ink hover:border-terracotta hover:text-terracotta dark:text-cream"
                    >
                      <a href={whatsappContactLink(t("float.msg"))} target="_blank" rel="noopener noreferrer">
                        <WhatsAppIcon className="size-4 text-terracotta" />
                        {t("cta.orderWhatsapp")}
                      </a>
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <a
                      href={`tel:${site.phones[0].e164}`}
                      className="flex items-center justify-center gap-2 text-sm text-ink/70 dark:text-cream/70"
                    >
                      <Phone className="size-4" />
                      {site.phones[0].display}
                    </a>
                  </SheetClose>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

/** Account button — shows avatar+link to /compte if logged in, else "Sign in". */
function AccountButton() {
  const { data: session } = useSession();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted || !session?.user) {
    return (
      <Link
        href="/auth/signin?callbackUrl=/compte"
        aria-label="Sign in"
        className="inline-flex size-9 items-center justify-center rounded-full border border-bronze/40 text-ink transition-colors hover:bg-bronze/10 dark:text-cream"
      >
        <User className="size-4" />
      </Link>
    );
  }
  const initial = (session.user.name?.[0] || session.user.email?.[0] || "U").toUpperCase();
  const isStaff = ["FOUNDER", "ADMIN", "MANAGER"].includes(session.user.role ?? "");
  return (
    <Link
      href={isStaff ? "/makteb" : "/compte"}
      aria-label="Account"
      className="inline-flex size-9 items-center justify-center rounded-full bg-ink font-display text-sm font-semibold text-cream transition-colors hover:bg-terracotta dark:bg-cream dark:text-ink"
    >
      {initial}
    </Link>
  );
}
