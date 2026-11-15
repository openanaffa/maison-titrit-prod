import { IntegrationsForm } from "@/components/admin/integrations-form";

export function TagsClient() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink dark:text-cream">Tags de suivi</h1>
        <p className="mt-1 font-serif text-base text-ink-soft dark:text-cream/70">
          Pixels et balises marketing — GTM, GA4, Facebook, Pinterest, TikTok, YouTube.
        </p>
      </div>
      <IntegrationsForm mode="trackers" />
    </div>
  );
}
