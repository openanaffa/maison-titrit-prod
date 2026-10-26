"use client";

import * as React from "react";
import { Megaphone, Clock, Loader2, Check, Activity, ShieldCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { AmazighStar, OrnamentDivider } from "@/components/maison/motifs";

const DAYS = [
  { key: "mon-fri", label: "Lundi — Vendredi" },
  { key: "sat", label: "Samedi" },
  { key: "sun", label: "Dimanche" },
];

type AnalyticsForm = { gtmId: string; ga4Id: string; fbPixelId: string };
type VerificationForm = {
  google: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  customText: string; // paste <meta …> tags — parsed server-side
};

const VERIFICATION_HINTS: { key: keyof Omit<VerificationForm, "customText">; label: string; meta: string }[] = [
  { key: "google", label: "Google Search Console", meta: "google-site-verification" },
  { key: "facebook", label: "Facebook (Meta)", meta: "facebook-domain-verification" },
  { key: "instagram", label: "Instagram", meta: "instagram-site-verification" },
  { key: "tiktok", label: "TikTok", meta: "tiktok-domain-verification" },
];

const EMPTY_ANALYTICS: AnalyticsForm = { gtmId: "", ga4Id: "", fbPixelId: "" };
const EMPTY_VERIFICATION: VerificationForm = {
  google: "",
  facebook: "",
  instagram: "",
  tiktok: "",
  customText: "",
};

export default function SettingsClient() {
  const { toast } = useToast();
  const [ann, setAnn] = React.useState({ active: false, message: "", link: "" });
  const [ints, setInts] = React.useState({
    analytics: EMPTY_ANALYTICS,
    verification: EMPTY_VERIFICATION,
  });
  const [savedIds, setSavedIds] = React.useState<string[]>([]);
  const [saving, setSaving] = React.useState<"ann" | "hours" | "ints" | null>(null);

  React.useEffect(() => {
    fetch("/api/settings/announcement")
      .then((r) => r.json())
      .then((d) => setAnn(d.bar ?? { active: false, message: "", link: "" }))
      .catch(() => {});
    fetchIntegrations();
  }, []);

  function fetchIntegrations() {
    fetch("/api/settings/integrations")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) return;
        const storedA = d.analyticsValue ?? {};
        const customTags: { name: string; content: string }[] = d.verificationValue?.custom ?? [];
        setInts({
          analytics: {
            gtmId: storedA.gtmId ?? d.effective?.analytics?.gtmId ?? "",
            ga4Id: storedA.ga4Id ?? d.effective?.analytics?.ga4Id ?? "",
            fbPixelId: storedA.fbPixelId ?? d.effective?.analytics?.fbPixelId ?? "",
          },
          verification: {
            google: d.verificationValue?.google ?? "",
            facebook: d.verificationValue?.facebook ?? "",
            instagram: d.verificationValue?.instagram ?? "",
            tiktok: d.verificationValue?.tiktok ?? "",
            customText: customTags
              .map((m) => `<meta name="${m.name}" content="${m.content}" />`)
              .join("\n"),
          },
        });
        const effective = d.effective?.analytics ?? {};
        setSavedIds(
          Object.values(effective).filter((v) => typeof v === "string" && v) as string[],
        );
      })
      .catch(() => {});
  }

  async function saveIntegrations(e: React.FormEvent) {
    e.preventDefault();
    setSaving("ints");
    const res = await fetch("/api/settings/integrations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        analytics: ints.analytics,
        verification: {
          google: ints.verification.google,
          facebook: ints.verification.facebook,
          instagram: ints.verification.instagram,
          tiktok: ints.verification.tiktok,
          custom: ints.verification.customText, // raw paste, sanitized server-side
        },
      }),
    });
    const json = await res.json();
    setSaving(null);
    if (res.ok) {
      toast({ title: "Intégrations enregistrées — actives dans ~60s sur tout le site." });
      fetchIntegrations();
    } else {
      toast({ title: json.error || "Erreur", variant: "destructive" });
    }
  }

  async function saveAnnouncement(e: React.FormEvent) {
    e.preventDefault();
    setSaving("ann");
    const res = await fetch("/api/settings/announcement", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ann),
    });
    setSaving(null);
    if (res.ok) toast({ title: "Annonce enregistrée" });
    else toast({ title: "Erreur", variant: "destructive" });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink dark:text-cream">Réglages</h1>
        <p className="mt-1 font-serif text-base text-ink-soft dark:text-cream/70">
          Barre d'annonce, horaires, et intégrations.
        </p>
      </div>

      {/* Announcement bar */}
      <form onSubmit={saveAnnouncement} className="card-vintage rounded-sm p-6">
        <div className="flex items-center gap-3">
          <span className="inline-flex size-10 items-center justify-center rounded-full bg-bronze/15 text-bronze">
            <Megaphone className="size-5" />
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold text-ink dark:text-cream">Barre d'annonce</h2>
            <p className="font-label text-[0.55rem] uppercase tracking-[0.16em] text-bronze">
              Affiche un message en haut du site (dissmissible).
            </p>
          </div>
        </div>
        <div className="mt-5 space-y-4">
          <label className="inline-flex items-center gap-2 font-serif text-sm text-ink-soft dark:text-cream/80">
            <input
              type="checkbox"
              checked={ann.active}
              onChange={(e) => setAnn({ ...ann, active: e.target.checked })}
              className="size-4 accent-terracotta"
            />
            Active
          </label>
          <div>
            <Label className="font-label text-[0.6rem] uppercase tracking-[0.16em] text-bronze">Message</Label>
            <Textarea
              value={ann.message}
              onChange={(e) => setAnn({ ...ann, message: e.target.value })}
              rows={2}
              maxLength={200}
              placeholder="Livraison gratuite à Casablanca ce week-end !"
              className="mt-1.5 rounded-sm border-bronze/45"
            />
          </div>
          <div>
            <Label className="font-label text-[0.6rem] uppercase tracking-[0.16em] text-bronze">Lien (optionnel)</Label>
            <Input
              value={ann.link}
              onChange={(e) => setAnn({ ...ann, link: e.target.value })}
              placeholder="/#collection ou https://…"
              className="mt-1.5 rounded-sm border-bronze/45"
            />
          </div>
          <Button type="submit" disabled={saving === "ann"} className="h-10 rounded-full bg-ink font-label text-[0.68rem] uppercase tracking-[0.16em] text-cream hover:bg-terracotta dark:bg-cream dark:text-ink">
            {saving === "ann" ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
            Enregistrer
          </Button>
        </div>
      </form>

      {/* Store hours (read-only display for now; editing arrives in a later pass) */}
      <div className="card-vintage rounded-sm p-6">
        <div className="flex items-center gap-3">
          <span className="inline-flex size-10 items-center justify-center rounded-full bg-bronze/15 text-bronze">
            <Clock className="size-5" />
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold text-ink dark:text-cream">Horaires</h2>
            <p className="font-label text-[0.55rem] uppercase tracking-[0.16em] text-bronze">
              Atelier de Bouskoura
            </p>
          </div>
        </div>
        <ul className="mt-5 space-y-2">
          {DAYS.map((d) => (
            <li key={d.key} className="flex items-center justify-between border-b border-bronze/15 pb-2 font-serif text-sm">
              <span className="text-ink-soft dark:text-cream/80">{d.label}</span>
              <span className={d.key === "sun" ? "text-terracotta" : "text-ink dark:text-cream"}>
                {d.key === "sun" ? "Fermé" : d.key === "sat" ? "10:00 — 21:00" : "10:00 — 20:00"}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 font-serif text-xs text-ink-soft/70 dark:text-cream/60">
          L'édition des horaires arrive dans une prochaine itération.
        </p>
      </div>

      {/* Integrations: trackers */}
      <form onSubmit={saveIntegrations} className="card-vintage rounded-sm p-6 space-y-8">
        <div className="flex items-center gap-3">
          <span className="inline-flex size-10 items-center justify-center rounded-full bg-bronze/15 text-bronze">
            <Activity className="size-5" />
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold text-ink dark:text-cream">Trackers &amp; mesure</h2>
            <p className="font-label text-[0.55rem] uppercase tracking-[0.16em] text-bronze">
              Actifs seulement si le visiteur accepte les cookies correspondants.
            </p>
          </div>
        </div>

        {savedIds.length > 0 && (
          <p className="font-serif text-xs text-ink-soft/75 dark:text-cream/60">
            IDs effectifs : {savedIds.join(" · ")}
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label className="font-label text-[0.6rem] uppercase tracking-[0.16em] text-bronze">Google Tag Manager</Label>
            <Input
              value={ints.analytics.gtmId}
              onChange={(e) => setInts({ ...ints, analytics: { ...ints.analytics, gtmId: e.target.value } })}
              placeholder="GTM-XXXXXXX"
              className="mt-1.5 rounded-sm border-bronze/45"
            />
          </div>
          <div>
            <Label className="font-label text-[0.6rem] uppercase tracking-[0.16em] text-bronze">Google Analytics 4</Label>
            <Input
              value={ints.analytics.ga4Id}
              onChange={(e) => setInts({ ...ints, analytics: { ...ints.analytics, ga4Id: e.target.value } })}
              placeholder="G-XXXXXXXXXX"
              className="mt-1.5 rounded-sm border-bronze/45"
            />
          </div>
          <div>
            <Label className="font-label text-[0.6rem] uppercase tracking-[0.16em] text-bronze">Pixel Facebook</Label>
            <Input
              value={ints.analytics.fbPixelId}
              onChange={(e) => setInts({ ...ints, analytics: { ...ints.analytics, fbPixelId: e.target.value } })}
              placeholder="123456789012345"
              className="mt-1.5 rounded-sm border-bronze/45"
            />
          </div>
        </div>

        {/* Domain verification */}
        <div className="flex items-center gap-3 pt-2">
          <span className="inline-flex size-10 items-center justify-center rounded-full bg-bronze/15 text-bronze">
            <ShieldCheck className="size-5" />
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold text-ink dark:text-cream">Vérification du domaine</h2>
            <p className="font-label text-[0.55rem] uppercase tracking-[0.16em] text-bronze">
              Collez le code fourni par chaque plateforme.
            </p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {VERIFICATION_HINTS.map((h) => (
            <div key={h.key}>
              <Label className="font-label text-[0.6rem] uppercase tracking-[0.16em] text-bronze">{h.label}</Label>
              <Input
                value={ints.verification[h.key]}
                onChange={(e) =>
                  setInts({
                    ...ints,
                    verification: { ...ints.verification, [h.key]: e.target.value },
                  })
                }
                placeholder={h.meta}
                className="mt-1.5 rounded-sm border-bronze/45 font-mono text-[0.72rem]"
              />
              <p className="mt-1 font-serif text-[0.68rem] text-ink-soft/60 dark:text-cream/50">
                &lt;meta name=&quot;{h.meta}&quot; /&gt; — collez le contenu (ou la balise entière, on extrait le code).
              </p>
            </div>
          ))}
        </div>

        <div>
          <Label className="font-label text-[0.6rem] uppercase tracking-[0.16em] text-bronze">
            Autres balises de vérification (Pinterest, Bing, Clarity…)
          </Label>
          <Textarea
            value={ints.verification.customText}
            onChange={(e) => setInts({ ...ints, verification: { ...ints.verification, customText: e.target.value } })}
            rows={3}
            placeholder={"<meta name=\"p:domain_verify\" content=\"abcdef123456789\" />"}
            className="mt-1.5 rounded-sm border-bronze/45 font-mono text-[0.72rem]"
          />
          <p className="mt-1 font-serif text-[0.68rem] text-ink-soft/60 dark:text-cream/50">
            Une balise par ligne — seul le couple nom/contenu est extrait (l'HTML brut n'est jamais stocké).
          </p>
        </div>

        <Button type="submit" disabled={saving === "ints"} className="h-10 rounded-full bg-ink font-label text-[0.68rem] uppercase tracking-[0.16em] text-cream hover:bg-terracotta dark:bg-cream dark:text-ink">
          {saving === "ints" ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
          Enregistrer les intégrations
        </Button>
      </form>

      {/* SEO files */}
      <div className="card-vintage rounded-sm p-6">
        <div className="flex items-center gap-3">
          <span className="inline-flex size-10 items-center justify-center rounded-full bg-bronze/15 text-bronze">
            <AmazighStar className="size-5" strokeWidth={1.5} />
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold text-ink dark:text-cream">Fichiers SEO</h2>
            <p className="font-label text-[0.55rem] uppercase tracking-[0.16em] text-bronze">
              Auto-générés
            </p>
          </div>
        </div>
        <ul className="mt-5 space-y-2 font-serif text-sm">
          <li className="flex items-center justify-between"><span>robots.txt</span><a href="/robots.txt" target="_blank" className="text-bronze hover:text-terracotta">/robots.txt</a></li>
          <li className="flex items-center justify-between"><span>sitemap.xml</span><a href="/sitemap.xml" target="_blank" className="text-bronze hover:text-terracotta">/sitemap.xml</a></li>
          <li className="flex items-center justify-between"><span>Google Merchant feed</span><a href="/feed.xml" target="_blank" className="text-bronze hover:text-terracotta">/feed.xml</a></li>
          <li className="flex items-center justify-between"><span>LLMs.md</span><a href="/LLMs.md" target="_blank" className="text-bronze hover:text-terracotta">/LLMs.md</a></li>
          <li className="flex items-center justify-between"><span>humans.txt</span><a href="/humans.txt" target="_blank" className="text-bronze hover:text-terracotta">/humans.txt</a></li>
        </ul>
      </div>
    </div>
  );
}
