import { cookies } from "next/headers";
import { dictionaries, resolveLocale } from "@/i18n/dictionaries";
import { buildPageMetadata } from "@/lib/seo/build-page.metadata";

export async function generateMetadata() {
	const locale = resolveLocale((await cookies()).get("titrit-locale")?.value);
	return buildPageMetadata({
		title: dictionaries[locale]["pwa.offline.title"],
		description: dictionaries[locale]["pwa.offline.desc"],
		path: "/offline",
		noIndex: true,
	});
}

export default async function OfflinePage() {
	const locale = resolveLocale((await cookies()).get("titrit-locale")?.value);
	const t = (key: string) => dictionaries[locale][key];
	return (
		<main
			id="main-content"
			tabIndex={-1}
			className="vintage-paper flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center"
		>
			<h1 className="heading-vintage-xl">{t("pwa.offline.title")}</h1>
			<p className="mt-4 max-w-md font-serif text-base text-ink-soft dark:text-cream/75">
				{t("pwa.offline.body")}
			</p>
			<a
				href="/"
				className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-ink px-6 font-label text-[0.72rem] uppercase tracking-[0.18em] text-cream transition-colors hover:bg-terracotta focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-terracotta dark:bg-cream dark:text-ink"
			>
				{t("pwa.offline.cta")}
			</a>
		</main>
	);
}
