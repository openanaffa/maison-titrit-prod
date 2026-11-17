"use client";

import * as React from "react";
import Link from "next/link";
import { LogOut, User } from "lucide-react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useSupabaseAuth } from "@/components/maison/supabase-auth-provider";
import { useT } from "@/i18n/locale-provider";
import { isStaffRole } from "@/lib/roles";
import { signOut } from "@/lib/supabase/auth-client";

export function AccountButton({ darkSurface = false }: { darkSurface?: boolean }) {
  const { user } = useSupabaseAuth();
  const { t } = useT();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const isStaff = isStaffRole(user?.role);
  const name = typeof user?.user_metadata?.name === "string"
    ? user.user_metadata.name
    : typeof user?.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : null;
  const initial = (name?.[0] || user?.email?.[0] || "U").toUpperCase();
  const accountHref = isStaff ? "/makteb" : "/compte#profile";
  const iconClass = `inline-flex size-11 items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze-light ${
    darkSurface
      ? "border-cream/35 text-cream hover:bg-cream/10"
      : "border-bronze/40 text-ink hover:bg-bronze/10 dark:text-cream"
  }`;

  if (!mounted || !user) {
    return (
      <Link
        href="/auth/signin?callbackUrl=/compte"
        aria-label={t("auth.signin")}
        className={iconClass}
      >
        <User className="size-4" />
      </Link>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button type="button" aria-label={t("compte.title")} className={iconClass}>
          <span className="font-display text-sm font-semibold">{initial}</span>
        </button>
      </DialogTrigger>
      <DialogContent className="vintage-paper border-bronze/40 sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-ink dark:text-cream">
            {t("compte.title")}
          </DialogTitle>
          <DialogDescription>{name || user.email || ""}</DialogDescription>
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
              onClick={() => void signOut("/")}
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
