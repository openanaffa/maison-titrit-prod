"use client";

import * as React from "react";
import { Megaphone, Clock, Loader2, Check } from "lucide-react";
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

export default function SettingsClient() {
  const { toast } = useToast();
  const [ann, setAnn] = React.useState({ active: false, message: "", link: "" });
  const [saving, setSaving] = React.useState<"ann" | "hours" | null>(null);

  React.useEffect(() => {
    fetch("/api/settings/announcement")
      .then((r) => r.json())
      .then((d) => setAnn(d.bar ?? { active: false, message: "", link: "" }))
      .catch(() => {});
  }, []);

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
