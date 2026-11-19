import type { Metadata } from "next";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/maison/article-body";
import {
	AmazighStar,
	OrnamentDivider,
	Reveal,
} from "@/components/maison/motifs";
import { resolveLocale } from "@/i18n/dictionaries";
import { getPublishedArticle } from "@/lib/blog";
import { articleJsonLd, buildPageMetadata } from "@/lib/seo/seo";
import { serializeJsonLd } from "@/lib/serialize-json-ld";
import type { SlugParams } from "@/lib/types";

export async function generateMetadata({
	params,
}: {
	params: Promise<SlugParams>;
}): Promise<Metadata> {
	const { slug } = await params;
	const locale = resolveLocale((await cookies()).get("titrit-locale")?.value);
	const post = await getPublishedArticle(slug, locale);
	if (!post)
		return {
			title: "Article introuvable",
			robots: { index: false, follow: false },
		};
	const ogLocale =
		locale === "ar" ? "ar_MA" : locale === "en" ? "en_US" : "fr_MA";
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
		locale: ogLocale,
	});
}

export default async function BlogPostPage({
	params,
}: {
	params: Promise<SlugParams>;
}) {
	const { slug } = await params;
	const locale = resolveLocale((await cookies()).get("titrit-locale")?.value);
	const post = await getPublishedArticle(slug, locale);
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
				// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD requires an inline script
				dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
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
						<div className="vintage-frame relative aspect-[16/9] w-full overflow-hidden rounded-sm">
							<Image
								src={post.coverImage}
								alt={post.title}
								fill
								sizes="(min-width: 768px) 42rem, 100vw"
								className="object-cover"
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
