import type { Metadata } from "next";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import {
	AmazighStar,
	OrnamentDivider,
	Reveal,
} from "@/components/maison/motifs";
import { resolveLocale } from "@/i18n/dictionaries";
import { getPublishedArticles } from "@/lib/blog";
import { buildPageMetadata } from "@/lib/seo/build-page.metadata";

export const metadata: Metadata = buildPageMetadata({
	title: "Journal — Histoires & héritage amazigh",
	description:
		"Héritage amazigh, mode modeste et savoir-faire marocain. Les histoires de Maison Titrit — caftans, broderie, Made in Morocco.",
	path: "/blog",
	keywords: [
		"journal mode modeste",
		"héritage amazigh",
		"savoir-faire marocain",
		"Made in Morocco",
		"caftan",
		"broderie",
	],
});

export default async function BlogPage() {
	const locale = resolveLocale((await cookies()).get("titrit-locale")?.value);
	const posts = await getPublishedArticles(locale);

	return (
		<section className="vintage-paper min-h-[80vh] py-16 sm:py-20">
			<div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
				<Reveal className="text-center">
					<AmazighStar className="mx-auto size-9 text-terracotta" />
					<p className="eyebrow mt-4">Le journal</p>
					<h1 className="wordmark mt-3 text-4xl uppercase text-ink sm:text-5xl dark:text-cream">
						Histoires & héritage
					</h1>
					<OrnamentDivider className="mt-5" width={200} />
					<p className="mx-auto mt-5 max-w-xl font-serif text-lg leading-relaxed text-ink-soft dark:text-cream/75">
						Héritage amazigh, mode modeste et savoir-faire marocain — les
						histoires qui guident chaque fil de nos pièces.
					</p>
				</Reveal>

				<div className="mt-14 space-y-10">
					{posts.length === 0 && (
						<p className="text-center font-serif text-lg text-ink-soft dark:text-cream/70">
							Aucun article pour l'instant. Revenez bientôt.
						</p>
					)}
					{posts.map((post, i) => (
						<Reveal key={post.id} delay={i * 0.08}>
							<article className="card-vintage group overflow-hidden rounded-sm sm:flex">
								{post.coverImage && (
									<Link
										href={`/blog/${post.slug}`}
										className="relative block h-48 w-full overflow-hidden sm:h-auto sm:w-56 sm:shrink-0"
									>
										<Image
											src={post.coverImage}
											alt={post.title}
											fill
											sizes="(min-width: 640px) 14rem, 100vw"
											className="object-cover"
										/>
									</Link>
								)}
								<div className="p-6 sm:p-8">
									<p className="font-label text-[0.62rem] uppercase tracking-[0.2em] text-ink">
										{post.publishedAt
											? new Date(post.publishedAt).toLocaleDateString("fr-FR", {
													day: "numeric",
													month: "long",
													year: "numeric",
												})
											: ""}
										{post.tags
											? ` · ${post.tags.split(",").slice(0, 2).join(", ")}`
											: ""}
									</p>
									<h2 className="mt-2 heading-vintage-md">
										<Link
											href={`/blog/${post.slug}`}
											className="hover:text-terracotta"
										>
											{post.title}
										</Link>
									</h2>
									<p className="mt-3 font-serif text-base leading-relaxed text-ink-soft dark:text-cream/75">
										{post.excerpt}
									</p>
									<Link
										href={`/blog/${post.slug}`}
										className="mt-4 inline-flex items-center gap-1 font-label text-[0.66rem] uppercase tracking-[0.18em] text-ink transition-colors hover:text-terracotta"
									>
										Lire la suite →
									</Link>
								</div>
							</article>
						</Reveal>
					))}
				</div>
			</div>
		</section>
	);
}
