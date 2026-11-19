import { SiteFooter } from "@/components/maison/site-footer";
import { SiteHeader } from "@/components/maison/site-header";

/**
 * Shared chrome for every public page (route group does not affect URLs).
 * One layout instead of per-page header/footer composition — pages inside
 * this group keep state across sibling navigations, per the Next.js layout
 * hierarchy. Auth (/auth) and the backoffice (/makteb) define their own.
 */
export default function SiteLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<>
			<SiteHeader />
			<main id="main-content" tabIndex={-1} className="flex-1 outline-none">
				{children}
			</main>
			<SiteFooter />
		</>
	);
}
