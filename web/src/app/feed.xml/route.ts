import { db } from "@/lib/db";
import { site } from "@/config/site";

export const dynamic = "force-dynamic";

function baseUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://maisontitrit.com";
}

/** Google Merchant Center XML feed (RSS 2.0 + g: namespace).
 *  Includes in-stock products with id, title, description, link, image_link,
 *  price, availability, brand, condition, GTIN/sku, google_product_category.
 */
export async function GET() {
  const base = baseUrl();
  const products = await db.product.findMany({
    where: { inStock: true },
    include: { category: true, images: { orderBy: { position: "asc" }, take: 1 } },
  });

  const items = products
    .map((p) => {
      const link = `${base}/produit/${p.ref}`;
      const image = p.images[0]?.url
        ? p.images[0].url.startsWith("http")
          ? p.images[0].url
          : `${base}${p.images[0].url}`
        : `${base}/images/maison-titrit/lora-beige.png`;
      const price = (p.salePrice ?? p.price).toFixed(2);
      const description = escapeXml(p.shortStory || p.description || "");
      const title = escapeXml(p.name);
      const gpc = "1604"; // Apparel & Accessories > Clothing

      return `    <item>
      <g:id>${p.ref}</g:id>
      <title>${title}</title>
      <description>${description}</description>
      <link>${link}</link>
      <image_link>${image}</image_link>
      <g:availability>in_stock</g:availability>
      <g:price>${price} ${p.currency}</g:price>
      <g:sale_price>${p.salePrice ? p.salePrice.toFixed(2) + " " + p.currency : ""}</g:sale_price>
      <g:brand>${escapeXml(site.name)}</g:brand>
      <g:condition>new</g:condition>
      <g:gtin>${p.ref}</g:gtin>
      <g:mpn>${p.ref}</g:mpn>
      <g:product_type>${escapeXml(p.category?.name ?? "Modest Fashion")}</g:product_type>
      <g:google_product_category>${gpc}</g:google_product_category>
      <g:identifier_exists>no</g:identifier_exists>
      <g:shipping>
        <g:country>MA</g:country>
        <g:service>Standard</g:service>
        <g:price>0.00 ${p.currency}</g:price>
      </g:shipping>
      <g:custom_label_0>modest fashion</g:custom_label_0>
      <g:custom_label_1>made in morocco</g:custom_label_1>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${escapeXml(site.name)} — Product Feed</title>
    <link>${base}</link>
    <description>Mode modeste pour femmes. 100% Made in Morocco.</description>
    <language>fr</language>
    <last_build_date>${new Date().toUTCString()}</last_build_date>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
