"use client";

import Link from "next/link";
import * as React from "react";
import { AmazighStar, OrnamentDivider } from "@/components/maison/motifs";
import { ErrorParams } from "@/lib/types";



function readErrorParams(): ErrorParams {
  // Supabase Auth redirects errors as URL fragments (#error=...&error_code=...),
  // which are never sent to the server — parse them client-side.
  const hash = typeof window === "undefined" ? "" : window.location.hash.replace(/^#/, "");
  const params = new URLSearchParams(hash);
  return {
    error: params.get("error"),
    code: params.get("error_code"),
    description: params.get("error_description"),
  };
}

const MESSAGES: Record<string, { title: string; body: string }> = {
  access_denied: {
    title: "Connexion annulée",
    body: "Vous avez refusé la demande d'autorisation. Aucun compte n'a été connecté.",
  },
  unexpected_failure: {
    title: "Une erreur est survenue",
    body: "La connexion a échoué lors de l'échange sécurisé avec le fournisseur. Le lien a peut-être expiré ou déjà été utilisé — réessayez une fois. Si l'erreur persiste, contactez la maison.",
  },
};

const GENERIC = {
  title: "Une erreur est survenue",
  body: "La connexion a échoué. Le lien est peut-être expiré ou déjà utilisé.",
};

export function AuthErrorClient() {
  const [params, setParams] = React.useState<ErrorParams | null>(null);

  React.useEffect(() => {
    const p = readErrorParams();
    // Server-side observability without leaking raw errors into the UI.
    if (p.error) console.warn("Auth error", p.code || "", p.description || p.error);
    setParams(p);
  }, []);

  // Prefer the finer-grained error_code (e.g. unexpected_failure) over the
  // coarse error family (server_error / access_denied).
  const key = params?.code ?? params?.error;
  const copy = key ? MESSAGES[key] ?? GENERIC : GENERIC;

  return (
    <section className="vintage-paper flex min-h-svh items-center justify-center px-4 pt-12 pb-44 sm:pb-40">
      <div className="vintage-frame max-w-md rounded-sm bg-card/95 p-9 text-center">
        <AmazighStar className="mx-auto size-9 text-terracotta" />
        <h1 className="wordmark mt-4 text-xl uppercase text-ink dark:text-cream">
          {copy.title}
        </h1>
        <OrnamentDivider className="mt-4" width={160} />
        <p className="mt-5 font-serif text-base leading-relaxed text-ink-soft dark:text-cream/80">
          {copy.body}
        </p>
        <Link
          href="/auth/signin"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-ink px-6 py-3 font-label text-[0.72rem] uppercase tracking-[0.18em] text-cream hover:bg-terracotta dark:bg-cream dark:text-ink"
        >
          Réessayer
        </Link>
      </div>
    </section>
  );
}
