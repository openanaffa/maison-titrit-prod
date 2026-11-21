import { buildPageMetadata } from "@/lib/seo/build-page.metadata";

export const metadata = buildPageMetadata({
	title: "Hors ligne",
	description:
		"Vous êtes actuellement hors ligne. Certaines pages restent disponibles.",
	path: "/offline",
	noIndex: true,
});

export default function OfflinePage() {
	return (
		<main
			id="main-content"
			tabIndex={-1}
			className="vintage-paper flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center"
		>
			<h1 className="heading-vintage-xl">Hors ligne</h1>
			<p className="mt-4 max-w-md font-serif text-base text-ink-soft dark:text-cream/75">
				La connexion est indisponible. Les pages déjà consultées et le catalogue
				mis en cache restent accessibles. Reconnectez-vous pour actualiser.
			</p>
			<a
				href="/"
				className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-ink px-6 font-label text-[0.72rem] uppercase tracking-[0.18em] text-cream transition-colors hover:bg-terracotta focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-terracotta dark:bg-cream dark:text-ink"
			>
				Retour à l&apos;accueil
			</a>
		</main>
	);
}
