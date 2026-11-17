import { faqSchema, localBusinessSchema, websiteSchema } from "@/lib/json-ld";
import { serializeJsonLd } from "@/lib/serialize-json-ld";

/**
 * Global JSON-LD — rendered once in <head> via layout.tsx.
 * Emits Organization/LocalBusiness + WebSite + FAQPage structured data so
 * search engines can show rich results (store info, hours, FAQs, sitelinks).
 */
export function SiteJsonLd() {
	const blocks = [
		["local-business", localBusinessSchema()],
		["website", websiteSchema()],
		["faq", faqSchema()],
	] as const;
	return (
		<>
			{blocks.map(([name, schema]) => (
				<script
					key={name}
					type="application/ld+json"
					// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD requires an inline script
					dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }}
				/>
			))}
		</>
	);
}
