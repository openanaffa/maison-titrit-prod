import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

/**
 * Purge the storefront's CMS fetch cache ("cms" tag) when Strapi publishes.
 * Wire a Strapi webhook (Settings → Webhook) pointing at this URL with the
 * secret header: x-cms-token: <CMS_REVALIDATE_TOKEN>.
 */
export async function POST(req: Request) {
  const expected = process.env.CMS_REVALIDATE_TOKEN;
  const token = req.headers.get("x-cms-token");

  if (!expected || !token || token !== expected) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  revalidateTag("cms", "max");
  return NextResponse.json({ revalidated: true, tag: "cms" });
}
