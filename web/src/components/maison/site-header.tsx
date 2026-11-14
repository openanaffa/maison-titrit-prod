"use client";

import * as React from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { LogOut, Menu, Moon, Sun, User } from "lucide-react";
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
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { site } from "@/config/site";
import { whatsappContactLink } from "@/lib/brand";
import { WhatsAppIcon } from "@/components/maison/motifs";
import { TitritLogo } from "@/components/maison/titrit-logo";
import { useT } from "@/i18n/locale-provider";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { CartDrawer } from "@/components/maison/cart-drawer";
import { isStaffRole } from "@/lib/roles";

const primaryNav = site.nav.filter(
  (item) =>
    item.href === "#maison" ||
    item.href === "#collection" ||
    item.href === "#contact",
);

function ThemeToggle({ darkSurface = false }: { darkSurface?: boolean }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { t } = useT();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const current = theme === "system" ? resolvedTheme : theme;

  return (
    <button
      type="button"
      aria-label={t("theme.aria")}
      onClick={() => setTheme(current === "dark" ? "light" : "dark")}
      className={`inline-flex size-11 items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze-light ${
        darkSurface
          ? "border-cream/35 text-cream hover:bg-cream/10"
          : "border-bronze/40 text-ink hover:bg-bronze/10 dark:text-cream"
      }`}
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
  const [open, setOpen] = React.useState(false);
  const [hidden, setHidden] = React.useState(false);
  const headerRef = React.useRef<HTMLElement>(null);
  const lastScrollY = React.useRef(0);

  React.useEffect(() => {
    let frame = 0;

    const onScroll = () => {
      const currentY = window.scrollY;
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const delta = currentY - lastScrollY.current;
        const activeElement = document.activeElement;
        const keyboardFocus =
          activeElement instanceof HTMLElement &&
          activeElement.matches(":focus-visible") &&
          headerRef.current?.contains(activeElement);

        if (open || currentY <= 24 || delta < -4 || keyboardFocus) {
          setHidden(false);
        } else if (currentY > 72 && delta > 4) {
          setHidden(true);
        }

        lastScrollY.current = currentY;
      });
    };

    lastScrollY.current = window.scrollY;
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, [open]);

  return (
    <header
      ref={headerRef}
      onFocusCapture={() => setHidden(false)}
      className={`sticky top-0 z-50 border-b border-bronze/45 bg-ink text-cream shadow-[0_8px_30px_-22px_rgba(28,26,23,0.75)] backdrop-blur-md transition-transform duration-300 ease-out motion-reduce:transition-none ${
        hidden ? "pointer-events-none -translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between lg:grid lg:h-20 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
          <div className="flex items-center lg:contents">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  aria-label={t("cta.openMenu")}
                  className="inline-flex size-11 items-center justify-center rounded-full border border-cream/35 text-cream transition-colors hover:bg-cream/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze-light lg:hidden"
                >
                  <Menu className="size-4" />
                </button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="vintage-paper w-[88vw] max-w-sm border-bronze/40 p-0"
              >
                <SheetTitle className="sr-only">Navigation Maison Titrit</SheetTitle>
                <SheetDescription className="sr-only">
                  {t("footer.menu")}
                </SheetDescription>
                <div className="flex h-full flex-col p-6">
                  <Link
                    href="#accueil"
                    aria-label="Maison Titrit — accueil"
                    onClick={() => setOpen(false)}
                  >
                    <TitritLogo
                      showWordmark={false}
                      logoClassName="h-10 w-10"
                    />
                  </Link>
                  <div className="mt-6 flex items-center gap-2 border-y border-bronze/25 py-3">
                    <LanguageSwitcher />
                    <ThemeToggle />
                  </div>
                  <nav className="mt-6 flex flex-col gap-1">
                    {primaryNav.map((item) => (
                      <SheetClose asChild key={item.href}>
                        <a
                          href={item.href}
                          className="flex min-h-12 items-center border-b border-bronze/15 font-display text-xl text-ink transition-colors hover:text-terracotta dark:text-cream"
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

            <nav className="hidden items-center gap-5 xl:gap-7 lg:flex">
              {primaryNav.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="whitespace-nowrap font-label text-[0.7rem] uppercase tracking-[0.16em] text-cream/85 transition-colors hover:text-bronze-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze-light"
                >
                  {t(item.labelKey)}
                </a>
              ))}
            </nav>
          </div>

          <Link
            href="#accueil"
            className="absolute left-1/2 z-10 flex size-20 -translate-x-1/2 items-center justify-center drop-shadow-[0_4px_12px_rgba(184,145,90,0.4)] transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze-light sm:size-[5.5rem] lg:static lg:size-24 lg:translate-x-0 lg:justify-self-center motion-reduce:transition-none"
            aria-label="Maison Titrit — accueil"
          >
            <TitritLogo
              showWordmark={false}
              className="gap-0"
              logoClassName="h-16 w-16 sm:h-[4.5rem] sm:w-[4.5rem] lg:h-20 lg:w-20"
            />
          </Link>

          <div className="flex items-center gap-1.5 lg:justify-self-end lg:gap-2">
            <div className="hidden items-center gap-2 lg:flex">
              <LanguageSwitcher darkSurface />
              <ThemeToggle darkSurface />
            </div>
            <AccountButton darkSurface />
            <CartDrawer darkSurface />
            <Button
              asChild
              className="hidden h-11 rounded-full bg-cream px-4 font-label text-[0.68rem] uppercase tracking-[0.14em] text-ink hover:bg-cream/85 lg:inline-flex"
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
          </div>
        </div>
      </div>
    </header>
  );
}

function AccountButton({ darkSurface = false }: { darkSurface?: boolean }) {
  const { data: session } = useSession();
  const { t } = useT();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const user = mounted ? session?.user : undefined;
  const isStaff = isStaffRole(user?.role ?? undefined);
  const initial = (user?.name?.[0] || user?.email?.[0] || "U").toUpperCase();
  const accountHref = isStaff ? "/makteb" : "/compte#profile";

  if (!user) {
    return (
      <Link
        href="/auth/signin?callbackUrl=/compte"
        aria-label={t("auth.signin")}
        className={`inline-flex size-11 items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze-light ${
          darkSurface
            ? "border-cream/35 text-cream hover:bg-cream/10"
            : "border-bronze/40 text-ink hover:bg-bronze/10 dark:text-cream"
        }`}
      >
        <User className="size-4" />
      </Link>
    );
  }
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label={t("compte.title")}
          className={`inline-flex size-11 items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze-light ${
            darkSurface
              ? "border-cream/35 text-cream hover:bg-cream/10"
              : "border-bronze/40 text-ink hover:bg-bronze/10 dark:text-cream"
          }`}
        >
          <span className="font-display text-sm font-semibold">{initial}</span>
        </button>
      </DialogTrigger>
      <DialogContent className="vintage-paper border-bronze/40 sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-ink dark:text-cream">
            {t("compte.title")}
          </DialogTitle>
          <DialogDescription>
            {user.name || user.email || ""}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <DialogClose asChild>
            <Link
              href={accountHref}
              className="flex min-h-11 items-center rounded-sm border border-bronze/30 px-4 font-label text-sm text-ink transition-colors hover:bg-bronze/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze-light dark:text-cream"
            >
              {t("compte.profile")}
            </Link>
          </DialogClose>
          {!isStaff && (
            <DialogClose asChild>
              <Link
                href="/compte#orders"
                className="flex min-h-11 items-center rounded-sm border border-bronze/30 px-4 font-label text-sm text-ink transition-colors hover:bg-bronze/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze-light dark:text-cream"
              >
                {t("compte.orders")}
              </Link>
            </DialogClose>
          )}
          <DialogClose asChild>
            <button
              type="button"
              onClick={() => void signOut({ callbackUrl: "/" })}
              className="flex min-h-11 items-center gap-2 rounded-sm px-4 text-start font-label text-sm text-ink transition-colors hover:bg-terracotta/10 hover:text-terracotta focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta dark:text-cream"
            >
              <LogOut className="size-4" />
              {t("compte.signout")}
            </button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
