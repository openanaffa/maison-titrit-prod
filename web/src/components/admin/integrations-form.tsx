"use client";

import * as React from "react";
import { Activity, Loader2, Check, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

type AnalyticsForm = { gtmId: string; ga4Id: string; fbPixelId: string; pinterestTagId: string; tiktokPixelId: string; youtubeChannelId: string };
type VerificationForm = {
  google: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  customText: string; // paste <meta …> tags — parsed server-side
};

const EMPTY_ANALYTICS: AnalyticsForm = { gtmId: "", ga4Id: "", fbPixelId: "", pinterestTagId: "", tiktokPixelId: "", youtubeChannelId: "" };
const EMPTY_VERIFICATION: VerificationForm = {
  google: "",
  facebook: "",
  instagram: "",
  tiktok: "",
  customText: "",
};

const VERIFICATION_HINTS: { key: keyof Omit<VerificationForm, "customText">; label: string; meta: string }[] = [
  { key: "google", label: "Google Search Console", meta: "google-site-verification" },
  { key: "facebook", label: "Facebook (Meta)", meta: "facebook-domain-verification" },
  { key: "instagram", label: "Instagram", meta: "instagram-site-verification" },
  { key: "tiktok", label: "TikTok", meta: "tiktok-domain-verification" },
];

/**
 * Trackers + domain-verification integrations editor.
 * mode "trackers" — tags only (MARKETER, /makteb/tags): saves the analytics
 *   key alone; verification inputs are hidden and never sent.
 * mode "full"     — owners (Réglages): trackers + domain verifications.
 */
export function IntegrationsForm({ mode }: { mode: "full" | "trackers" }) {
  const { toast } = useToast();
  const [ints, setInts] = React.useState({
    analytics: EMPTY_ANALYTICS,
    verification: EMPTY_VERIFICATION,
  });
  const [savedIds, setSavedIds] = React.useState<string[]>([]);
  const [saving, setSaving] = React.useState(false);
  const full = mode === "full";

  const loadIntegrations = React.useCallback(() => {
    fetch("/api/settings/integrations")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) return;
        const storedA = d.analyticsValue ?? {};
        const customTags: { name: string; content: string }[] = d.verificationValue?.custom ?? [];
        setInts((prev) => ({
          analytics: {
            gtmId: storedA.gtmId ?? d.effective?.analytics?.gtmId ?? "",
            ga4Id: storedA.ga4Id ?? d.effective?.analytics?.ga4Id ?? "",
            fbPixelId: storedA.fbPixelId ?? d.effective?.analytics?.fbPixelId ?? "",
            pinterestTagId: storedA.pinterestTagId ?? d.effective?.analytics?.pinterestTagId ?? "",
            tiktokPixelId: storedA.tiktokPixelId ?? d.effective?.analytics?.tiktokPixelId ?? "",
            youtubeChannelId: storedA.youtubeChannelId ?? d.effective?.analytics?.youtubeChannelId ?? "",
          },
          verification: full
            ? {
                google: d.verificationValue?.google ?? "",
                facebook: d.verificationValue?.facebook ?? "",
                instagram: d.verificationValue?.instagram ?? "",
                tiktok: d.verificationValue?.tiktok ?? "",
                customText: customTags
                  .map((m) => `<meta name="${m.name}" content="${m.content}" />`)
                  .join("\n"),
              }
            : prev.verification,
        }));
        const effective = d.effective?.analytics ?? {};
        setSavedIds(
          Object.values(effective).filter((v) => typeof v === "string" && v) as string[],
        );
      })
      .catch(() => {});
  }, [full]);

  React.useEffect(() => {
    loadIntegrations();
  }, [loadIntegrations]);

  async function saveIntegrations(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/settings/integrations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        full
          ? {
              analytics: ints.analytics,
              verification: {
                google: ints.verification.google,
                facebook: ints.verification.facebook,
                instagram: ints.verification.instagram,
                tiktok: ints.verification.tiktok,
                custom: ints.verification.customText, // raw paste, sanitized server-side
              },
            }
          : { analytics: ints.analytics },
      ),
    });
    const json = await res.json();
    setSaving(false);
    if (res.ok) {
      toast({ title: full ? "Intégrations enregistrées — actives dans ~60s sur tout le site." : "Tags enregistrés — actifs dans ~60s sur tout le site." });
      loadIntegrations();
    } else {
      toast({ title: json.error || "Erreur", variant: "destructive" });
    }
  }

  return (
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
          <Label htmlFor="int-gtm" className="font-label text-[0.6rem] uppercase tracking-[0.16em] text-bronze">Google Tag Manager</Label>
          <Input
            id="int-gtm"
            value={ints.analytics.gtmId}
            onChange={(e) => setInts({ ...ints, analytics: { ...ints.analytics, gtmId: e.target.value } })}
            placeholder="GTM-XXXXXXX"
            className="mt-1.5 rounded-sm border-bronze/45"
          />
        </div>
        <div>
          <Label htmlFor="int-ga4" className="font-label text-[0.6rem] uppercase tracking-[0.16em] text-bronze">Google Analytics 4</Label>
          <Input
            id="int-ga4"
            value={ints.analytics.ga4Id}
            onChange={(e) => setInts({ ...ints, analytics: { ...ints.analytics, ga4Id: e.target.value } })}
            placeholder="G-XXXXXXXXXX"
            className="mt-1.5 rounded-sm border-bronze/45"
          />
        </div>
        <div>
          <Label htmlFor="int-fb" className="font-label text-[0.6rem] uppercase tracking-[0.16em] text-bronze">Pixel Facebook</Label>
          <Input
            id="int-fb"
            value={ints.analytics.fbPixelId}
            onChange={(e) => setInts({ ...ints, analytics: { ...ints.analytics, fbPixelId: e.target.value } })}
            placeholder="123456789012345"
            className="mt-1.5 rounded-sm border-bronze/45"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label className="font-label text-[0.6rem] uppercase tracking-[0.16em] text-bronze">Pinterest Tag</Label>
          <Input
            value={ints.analytics.pinterestTagId}
            onChange={(e) => setInts({ ...ints, analytics: { ...ints.analytics, pinterestTagId: e.target.value } })}
            placeholder="1234567890123"
            className="mt-1.5 rounded-sm border-bronze/45"
          />
        </div>
        <div>
          <Label className="font-label text-[0.6rem] uppercase tracking-[0.16em] text-bronze">Pixel TikTok</Label>
          <Input
            value={ints.analytics.tiktokPixelId}
            onChange={(e) => setInts({ ...ints, analytics: { ...ints.analytics, tiktokPixelId: e.target.value } })}
            placeholder="1234567890"
            className="mt-1.5 rounded-sm border-bronze/45"
          />
        </div>
        <div>
          <Label className="font-label text-[0.6rem] uppercase tracking-[0.16em] text-bronze">YouTube channel</Label>
          <Input
            value={ints.analytics.youtubeChannelId}
            onChange={(e) => setInts({ ...ints, analytics: { ...ints.analytics, youtubeChannelId: e.target.value } })}
            placeholder="@maison__titrit"
            className="mt-1.5 rounded-sm border-bronze/45"
          />
        </div>
      </div>

      {full && (
        <>
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
                <Label htmlFor={`int-${h.key}`} className="font-label text-[0.6rem] uppercase tracking-[0.16em] text-bronze">{h.label}</Label>
                <Input
                  id={`int-${h.key}`}
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
            <Label htmlFor="int-custom" className="font-label text-[0.6rem] uppercase tracking-[0.16em] text-bronze">
              Autres balises de vérification (Pinterest, Bing, Clarity…)
            </Label>
            <Textarea
              id="int-custom"
              value={ints.verification.customText}
              onChange={(e) => setInts({ ...ints, verification: { ...ints.verification, customText: e.target.value } })}
              rows={3}
              placeholder={"<meta name=\"p:domain_verify\" content=\"abcdef123456789\" />"}
              className="mt-1.5 rounded-sm border-bronze/45 font-mono text-[0.72rem]"
            />
            <p className="mt-1 font-serif text-[0.68rem] text-ink-soft/60 dark:text-cream/50">
              Une balise par ligne — seul le couple nom/contenu est extrait (l&apos;HTML brut n&apos;est jamais stocké).
            </p>
          </div>
        </>
      )}

      <Button type="submit" disabled={saving} className="h-10 rounded-full bg-ink font-label text-[0.68rem] uppercase tracking-[0.16em] text-cream hover:bg-terracotta dark:bg-cream dark:text-ink">
        {saving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
        {full ? "Enregistrer les intégrations" : "Enregistrer les tags"}
      </Button>
    </form>
  );
}
