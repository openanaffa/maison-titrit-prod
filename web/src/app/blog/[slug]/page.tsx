import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchCmsArticleBySlug } from "@/lib/cms";
import { AmazighStar, OrnamentDivider, Reveal } from "@/components/maison/motifs";
import { ArticleBody } from "@/components/maison/article-body";
import { buildPageMetadata, articleJsonLd } from "@/lib/seo";

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchCmsArticleBySlug(slug);
  if (!post) return { title: "Article introuvable", robots: { index: false, follow: false } };
  return buildPageMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    image: post.coverImage ?? "/og-default.png",
    ogType: "article",
    publishedTime: post.publishedAt?.toISOString(),
    modifiedTime: post.updatedAt.toISOString(),
    author: post.authorName,
    keywords: post.tags ? post.tags.split(",").map((t) => t.trim()) : undefined,
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const post = await fetchCmsArticleBySlug(slug);
  if (!post) notFound();

  const jsonLd = articleJsonLd({
    slug: post.slug,
    title: post.title,
    description: post.excerpt,
    image: post.coverImage ?? undefined,
    publishedTime: (post.publishedAt ?? post.updatedAt).toISOString(),
    modifiedTime: post.updatedAt.toISOString(),
    author: post.authorName,
  });

  return (
    <article className="vintage-paper min-h-[80vh] py-12 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1 font-label text-[0.62rem] uppercase tracking-[0.18em] text-bronze hover:text-terracotta"
        >
          ← Journal
        </Link>

        <Reveal className="mt-6 text-center">
          <AmazighStar className="mx-auto size-8 text-terracotta" />
          <h1 className="wordmark mt-4 text-3xl uppercase text-ink sm:text-4xl dark:text-cream">
            {post.title}
          </h1>
          <p className="mt-3 font-label text-[0.62rem] uppercase tracking-[0.2em] text-bronze">
            {post.publishedAt
              ? new Date(post.publishedAt).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : ""}
            {post.tags ? ` · ${post.tags.split(",").join(" · ")}` : ""}
          </p>
          <OrnamentDivider className="mt-5" width={180} />
        </Reveal>

        {post.coverImage && (
          <Reveal delay={0.08} className="mt-8">
            <div className="vintage-frame overflow-hidden rounded-sm">
              <img
                src={post.coverImage}
                alt={post.title}
                className="aspect-[16/9] w-full object-cover"
              />
            </div>
          </Reveal>
        )}

        <Reveal delay={0.12} className="mt-8">
          <ArticleBody markdown={post.body ?? ""} />
        </Reveal>

        <div className="mt-10 border-t border-bronze/25 pt-6 text-center">
          <p className="font-serif text-sm italic text-ink-soft/80 dark:text-cream/60">
            {post.authorName} — 100% Made in Morocco 🇲🇦
          </p>
          <Link
            href="/blog"
            className="mt-4 inline-flex items-center gap-1 font-label text-[0.62rem] uppercase tracking-[0.18em] text-bronze hover:text-terracotta"
          >
            ← Tous les articles
          </Link>
        </div>
      </div>
    </article>
  );
}
