/* ============================================================================
 *  Strapi CMS client — /api/articles + /api/lookbooks (public, read-only)
 *
 *  Production CMS lives behind Cloudflare at NEXT_PUBLIC_CMS_URL (default
 *  https://cms.maisontitrit.com). Drafts never leak: draft-and-publish types
 *  only expose published entries; status=published is sent explicitly anyway.
 *  shortcut: lists cap at 100 entries (Strapi maxLimit), paginate past that.
 *
 *  Responses are cached with Next's fetch cache: tag "cms", ISR 5 min.
 *  Publishing from the CMS can purge immediately by POSTing to
 *  /api/cms/revalidate with the CMS_REVALIDATE_TOKEN secret header.
 * ===========================================================================*/

export const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL ?? "https://cms.maisontitrit.com";

/** Blog article as the UI consumes it (mirrors the old Prisma `Article`). */
export type CmsArticle = {
  id: string; // Strapi documentId (stable across schema syncs)
  slug: string;
  title: string;
  excerpt: string;
  /** Markdown body (richtext), rendered by @/components/maison/article-body. */
  body: string | null;
  /** Absolute URL of the cover image, or null. */
  coverImage: string | null;
  authorName: string;
  /** Comma-separated tag string, as rendered by the blog grid. */
  tags: string;
  publishedAt: Date | null;
  updatedAt: Date;
};

/** Seasonal lookbook entry (title/slug/season/description/cover/gallery). */
export type CmsLookbook = {
  id: string;
  slug: string;
  title: string;
  season: string | null;
  description: string | null;
  coverImage: string | null;
  gallery: string[];
  publishedAt: Date | null;
  updatedAt: Date;
};

type StrapiListResponse<T> = {
  data?: Array<T & { id?: number | string; documentId?: string }>;
  error?: { message?: string };
};

type StrapiArticleAttrs = {
  title?: string;
  slug?: string;
  excerpt?: string | null;
  body?: string | null;
  author?: string | null;
  tags?: string | null;
  cover?: { url?: string; alternativeText?: string | null } | null;
  publishedAt?: string | null;
  updatedAt?: string | null;
  createdAt?: string | null;
};

type StrapiLookbookAttrs = {
  title?: string;
  slug?: string;
  season?: string | null;
  description?: string | null;
  cover?: { url?: string } | null;
  gallery?: Array<{ url?: string }> | null;
  publishedAt?: string | null;
  updatedAt?: string | null;
  createdAt?: string | null;
};

/** Resolve a Strapi media URL to an absolute one. */
function mediaUrl(field: { url?: string } | null | undefined): string | null {
  if (!field?.url) return null;
  if (/^https?:\/\//i.test(field.url)) return field.url;
  return `${CMS_URL}${field.url.startsWith("/") ? "" : "/"}${field.url}`;
}

function toDate(iso: string | null | undefined, fallback: Date): Date {
  const d = iso ? new Date(iso) : null;
  return d && !Number.isNaN(d.getTime()) ? d : fallback;
}

function fetchCms<T>(
  path: string,
): Promise<StrapiListResponse<T> | null> {
  return fetch(`${CMS_URL}${path}`, {
    // ISR: re-issued at most every 5 min; purgable via revalidateTag("cms")
    next: { tags: ["cms"], revalidate: 300 },
  })
    .then((res) => (res.ok ? (res.json() as Promise<StrapiListResponse<T>>) : null))
    .catch((err) => {
      console.error(`CMS fetch failed for ${path}`, err);
      return null;
    });
}

/** Newest-first list of published articles. */
export async function fetchCmsArticles(): Promise<CmsArticle[]> {
  const json = await fetchCms<StrapiArticleAttrs>(
    "/api/articles?populate=cover&sort=publishedAt:desc&status=published&pagination[pageSize]=100",
  );
  if (!json?.data) return [];
  return json.data.map((entry) => {
    const a = entry;
    const fallbackDate = toDate(a.updatedAt ?? a.createdAt, new Date(0));
    return {
      id: String(entry.documentId ?? entry.id ?? ""),
      slug: a.slug ?? "",
      title: a.title ?? "",
      excerpt: a.excerpt ?? "",
      body: a.body ?? null,
      coverImage: mediaUrl(a.cover),
      authorName: a.author || "Maison Titrit",
      tags: a.tags ?? "",
      publishedAt: a.publishedAt ? new Date(a.publishedAt) : null,
      updatedAt: fallbackDate,
    };
  }).filter((a) => a.slug && a.title);
}

/** One published article by slug, or null (404-safe). */
export async function fetchCmsArticleBySlug(slug: string): Promise<CmsArticle | null> {
  if (!/^[a-z0-9-]+$/i.test(slug)) return null;
  const json = await fetchCms<StrapiArticleAttrs>(
    `/api/articles?filters[slug][$eq]=${encodeURIComponent(slug)}&populate=cover&status=published&pagination[pageSize]=1`,
  );
  const raw = json?.data?.[0];
  if (!raw) return null;
  const a = raw;
  const fallbackDate = toDate(a.updatedAt ?? a.createdAt, new Date(0));
  return {
    id: String(raw.documentId ?? raw.id ?? ""),
    slug: a.slug ?? "",
    title: a.title ?? "",
    excerpt: a.excerpt ?? "",
    body: a.body ?? null,
    coverImage: mediaUrl(a.cover),
    authorName: a.author || "Maison Titrit",
    tags: a.tags ?? "",
    publishedAt: a.publishedAt ? new Date(a.publishedAt) : null,
    updatedAt: fallbackDate,
  };
}

/** Published lookbooks, newest-first (for the future lookbook section). */
export async function fetchCmsLookbooks(): Promise<CmsLookbook[]> {
  const json = await fetchCms<StrapiLookbookAttrs>(
    "/api/lookbooks?populate=cover&populate=gallery&sort=publishedAt:desc&status=published&pagination[pageSize]=100",
  );
  if (!json?.data) return [];
  return json.data
    .map((l) => {
      const fallbackDate = toDate(l.updatedAt ?? l.createdAt, new Date(0));
      return {
        id: String(l.documentId ?? l.id ?? ""),
        slug: l.slug ?? "",
        title: l.title ?? "",
        season: l.season ?? null,
        description: l.description ?? null,
        coverImage: mediaUrl(l.cover),
        gallery: (l.gallery ?? [])
          .map((g) => mediaUrl(g))
          .filter((u): u is string => Boolean(u)),
        publishedAt: l.publishedAt ? new Date(l.publishedAt) : null,
        updatedAt: fallbackDate,
      };
    })
    // description feeds the editorial block; slug/title must exist to link
    .filter((l) => l.slug && l.title);
}
