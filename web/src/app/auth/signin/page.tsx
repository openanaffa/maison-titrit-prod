"use client";

import * as React from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AmazighStar, OrnamentDivider } from "@/components/maison/motifs";
import { site } from "@/config/site";
import { useT } from "@/i18n/locale-provider";

type Mode = "signin" | "signup" | "magic";

export default function AuthPage() {
  const router = useRouter();
  const params = useSearchParams();
  // Default callback depends on intent: explicit /makteb callback → staff; else /compte.
  const explicitCallback = params.get("callbackUrl");
  const callbackUrl = explicitCallback || "/compte";

  const [mode, setMode] = React.useState<Mode>("signin");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");
  const [loading, setLoading] = React.useState<"creds" | "google" | "magic" | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [magicSent, setMagicSent] = React.useState(false);
  const [signupOk, setSignupOk] = React.useState(false);

  const { t } = useT();
  const isStaffIntent = callbackUrl.startsWith("/makteb");

  async function onCredentials(e: React.FormEvent) {
    e.preventDefault();
    setLoading("creds");
    setError(null);
    setSignupOk(false);

    // Signup mode: create the account first, then sign in.
    if (mode === "signup") {
      const reg = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const regJson = await reg.json();
      if (!reg.ok) {
        setLoading(null);
        setError(regJson.error || t("auth.signupError"));
        return;
      }
      setSignupOk(true);
    }

    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(null);
    if (!res || res.error || res.ok === false) {
      setError("Email ou mot de passe incorrect.");
      return;
    }
    // After login, route based on role. Refresh first so the new session
    // cookie is available to the server layout before it renders.
    const next = isStaffIntent ? callbackUrl : "/compte";
    await router.refresh();
    router.push(next);
  }

  async function onGoogle() {
    setLoading("google");
    await signIn("google", { callbackUrl });
  }

  async function onMagic(e: React.FormEvent) {
    e.preventDefault();
    setLoading("magic");
    setError(null);
    // Email provider sends a verification link.
    const res = await signIn("email", { email, redirect: false });
    setLoading(null);
    if (!res || res.error) {
      setError("Impossible d'envoyer le lien. Vérifiez l'email.");
      return;
    }
    setMagicSent(true);
  }

  return (
    <section className="vintage-paper flex min-h-[100svh] items-start justify-center px-4 pt-10 pb-44 sm:pt-12 sm:pb-40">
      <div className="w-full max-w-md">
        <div className="vintage-frame rounded-sm bg-card/95 p-7 sm:p-9">
          <div className="text-center">
            <img
              src="/assets/titrit-logo-gold.svg"
              alt=""
              aria-hidden="true"
              className="titrit-logo-mark mx-auto h-12 w-12"
              draggable={false}
            />
            <h1 className="wordmark mt-3 text-xl uppercase text-ink dark:text-cream">
              {site.name}
            </h1>
            <p className="tifinagh mt-1 text-sm text-bronze">{site.nameAmazigh}</p>
            <OrnamentDivider className="mt-4" width={160} />
          </div>

          <p className="mt-5 text-center font-serif text-sm text-ink-soft dark:text-cream/75">
            {mode === "signup"
              ? "Créez votre compte client pour commander en toute simplicité."
              : isStaffIntent
                ? "Espace réservé à l'équipe Maison Titrit."
                : "Connectez-vous pour suivre vos commandes."}
          </p>

          {error && (
            <p className="mt-4 rounded-sm bg-terracotta/10 p-3 text-center font-serif text-sm text-terracotta">
              {error}
            </p>
          )}

          {magicSent && (
            <p className="mt-4 rounded-sm bg-bronze/10 p-3 text-center font-serif text-sm text-ink-soft dark:text-cream/80">
              Lien envoyé à « {email} ». Vérifiez votre boîte de réception.
            </p>
          )}

          {mode !== "magic" ? (
            <form onSubmit={onCredentials} className="mt-6 space-y-4">
              {mode === "signup" && (
                <div>
                  <Label htmlFor="name" className="font-label text-[0.66rem] uppercase tracking-[0.18em] text-bronze">
                    Nom
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1.5 rounded-sm border-bronze/45 bg-cream-light/60 dark:bg-ink/40"
                  />
                </div>
              )}
              <div>
                <Label htmlFor="email" className="font-label text-[0.66rem] uppercase tracking-[0.18em] text-bronze">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5 rounded-sm border-bronze/45 bg-cream-light/60 dark:bg-ink/40"
                />
              </div>
              <div>
                <Label htmlFor="password" className="font-label text-[0.66rem] uppercase tracking-[0.18em] text-bronze">
                  Mot de passe
                </Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1.5 rounded-sm border-bronze/45 bg-cream-light/60 dark:bg-ink/40"
                />
              </div>
              <Button
                type="submit"
                disabled={loading === "creds"}
                className="h-11 w-full rounded-full bg-ink font-label text-[0.72rem] uppercase tracking-[0.18em] text-cream hover:bg-terracotta dark:bg-cream dark:text-ink"
              >
                {loading === "creds" ? "…" : mode === "signup" ? "Créer mon compte" : "Se connecter"}
              </Button>
            </form>
          ) : (
            <form onSubmit={onMagic} className="mt-6 space-y-4">
              <div>
                <Label htmlFor="magic-email" className="font-label text-[0.66rem] uppercase tracking-[0.18em] text-bronze">
                  Email
                </Label>
                <Input
                  id="magic-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5 rounded-sm border-bronze/45 bg-cream-light/60 dark:bg-ink/40"
                />
              </div>
              <Button
                type="submit"
                disabled={loading === "magic"}
                className="h-11 w-full rounded-full bg-ink font-label text-[0.72rem] uppercase tracking-[0.18em] text-cream hover:bg-terracotta dark:bg-cream dark:text-ink"
              >
                {loading === "magic" ? "…" : "Recevoir un lien magique"}
              </Button>
            </form>
          )}

          {/* Google */}
          {process.env.NEXT_PUBLIC_GOOGLE_ENABLED === "1" && (
            <>
              <div className="my-5 flex items-center gap-3">
                <Separator className="flex-1 bg-bronze/25" />
                <span className="font-label text-[0.6rem] uppercase tracking-[0.2em] text-bronze">ou</span>
                <Separator className="flex-1 bg-bronze/25" />
              </div>
              <Button
                onClick={onGoogle}
                disabled={loading === "google"}
                variant="outline"
                className="h-11 w-full rounded-full border-bronze/50 font-label text-[0.72rem] uppercase tracking-[0.16em] text-ink hover:border-terracotta hover:text-terracotta dark:text-cream"
              >
                {loading === "google" ? "…" : "Continuer avec Google"}
              </Button>
            </>
          )}

          {/* Mode switch */}
          <div className="mt-6 flex items-center justify-center gap-3 text-[0.7rem]">
            {mode !== "signin" && (
              <button
                onClick={() => { setMode("signin"); setError(null); }}
                className="font-label uppercase tracking-[0.16em] text-bronze hover:text-terracotta"
              >
                Se connecter
              </button>
            )}
            {mode !== "signup" && (
              <button
                onClick={() => { setMode("signup"); setError(null); }}
                className="font-label uppercase tracking-[0.16em] text-bronze hover:text-terracotta"
              >
                Créer un compte
              </button>
            )}
            {mode !== "magic" && (
              <button
                onClick={() => { setMode("magic"); setError(null); }}
                className="font-label uppercase tracking-[0.16em] text-bronze hover:text-terracotta"
              >
                Lien magique
              </button>
            )}
          </div>

          {/* Hint for staff */}
          {isStaffIntent && (
            <p className="mt-6 flex items-center justify-center gap-2 text-center font-serif text-xs text-bronze/80">
              <AmazighStar className="size-3" strokeWidth={1.6} />
              Accès équipe — connexion par identifiants.
            </p>
          )}
        </div>

        <p className="mt-4 text-center font-serif text-xs text-ink-soft/70 dark:text-cream/60">
          En continuant, vous acceptez nos conditions et notre politique de
          confidentialité.
        </p>
      </div>
    </section>
  );
}
