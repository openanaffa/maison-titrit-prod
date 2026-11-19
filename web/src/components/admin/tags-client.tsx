import { IntegrationsForm } from "@/components/admin/integrations-form";

export function TagsClient() {
	return (
		<div className="space-y-8">
			<div>
				<h1 className="heading-vintage-lg">Tags de suivi</h1>
				<p className="mt-1 body-vintage">
					Pixels et balises marketing — GTM, GA4, Facebook, Pinterest, TikTok,
					YouTube.
				</p>
			</div>
			<IntegrationsForm mode="trackers" />
		</div>
	);
}
