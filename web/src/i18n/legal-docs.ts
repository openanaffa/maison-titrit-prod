/**
 * ============================================================================
 *  MAISON TITRIT â€” LEGAL DOCUMENT CONTENT (Privacy policy Â· CGV)
 * ----------------------------------------------------------------------------
 *  Long-form legal content lives HERE (not in dictionaries.ts, which carries
 *  short UI strings only). Rendered by components/maison/legal-page.tsx and
 *  indexed publicly at /confidentialite and /cgv.
 *
 *  Content reflects the actual data practices of this codebase (Supabase Auth,
 *  COD checkout fields, consent-gated pixels â€” see config/site.ts `analytics`).
 *  âš ï¸ The return/exchange window (7 days) should be reviewed by the owner
 *  before go-live.
 * ============================================================================
 */
import type { Locale } from "@/i18n/dictionaries";

export type LegalDocKey = "privacy" | "terms";

export type LegalSection = {
	h: string;
	p: string[];
};

export type LegalDoc = {
	eyebrow: string;
	title: string;
	/** Full "last updated" line, already localized. */
	updated: string;
	intro: string;
	sections: LegalSection[];
	/** Cross-links rendered at the bottom of the document. */
	related: { label: string; href: string }[];
};

export const legalDocs: Record<Locale, Record<LegalDocKey, LegalDoc>> = {
	/* ====================================================================== */
	/* FR â€” default locale                                                    */
	/* ====================================================================== */
	fr: {
		privacy: {
			eyebrow: "Informations lÃ©gales",
			title: "Politique de confidentialitÃ©",
			updated: "Mis Ã  jour le 14 novembre 2026",
			intro:
				"Cette politique explique comment Maison Titrit collecte, utilise et protÃ¨ge vos donnÃ©es personnelles lorsque vous utilisez ce site. Elle s'applique conformÃ©ment Ã  la loi marocaine nÂ° 09-08 relative Ã  la protection des donnÃ©es Ã  caractÃ¨re personnel et, lorsque le RGPD s'applique, au RÃ¨glement (UE) 2016/679.",
			sections: [
				{
					h: "1. Responsable du traitement",
					p: [
						"Le responsable du traitement est l'exploitant du site Maison Titrit. Les informations légales et coordonnées vérifiées (lorsqu'elles sont fournies par l'exploitant) sont disponibles dans les mentions légales du site.",
						"Pour toute question relative à vos données personnelles, utilisez les coordonnées de contact/confidentialité vérifiées publiées sur le site.",
					],
				},
				{
					h: "2. DonnÃ©es collectÃ©es",
					p: [
						"Compte â€” l'authentification est assurÃ©e par Supabase Auth. Selon votre mÃ©thode de connexion (Google ou email/mot de passe), nous recevons votre nom, votre adresse email et, avec Google, votre photo de profil. Supabase gÃ¨re vos identifiants; les mots de passe ne sont pas conservÃ©s dans les tables applicatives de Maison Titrit.",
						"Commandes â€” nom, tÃ©lÃ©phone, adresse email (facultative), ville, adresse de livraison, notes ainsi que le dÃ©tail de vos articles. Ces informations sont indispensables pour traiter et livrer votre commande.",
						"Navigation â€” votre panier, votre langue et votre thÃ¨me sont conservÃ©s localement dans votre navigateur. Des journaux techniques (adresse IP, date, pages consultÃ©es) sont conservÃ©s pour la sÃ©curitÃ© du site.",
						"Consentement â€” vos choix en matiÃ¨re de cookies analytiques et marketing.",
					],
				},
				{
					h: "3. FinalitÃ©s du traitement",
					p: [
						"Nous utilisons vos donnÃ©es pour : traiter et livrer vos commandes ; gÃ©rer votre compte ; vous contacter au sujet d'une commande (tÃ©lÃ©phone, WhatsApp, email) ; alerter notre Ã©quipe des nouvelles commandes ; assurer la sÃ©curitÃ© et le fonctionnement du site ; et, uniquement avec votre consentement, mesurer l'audience (Google Analytics) et personnaliser nos campagnes publicitaires (Meta, Pinterest, TikTok).",
					],
				},
				{
					h: "4. Base lÃ©gale du traitement",
					p: [
						"L'exÃ©cution du contrat (votre commande), votre consentement (cookies analytiques et marketing â€” rÃ©vocable Ã  tout moment), notre intÃ©rÃªt lÃ©gitime (sÃ©curitÃ© et fonctionnement du site) et nos obligations lÃ©gales (comptabilitÃ©).",
					],
				},
				{
					h: "5. Destinataires des donnÃ©es",
					p: [
						"Vos donnÃ©es sont hÃ©bergÃ©es par Vercel (site), Supabase (base de donnÃ©es et authentification, Union europÃ©enne), Cloudflare R2 (images) et Brevo (alertes email internes). Les services de mesure d'audience et de publicitÃ© ne sont chargÃ©s qu'aprÃ¨s votre consentement. Le dÃ©tail de votre commande est transmis Ã  notre Ã©quipe via WhatsApp et email pour prÃ©parer l'expÃ©dition.",
						"Nous ne vendons ni ne louons vos donnÃ©es personnelles Ã  des tiers.",
					],
				},
				{
					h: "6. DurÃ©es de conservation",
					p: [
						"Compte â€” jusqu'Ã  la suppression de votre compte. Commandes â€” le temps exigÃ© par la rÃ©glementation comptable et fiscale marocaine. Journaux techniques â€” quelques mois. Consentement â€” jusqu'au retrait de votre choix.",
					],
				},
				{
					h: "7. Vos droits",
					p: [
						"Vous disposez d'un droit d'accès, de rectification, d'effacement, d'opposition et de portabilité de vos données. Exercez-les via les coordonnées de contact/confidentialité vérifiées publiées sur le site ; nous vous répondrons dans les meilleurs délais.",
						"Vous pouvez Ã©galement introduire une rÃ©clamation auprÃ¨s de la Commission Nationale de ContrÃ´le de la Protection des DonnÃ©es Ã  caractÃ¨re Personnel (CNDP â€” cndp.ma).",
					],
				},
				{
					h: "8. Cookies",
					p: [
						"Cookies strictement nÃ©cessaires â€” session, choix de consentement, prÃ©fÃ©rences : toujours actifs, ils permettent au site de fonctionner.",
						"Cookies analytiques et marketing â€” chargÃ©s uniquement si vous les acceptez via le bandeau de consentement. Vous pouvez modifier votre choix Ã  tout moment avec le bouton de prÃ©fÃ©rences affichÃ© en bas Ã  gauche de chaque page.",
					],
				},
				{
					h: "9. SÃ©curitÃ© et transferts hors du Maroc",
					p: [
						"Le site est servi en HTTPS et l'accÃ¨s aux donnÃ©es est restreint aux personnes habilitÃ©es. Certains prestataires (Vercel, Google) sont situÃ©s hors du Maroc ; leurs transferts sont encadrÃ©s par des garanties appropriÃ©es, notamment les clauses contractuelles types de l'Union europÃ©enne lorsque le RGPD s'applique.",
					],
				},
				{
					h: "10. Modifications",
					p: [
						"Cette politique peut Ã©voluer pour reflÃ©ter nos pratiques ou la rÃ©glementation. La date de mise Ã  jour figure en haut de page ; en cas de changement substantiel, nous en informerons sur le site.",
					],
				},
			],
			related: [{ label: "Conditions gÃ©nÃ©rales de vente", href: "/cgv" }],
		},
		terms: {
			eyebrow: "Informations lÃ©gales",
			title: "Conditions gÃ©nÃ©rales de vente",
			updated: "Mis Ã  jour le 14 novembre 2026",
			intro:
				"Les prÃ©sentes conditions rÃ©gissent les ventes conclues sur maisontitrit.com entre Maison Titrit et tout client particulier. Toute commande implique leur acceptation sans rÃ©serve.",
			sections: [
				{
					h: "1. Ã‰diteur du site",
					p: [
						"Le site est édité et exploité par l'exploitant de la marque Maison Titrit. Les mentions légales vérifiées (identité, coordonnées, hébergeur, le cas échéant) sont publiées sur le site lorsqu'elles sont fournies.",
					],
				},
				{
					h: "2. Produits",
					p: [
						"Nos piÃ¨ces sont confectionnÃ©es Ã  la main dans notre atelier de Bouskoura, 100% Made in Morocco. Les photographies sont fidÃ¨les aux articles, mais les couleurs peuvent varier lÃ©gÃ¨rement selon votre Ã©cran. Les articles sont proposÃ©s dans la limite des stocks disponibles ou sur commande.",
					],
				},
				{
					h: "3. Prix",
					p: [
						"Les prix sont indiquÃ©s en dirhams (MAD). Les frais de livraison vous sont communiquÃ©s avant la confirmation de la commande. Nous nous rÃ©servons le droit de modifier nos prix Ã  tout moment ; le prix applicable est celui confirmÃ© lors de votre commande.",
					],
				},
				{
					h: "4. Commandes",
					p: [
						"Vous pouvez commander via le panier du site ou directement sur WhatsApp. Toute commande fait l'objet d'une confirmation par tÃ©lÃ©phone ou WhatsApp. Ã€ dÃ©faut de confirmation, ou en cas d'indisponibilitÃ© de l'article, la commande peut Ãªtre annulÃ©e. Une commande confirmÃ©e est ferme.",
					],
				},
				{
					h: "5. Paiement",
					p: [
						"Le paiement s'effectue Ã  la livraison (COD), en espÃ¨ces, Ã  la rÃ©ception du colis. Aucun paiement n'est encaissÃ© par le site.",
					],
				},
				{
					h: "6. Livraison",
					p: [
						"Nous livrons partout au Maroc. Les dÃ©lais sont communiquÃ©s lors de la confirmation selon la destination. Vous Ãªtes responsable de la prÃ©cision de votre adresse de livraison ; en cas d'absence au moment de la livraison, des tentatives supplÃ©mentaires peuvent engendrer des frais Ã  votre charge.",
					],
				},
				{
					// TODO(owner): confirm the 7-day return/exchange window is the intended policy.
					h: "7. Ã‰changes et retours",
					p: [
						"Vous disposez de 7 jours Ã  compter de la rÃ©ception pour demander un Ã©change ou un retour, Ã  condition que la piÃ¨ce soit non portÃ©e, non lavÃ©e, avec ses Ã©tiquettes et munie d'une preuve d'achat. Les frais de retour sont Ã  votre charge, sauf dÃ©faut ou erreur de notre part â€” dans ce cas, Maison Titrit prend en charge l'Ã©change ou le remboursement.",
						"Pour toute rÃ©clamation, contactez-nous sur WhatsApp ou par email en prÃ©cisant votre numÃ©ro de commande.",
					],
				},
				{
					h: "8. Garanties",
					p: [
						"En cas de dÃ©faut de fabrication ou de non-conformitÃ©, contactez-nous avec des photos de l'article. Selon le cas, nous proposerons un Ã©change, une rÃ©paration ou un remboursement, conformÃ©ment Ã  la rÃ©glementation marocaine de protection du consommateur.",
					],
				},
				{
					h: "9. PropriÃ©tÃ© intellectuelle",
					p: [
						"Le site, son contenu, le logo, les motifs amazighs, les modÃ¨les et les photographies sont la propriÃ©tÃ© exclusive de Maison Titrit. Toute reproduction, totale ou partielle, sans autorisation Ã©crite est interdite.",
					],
				},
				{
					h: "10. ResponsabilitÃ©",
					p: [
						"Le site est fourni Â« en l'Ã©tat Â». Maison Titrit ne saurait Ãªtre tenue responsable des interruptions, erreurs ou omissions indÃ©pendantes de sa volontÃ©, ni des contenus des sites tiers vers lesquels nous renvoyons (WhatsApp, cartes). Aucune responsabilitÃ© ne peut Ãªtre engagÃ©e en cas de force majeure.",
					],
				},
				{
					h: "11. DonnÃ©es personnelles",
					p: [
						"Le traitement de vos donnÃ©es personnelles est dÃ©crit dans notre Politique de confidentialitÃ©, accessible en bas de page.",
					],
				},
				{
					h: "12. Droit applicable et litiges",
					p: [
						"Les prÃ©sentes conditions sont rÃ©gies par le droit marocain. En cas de litige, les tribunaux de Casablanca sont seuls compÃ©tents. Nous vous invitons d'abord Ã  nous contacter afin de rechercher une solution amiable.",
					],
				},
			],
			related: [
				{ label: "Politique de confidentialitÃ©", href: "/confidentialite" },
			],
		},
	},

	/* ====================================================================== */
	/* AR                                                                     */
	/* ====================================================================== */
	ar: {
		privacy: {
			eyebrow: "Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ù‚Ø§Ù†ÙˆÙ†ÙŠØ©",
			title: "Ø³ÙŠØ§Ø³Ø© Ø§Ù„Ø®ØµÙˆØµÙŠØ©",
			updated: "Ø¢Ø®Ø± ØªØ­Ø¯ÙŠØ«: 14 Ù†ÙˆÙÙ…Ø¨Ø± 2026",
			intro:
				"ØªÙˆØ¶Ø­ Ù‡Ø°Ù‡ Ø§Ù„Ø³ÙŠØ§Ø³Ø© ÙƒÙŠÙÙŠØ© Ø¬Ù…Ø¹ Ù…ÙŠØ²ÙˆÙ† ØªÙŠØªØ±ÙŠØª Ù„Ø¨ÙŠØ§Ù†Ø§ØªÙƒ Ø§Ù„Ø´Ø®ØµÙŠØ© ÙˆØ§Ø³ØªØ®Ø¯Ø§Ù…Ù‡Ø§ ÙˆØ­Ù…Ø§ÙŠØªÙ‡Ø§ Ø¹Ù†Ø¯ Ø§Ø³ØªØ®Ø¯Ø§Ù…Ùƒ Ù„Ù‡Ø°Ø§ Ø§Ù„Ù…ÙˆÙ‚Ø¹. ÙˆÙ‡ÙŠ ØªÙØ·Ø¨ÙŽÙ‘Ù‚ ÙˆÙÙ‚Ù‹Ø§ Ù„Ù„Ù‚Ø§Ù†ÙˆÙ† Ø§Ù„Ù…ØºØ±Ø¨ÙŠ Ø±Ù‚Ù… 09-08 Ø§Ù„Ù…ØªØ¹Ù„Ù‚ Ø¨Ø­Ù…Ø§ÙŠØ© Ø§Ù„Ø£Ø´Ø®Ø§Øµ Ø§Ù„Ø°Ø§ØªÙŠÙŠÙ† Ù…Ù† Ù…Ø¹Ø§Ù„Ø¬Ø© Ø§Ù„Ù…Ø¹Ø·ÙŠØ§Øª Ø°Ø§Øª Ø§Ù„Ø·Ø§Ø¨Ø¹ Ø§Ù„Ø´Ø®ØµÙŠØŒ ÙˆÙˆÙÙ‚Ù‹Ø§ Ù„Ù„Ø§Ø¦Ø­Ø© Ø§Ù„Ø¹Ø§Ù…Ø© Ù„Ø­Ù…Ø§ÙŠØ© Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª (GDPR) Ø¹Ù†Ø¯ Ø§Ù†Ø·Ø¨Ø§Ù‚Ù‡Ø§.",
			sections: [
				{
					h: "1. Ù…Ø³Ø¤ÙˆÙ„ Ø§Ù„Ù…Ø¹Ø§Ù„Ø¬Ø©",
					p: [
						"المسؤول عن المعالجة هو مُشغِّل موقع Maison Titrit. تتوفر المعلومات القانونية وبيانات الاتصال الموثوقة (عند توفيرها من المُشغِّل) ضمن الإشعارات القانونية للموقع.",
						"لأي سؤال يتعلق ببياناتك الشخصية، يرجى استخدام بيانات الاتصال/الخصوصية الموثوقة المنشورة على الموقع.",
					],
				},
				{
					h: "2. Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ù…Ø¬Ù…ÙŽÙ‘Ø¹Ø©",
					p: [
						"Ø§Ù„Ø­Ø³Ø§Ø¨ â€” ØªØªÙ… Ø§Ù„Ù…ØµØ§Ø¯Ù‚Ø© Ø¹Ø¨Ø± Supabase Auth. Ø¨Ø­Ø³Ø¨ Ø·Ø±ÙŠÙ‚Ø© ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ (Google Ø£Ùˆ Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ ÙˆÙƒÙ„Ù…Ø© Ø§Ù„Ù…Ø±ÙˆØ±)ØŒ Ù†Ø³ØªÙ‚Ø¨Ù„ Ø§Ø³Ù…Ùƒ ÙˆØ¹Ù†ÙˆØ§Ù† Ø¨Ø±ÙŠØ¯Ùƒ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠØŒ ÙˆØµÙˆØ±Ø© Ù…Ù„ÙÙƒ Ø§Ù„Ø´Ø®ØµÙŠ Ø¹Ù†Ø¯ Ø§Ø³ØªØ®Ø¯Ø§Ù… Google. ØªØ¯ÙŠØ± Supabase Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø§Ø¹ØªÙ…Ø§Ø¯ ÙˆÙ„Ø§ Ù†Ø®Ø²Ù† ÙƒÙ„Ù…Ø§Øª Ø§Ù„Ù…Ø±ÙˆØ± ÙÙŠ Ø¬Ø¯Ø§ÙˆÙ„ ØªØ·Ø¨ÙŠÙ‚ Maison Titrit.",
						"Ø§Ù„Ø·Ù„Ø¨Ø§Øª â€” Ø§Ù„Ø§Ø³Ù…ØŒ Ø§Ù„Ù‡Ø§ØªÙØŒ Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¥Ù„ÙƒØªØ±ÙˆÙ†ÙŠ (Ø§Ø®ØªÙŠØ§Ø±ÙŠ)ØŒ Ø§Ù„Ù…Ø¯ÙŠÙ†Ø©ØŒ Ø¹Ù†ÙˆØ§Ù† Ø§Ù„ØªÙˆØµÙŠÙ„ØŒ Ø§Ù„Ù…Ù„Ø§Ø­Ø¸Ø§Øª ÙˆØªÙØ§ØµÙŠÙ„ Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª. Ù‡Ø°Ù‡ Ø§Ù„Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø¶Ø±ÙˆØ±ÙŠØ© Ù„Ù…Ø¹Ø§Ù„Ø¬Ø© Ø·Ù„Ø¨Ùƒ ÙˆØªÙˆØµÙŠÙ„Ù‡.",
						"Ø§Ù„ØªØµÙØ­ â€” ÙŠÙØ­ÙØ¸ Ø³Ù„Ø© Ø§Ù„ØªÙØ¶ÙŠÙ„Ø§Øª ÙˆÙ„ØºØªÙƒ ÙˆØ³Ù…ØªÙƒ Ù…Ø­Ù„ÙŠÙ‹Ø§ ÙÙŠ Ù…ØªØµÙØ­Ùƒ. ÙƒÙ…Ø§ Ù†Ø­ØªÙØ¸ Ø¨Ø³Ø¬Ù„Ø§Øª ØªÙ‚Ù†ÙŠØ© (Ø¹Ù†ÙˆØ§Ù† IPØŒ Ø§Ù„ØªØ§Ø±ÙŠØ®ØŒ Ø§Ù„ØµÙØ­Ø§Øª Ø§Ù„Ù…Ø²Ø§Ø±Ø©) Ù„Ø­Ù…Ø§ÙŠØ© Ø§Ù„Ù…ÙˆÙ‚Ø¹.",
						"Ø§Ù„Ù…ÙˆØ§ÙÙ‚Ø© â€” Ø§Ø®ØªÙŠØ§Ø±Ø§ØªÙƒ Ø¨Ø´Ø£Ù† Ù…Ù„ÙØ§Øª ØªØ¹Ø±ÙŠÙ Ø§Ù„Ø§Ø±ØªØ¨Ø§Ø· Ø§Ù„ØªØ­Ù„ÙŠÙ„ÙŠØ© ÙˆØ§Ù„ØªØ³ÙˆÙŠÙ‚ÙŠØ©.",
					],
				},
				{
					h: "3. Ø£ØºØ±Ø§Ø¶ Ø§Ù„Ù…Ø¹Ø§Ù„Ø¬Ø©",
					p: [
						"Ù†Ø³ØªØ®Ø¯Ù… Ø¨ÙŠØ§Ù†Ø§ØªÙƒ Ù…Ù† Ø£Ø¬Ù„: Ù…Ø¹Ø§Ù„Ø¬Ø© Ø·Ù„Ø¨Ø§ØªÙƒ ÙˆØªÙˆØµÙŠÙ„Ù‡Ø§Ø› Ø¥Ø¯Ø§Ø±Ø© Ø­Ø³Ø§Ø¨ÙƒØ› Ø§Ù„ØªÙˆØ§ØµÙ„ Ù…Ø¹Ùƒ Ø¨Ø®ØµÙˆØµ Ø·Ù„Ø¨Ùƒ (Ø§Ù„Ù‡Ø§ØªÙØŒ ÙˆØ§ØªØ³Ø§Ø¨ØŒ Ø§Ù„Ø¨Ø±ÙŠØ¯)Ø› Ø¥Ø¹Ù„Ø§Ù… ÙØ±ÙŠÙ‚Ù†Ø§ Ø¨Ø§Ù„Ø·Ù„Ø¨Ø§Øª Ø§Ù„Ø¬Ø¯ÙŠØ¯Ø©Ø› Ø¶Ù…Ø§Ù† Ø£Ù…Ù† Ø§Ù„Ù…ÙˆÙ‚Ø¹ ÙˆØªØ´ØºÙŠÙ„Ù‡Ø› ÙˆÙÙ‚Ø· Ø¨Ù…ÙˆØ§ÙÙ‚ØªÙƒØŒ Ù‚ÙŠØ§Ø³ Ø¹Ø¯Ø¯ Ø§Ù„Ø²ÙˆØ§Ø± (Google Analytics) ÙˆØªØ®ØµÙŠØµ Ø­Ù…Ù„Ø§ØªÙ†Ø§ Ø§Ù„Ø¥Ø¹Ù„Ø§Ù†ÙŠØ© (Meta ÙˆPinterest ÙˆTikTok).",
					],
				},
				{
					h: "4. Ø§Ù„Ø£Ø³Ø§Ø³ Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠ Ù„Ù„Ù…Ø¹Ø§Ù„Ø¬Ø©",
					p: [
						"ØªÙ†ÙÙŠØ° Ø§Ù„Ø¹Ù‚Ø¯ (Ø·Ù„Ø¨Ùƒ)ØŒ Ù…ÙˆØ§ÙÙ‚ØªÙƒ (Ù…Ù„ÙØ§Øª Ø§Ù„Ø§Ø±ØªØ¨Ø§Ø· Ø§Ù„ØªØ­Ù„ÙŠÙ„ÙŠØ© ÙˆØ§Ù„ØªØ³ÙˆÙŠÙ‚ÙŠØ© â€” Ù‚Ø§Ø¨Ù„Ø© Ù„Ù„Ø³Ø­Ø¨ ÙÙŠ Ø£ÙŠ ÙˆÙ‚Øª)ØŒ Ù…ØµÙ„Ø­ØªÙ†Ø§ Ø§Ù„Ù…Ø´Ø±ÙˆØ¹Ø© (Ø£Ù…Ù† Ø§Ù„Ù…ÙˆÙ‚Ø¹ ÙˆØªØ´ØºÙŠÙ„Ù‡) ÙˆØ§Ù„Ø§Ù„ØªØ²Ø§Ù…Ø§Øª Ø§Ù„Ù‚Ø§Ù†ÙˆÙ†ÙŠØ© (Ø§Ù„Ù…Ø­Ø§Ø³Ø¨Ø©).",
					],
				},
				{
					h: "5. Ø§Ù„Ø¬Ù‡Ø§Øª Ø§Ù„Ù…ØªÙ„Ù‚ÙŠØ© Ù„Ù„Ø¨ÙŠØ§Ù†Ø§Øª",
					p: [
						"ØªÙØ³ØªØ¶Ø§Ù Ø¨ÙŠØ§Ù†Ø§ØªÙƒ Ù„Ø¯Ù‰ Vercel (Ø§Ù„Ù…ÙˆÙ‚Ø¹) ÙˆSupabase (Ù‚Ø§Ø¹Ø¯Ø© Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª ÙˆØ§Ù„Ù…ØµØ§Ø¯Ù‚Ø©ØŒ Ø§Ù„Ø§ØªØ­Ø§Ø¯ Ø§Ù„Ø£ÙˆØ±ÙˆØ¨ÙŠ) ÙˆCloudflare R2 (Ø§Ù„ØµÙˆØ±) ÙˆBrevo (ØªÙ†Ø¨ÙŠÙ‡Ø§Øª Ø§Ù„Ø¨Ø±ÙŠØ¯ Ø§Ù„Ø¯Ø§Ø®Ù„ÙŠØ©). ÙˆÙ„Ø§ ØªÙØ­Ù…ÙŽÙ‘Ù„ Ø®Ø¯Ù…Ø§Øª Ù‚ÙŠØ§Ø³ Ø§Ù„Ø¬Ù…Ù‡ÙˆØ± ÙˆØ§Ù„Ø¥Ø¹Ù„Ø§Ù†Ø§Øª Ø¥Ù„Ø§ Ø¨Ø¹Ø¯ Ù…ÙˆØ§ÙÙ‚ØªÙƒ. ÙˆÙŠÙØ±Ø³ÙŽÙ„ ØªÙØ§ØµÙŠÙ„ Ø·Ù„Ø¨Ùƒ Ø¥Ù„Ù‰ ÙØ±ÙŠÙ‚Ù†Ø§ Ø¹Ø¨Ø± ÙˆØ§ØªØ³Ø§Ø¨ ÙˆØ§Ù„Ø¨Ø±ÙŠØ¯ Ù„Ø¥Ø¹Ø¯Ø§Ø¯ Ø§Ù„Ø´Ø­Ù†Ø©.",
						"Ù„Ø§ Ù†Ø¨ÙŠØ¹ Ø¨ÙŠØ§Ù†Ø§ØªÙƒ Ø§Ù„Ø´Ø®ØµÙŠØ© ÙˆÙ„Ø§ Ù†Ø¤Ø¬Ù‘Ø±Ù‡Ø§ Ø¥Ù„Ù‰ Ø£ÙŠ Ø·Ø±Ù Ø«Ø§Ù„Ø«.",
					],
				},
				{
					h: "6. Ù…Ø¯Ø© Ø§Ù„Ø§Ø­ØªÙØ§Ø¸ Ø¨Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª",
					p: [
						"Ø§Ù„Ø­Ø³Ø§Ø¨ â€” Ø­ØªÙ‰ Ø­Ø°Ù Ø­Ø³Ø§Ø¨Ùƒ. Ø§Ù„Ø·Ù„Ø¨Ø§Øª â€” Ø§Ù„Ù…Ø¯Ø© Ø§Ù„ØªÙŠ ØªÙØ±Ø¶Ù‡Ø§ Ø§Ù„Ù„ÙˆØ§Ø¦Ø­ Ø§Ù„Ù…Ø­Ø§Ø³Ø¨ÙŠØ© ÙˆØ§Ù„ fiscale Ø§Ù„Ù…ØºØ±Ø¨ÙŠØ©. Ø§Ù„Ø³Ø¬Ù„Ø§Øª Ø§Ù„ØªÙ‚Ù†ÙŠØ© â€” Ø¨Ø¶Ø¹Ø© Ø£Ø´Ù‡Ø±. Ø§Ù„Ù…ÙˆØ§ÙÙ‚Ø© â€” Ø­ØªÙ‰ Ø³Ø­Ø¨ Ø§Ø®ØªÙŠØ§Ø±Ùƒ.",
					],
				},
				{
					h: "7. Ø­Ù‚ÙˆÙ‚Ùƒ",
					p: [
						"لك الحق في الولوج إلى بياناتك وتصحيحها ومحوها والاعتراض على معالجتها ونقلها. يمكنك ممارسة هذه الحقوق عبر بيانات الاتصال/الخصوصية الموثوقة المنشورة على الموقع، وسنرد في أقرب الآجال.",
						"ÙŠÙ…ÙƒÙ†Ùƒ Ø£ÙŠØ¶Ù‹Ø§ ØªÙ‚Ø¯ÙŠÙ… Ø´ÙƒÙˆÙ‰ Ù„Ø¯Ù‰ Ø§Ù„Ù„Ø¬Ù†Ø© Ø§Ù„ÙˆØ·Ù†ÙŠØ© Ù„Ù„Ø±Ù‚Ø§Ø¨Ø© Ø¹Ù„Ù‰ Ø­Ù…Ø§ÙŠØ© Ø§Ù„Ù…Ø¹Ø·ÙŠØ§Øª Ø°Ø§Øª Ø§Ù„Ø·Ø§Ø¨Ø¹ Ø§Ù„Ø´Ø®ØµÙŠ (CNDP â€” cndp.ma).",
					],
				},
				{
					h: "8. Ù…Ù„ÙØ§Øª ØªØ¹Ø±ÙŠÙ Ø§Ù„Ø§Ø±ØªØ¨Ø§Ø·",
					p: [
						"Ù…Ù„ÙØ§Øª Ø¶Ø±ÙˆØ±ÙŠØ© Ù„Ù„ØºØ§ÙŠØ© â€” Ø§Ù„Ø¬Ù„Ø³Ø©ØŒ Ø®ÙŠØ§Ø± Ø§Ù„Ù…ÙˆØ§ÙÙ‚Ø©ØŒ Ø§Ù„ØªÙØ¶ÙŠÙ„Ø§Øª: ØªØ¨Ù‚Ù‰ Ù…ÙØ¹ÙŽÙ‘Ù„Ø© Ø¯Ø§Ø¦Ù…Ù‹Ø§ Ù„Ø£Ù†Ù‡Ø§ ØªÙÙ…ÙƒÙ‘Ù† Ø§Ù„Ù…ÙˆÙ‚Ø¹ Ù…Ù† Ø§Ù„Ø¹Ù…Ù„.",
						"Ø§Ù„Ù…Ù„ÙØ§Øª Ø§Ù„ØªØ­Ù„ÙŠÙ„ÙŠØ© ÙˆØ§Ù„ØªØ³ÙˆÙŠÙ‚ÙŠØ© â€” Ù„Ø§ ØªÙØ­Ù…ÙŽÙ‘Ù„ Ø¥Ù„Ø§ Ø¥Ø°Ø§ Ù‚Ø¨Ù„ØªÙ‡Ø§ Ø¹Ø¨Ø± Ø´Ø±ÙŠØ· Ø§Ù„Ù…ÙˆØ§ÙÙ‚Ø©. ÙŠÙ…ÙƒÙ†Ùƒ ØªØºÙŠÙŠØ± Ø§Ø®ØªÙŠØ§Ø±Ùƒ ÙÙŠ Ø£ÙŠ ÙˆÙ‚Øª Ø¹Ø¨Ø± Ø²Ø± Ø§Ù„ØªÙØ¶ÙŠÙ„Ø§Øª Ø§Ù„Ù…ÙˆØ¬ÙˆØ¯ Ø£Ø³ÙÙ„ ÙŠØ³Ø§Ø± ÙƒÙ„ ØµÙØ­Ø©.",
					],
				},
				{
					h: "9. Ø§Ù„Ø£Ù…Ø§Ù† ÙˆØ§Ù„ØªØ­ÙˆÙŠÙ„ Ø®Ø§Ø±Ø¬ Ø§Ù„Ù…ØºØ±Ø¨",
					p: [
						"ÙŠÙÙ‚Ø¯ÙŽÙ‘Ù… Ø§Ù„Ù…ÙˆÙ‚Ø¹ Ø¹Ø¨Ø± HTTPS ÙˆÙŠÙ‚ØªØµØ± Ø§Ù„ÙˆØµÙˆÙ„ Ø¥Ù„Ù‰ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø¹Ù„Ù‰ Ø§Ù„Ù…ØµØ±ÙŽÙ‘Ø­ Ù„Ù‡Ù…. ÙˆØ¨Ø¹Ø¶ Ù…Ø²ÙˆØ¯ÙŠ Ø§Ù„Ø®Ø¯Ù…Ø§Øª (Vercel ÙˆGoogle) ÙŠÙ‚Ø¹ÙˆÙ† Ø®Ø§Ø±Ø¬ Ø§Ù„Ù…ØºØ±Ø¨Ø› ÙˆÙŠÙÙ†Ø¸ÙŽÙ‘Ù… Ù†Ù‚Ù„ Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø¨Ø¶Ù…Ø§Ù†Ø§Øª Ù…Ù†Ø§Ø³Ø¨Ø©ØŒ Ù„Ø§ Ø³ÙŠÙ…Ø§ Ø§Ù„Ø¨Ù†ÙˆØ¯ Ø§Ù„ØªØ¹Ø§Ù‚Ø¯ÙŠØ© Ø§Ù„Ù‚ÙŠØ§Ø³ÙŠØ© Ù„Ù„Ø§ØªØ­Ø§Ø¯ Ø§Ù„Ø£ÙˆØ±ÙˆØ¨ÙŠ Ø¹Ù†Ø¯ Ø§Ù†Ø·Ø¨Ø§Ù‚ GDPR.",
					],
				},
				{
					h: "10. Ø§Ù„ØªØ¹Ø¯ÙŠÙ„Ø§Øª",
					p: [
						"Ù‚Ø¯ ØªØªØ·ÙˆØ± Ù‡Ø°Ù‡ Ø§Ù„Ø³ÙŠØ§Ø³Ø© Ù„ØªØ¹ÙƒØ³ Ù…Ù…Ø§Ø±Ø³Ø§ØªÙ†Ø§ Ø£Ùˆ Ø§Ù„ØªØ´Ø±ÙŠØ¹Ø§Øª. ÙˆÙŠØ¸Ù‡Ø± ØªØ§Ø±ÙŠØ® Ø¢Ø®Ø± ØªØ­Ø¯ÙŠØ« Ø£Ø¹Ù„Ù‰ Ø§Ù„ØµÙØ­Ø©Ø› ÙˆØ³Ù†ÙØ¹Ù„Ù…ÙƒÙ… Ø¹Ù„Ù‰ Ø§Ù„Ù…ÙˆÙ‚Ø¹ Ø¹Ù†Ø¯ Ø£ÙŠ Ø¬ÙˆÙ‡Ø±ÙŠ.",
					],
				},
			],
			related: [{ label: "Ø´Ø±ÙˆØ· Ø§Ù„Ø¨ÙŠØ¹ Ø§Ù„Ø¹Ø§Ù…Ø©", href: "/cgv" }],
		},
		terms: {
			eyebrow: "Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ù‚Ø§Ù†ÙˆÙ†ÙŠØ©",
			title: "Ø´Ø±ÙˆØ· Ø§Ù„Ø¨ÙŠØ¹ Ø§Ù„Ø¹Ø§Ù…Ø©",
			updated: "Ø¢Ø®Ø± ØªØ­Ø¯ÙŠØ«: 14 Ù†ÙˆÙÙ…Ø¨Ø± 2026",
			intro:
				"ØªØ­ÙƒÙ… Ù‡Ø°Ù‡ Ø§Ù„Ø´Ø±ÙˆØ· Ø¹Ù…Ù„ÙŠØ§Øª Ø§Ù„Ø¨ÙŠØ¹ Ø§Ù„ØªÙŠ ØªØªÙ… Ø¹Ø¨Ø± maisontitrit.com Ø¨ÙŠÙ† Ù…ÙŠØ²ÙˆÙ† ØªÙŠØªØ±ÙŠØª ÙˆØ£ÙŠ Ø²Ø¨ÙˆÙ† Ø´Ø®ØµÙŠ. ÙˆÙŠØ´Ù…Ù„ Ø£ÙŠ Ø·Ù„Ø¨ Ù‚Ø¨ÙˆÙ„Ù‡Ø§ Ø¯ÙˆÙ† ØªØ­ÙØ¸.",
			sections: [
				{
					h: "1. Ù…ÙØ­Ø±ÙÙ‘Ø± Ø§Ù„Ù…ÙˆÙ‚Ø¹",
					p: [
						"يُنشر الموقع ويُشغَّل من طرف مُشغِّل علامة Maison Titrit. تُنشر الإشعارات القانونية الموثوقة (الهوية، بيانات الاتصال، المستضيف، عند الاقتضاء) على الموقع عند توفيرها.",
					],
				},
				{
					h: "2. Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª",
					p: [
						"ØªÙÙØµÙŽÙ‘Ù„ Ù‚Ø·Ø¹Ù†Ø§ ÙŠØ¯ÙˆÙŠÙ‹Ø§ ÙÙŠ ÙˆØ±Ø´ØªÙ†Ø§ Ø¨Ø¨ÙˆØ³ÙƒÙˆØ±Ø©ØŒ 100% ØµÙ†Ø¹ ÙÙŠ Ø§Ù„Ù…ØºØ±Ø¨. Ø§Ù„ØµÙˆØ± Ù…Ø·Ø§Ø¨Ù‚Ø© Ù„Ù„Ù…Ù†ØªØ¬Ø§Øª Ù„ÙƒÙ† Ø§Ù„Ø£Ù„ÙˆØ§Ù† Ù‚Ø¯ ØªØ®ØªÙ„Ù Ù‚Ù„ÙŠÙ„Ù‹Ø§ Ø­Ø³Ø¨ Ø´Ø§Ø´ØªÙƒ. ÙˆØªÙÙ‚Ø¯ÙŽÙ‘Ù… Ø§Ù„Ù…Ù†ØªØ¬Ø§Øª Ø­Ø³Ø¨ ØªÙˆÙØ± Ø§Ù„Ù…Ø®Ø²ÙˆÙ† Ø£Ùˆ Ø­Ø³Ø¨ Ø§Ù„Ø·Ù„Ø¨.",
					],
				},
				{
					h: "3. Ø§Ù„Ø£Ø³Ø¹Ø§Ø±",
					p: [
						"Ø§Ù„Ø£Ø³Ø¹Ø§Ø± Ù…Ø¹Ø±ÙˆØ¶Ø© Ø¨Ø§Ù„Ø¯Ø±Ù‡Ù… Ø§Ù„Ù…ØºØ±Ø¨ÙŠ (MAD). ÙˆØªÙØ¨Ù„ÙŽÙ‘Øº Ð²Ð°Ð¼ Ø±Ø³ÙˆÙ… Ø§Ù„ØªÙˆØµÙŠÙ„ Ù‚Ø¨Ù„ ØªØ£ÙƒÙŠØ¯ Ø§Ù„Ø·Ù„Ø¨. ÙˆÙ†Ø­ØªÙØ¸ Ø¨Ø­Ù‚ ØªØ¹Ø¯ÙŠÙ„ Ø£Ø³Ø¹Ø§Ø±Ù†Ø§ ÙÙŠ Ø£ÙŠ ÙˆÙ‚ØªØ› ÙˆØ§Ù„Ø³Ø¹Ø± Ø§Ù„Ù…Ø¹ØªÙ…Ø¯ Ù‡Ùˆ Ø§Ù„Ù…Ø¤ÙƒÙŽÙ‘Ø¯ Ø¹Ù†Ø¯ Ø·Ù„Ø¨Ùƒ.",
					],
				},
				{
					h: "4. Ø§Ù„Ø·Ù„Ø¨Ø§Øª",
					p: [
						"ÙŠÙ…ÙƒÙ†Ùƒ Ø§Ù„Ø·Ù„Ø¨ Ø¹Ø¨Ø± Ø³Ù„Ø© Ø§Ù„Ù…ÙˆÙ‚Ø¹ Ø£Ùˆ Ù…Ø¨Ø§Ø´Ø±Ø© Ø¹Ø¨Ø± ÙˆØ§ØªØ³Ø§Ø¨. ÙˆÙŠÙØ®Ø¶Ø¹ ÙƒÙ„ Ø·Ù„Ø¨ Ù„Ù„ØªØ£ÙƒÙŠØ¯ Ø¹Ø¨Ø± Ø§Ù„Ù‡Ø§ØªÙ Ø£Ùˆ ÙˆØ§ØªØ³Ø§Ø¨. ÙˆØ¹Ù†Ø¯ ØºÙŠØ§Ø¨ Ø§Ù„ØªØ£ÙƒÙŠØ¯ Ø£Ùˆ ØªÙˆÙØ± Ø§Ù„Ù…Ù†ØªØ¬ØŒ Ù‚Ø¯ ÙŠÙÙ„ØºÙ‰ Ø§Ù„Ø·Ù„Ø¨. ÙˆØ§Ù„Ø·Ù„Ø¨ Ø§Ù„Ù…Ø¤ÙƒÙŽÙ‘Ø¯ Ù†Ù‡Ø§Ø¦ÙŠ.",
					],
				},
				{
					h: "5. Ø§Ù„Ø£Ø¯Ø§Ø¡",
					p: [
						"ÙŠÙØ¤Ø¯ÙŽÙ‘Ù‰ Ø§Ù„Ø£Ø¯Ø§Ø¡ Ø¹Ù†Ø¯ Ø§Ù„ØªÙˆØµÙŠÙ„ (COD)ØŒ Ù†Ù‚Ø¯Ù‹Ø§ Ø¹Ù†Ø¯ Ø§Ø³ØªÙ„Ø§Ù… Ø§Ù„Ø·Ø±Ø¯. ÙˆÙ„Ø§ ÙŠØ­ØµÙ‘Ù„ Ø§Ù„Ù…ÙˆÙ‚Ø¹ Ø£ÙŠ Ø¯ÙØ¹Ø© Ù…Ø³Ø¨Ù‚Ù‹Ø§.",
					],
				},
				{
					h: "6. Ø§Ù„ØªÙˆØµÙŠÙ„",
					p: [
						"Ù†ÙˆØµÙ‘Ù„ Ø¥Ù„Ù‰ Ø¬Ù…ÙŠØ¹ Ø£Ù†Ø­Ø§Ø¡ Ø§Ù„Ù…ØºØ±Ø¨. ÙˆØªÙØ¨Ù„ÙŽÙ‘Øº Ø§Ù„Ù…Ø¯Ø¯ Ø¹Ù†Ø¯ Ø§Ù„ØªØ£ÙƒÙŠØ¯ Ø­Ø³Ø¨ Ø§Ù„ÙˆØ¬Ù‡Ø©. ÙˆÙ…Ø³Ø¤ÙˆÙ„ÙŠØªÙƒ Ø¯Ù‚Ø© Ø¹Ù†ÙˆØ§Ù† Ø§Ù„ØªÙˆØµÙŠÙ„Ø› ÙˆØ¹Ù†Ø¯ ØºÙŠØ§Ø¨Ùƒ ÙˆÙ‚Øª Ø§Ù„ØªÙˆØµÙŠÙ„ØŒ Ù‚Ø¯ ØªØ³ØªÙ„Ø²Ù… Ø§Ù„Ù…Ø­Ø§ÙˆÙ„Ø§Øª Ø§Ù„Ø¥Ø¶Ø§ÙÙŠØ© Ø±Ø³ÙˆÙ…Ù‹Ø§ Ø¹Ù„Ù‰ Ø­Ø³Ø§Ø¨Ùƒ.",
					],
				},
				{
					h: "7. Ø§Ù„Ø§Ø³ØªØ¨Ø¯Ø§Ù„ ÙˆØ§Ù„Ø¥Ø±Ø¬Ø§Ø¹",
					p: [
						"ÙŠØ­Ù‚ Ù„Ùƒ Ø®Ù„Ø§Ù„ 7 Ø£ÙŠØ§Ù… Ù…Ù† Ø§Ù„Ø§Ø³ØªÙ„Ø§Ù… Ø·Ù„Ø¨ Ø§Ø³ØªØ¨Ø¯Ø§Ù„ Ø£Ùˆ Ø¥Ø±Ø¬Ø§Ø¹ØŒ Ø´Ø±Ø· Ø£Ù† ØªÙƒÙˆÙ† Ø§Ù„Ù‚Ø·Ø¹Ø© ØºÙŠØ± Ù…Ø³ØªØ¹Ù…Ù„Ø© ÙˆØºÙŠØ± Ù…ØºØ³ÙˆÙ„Ø© ÙˆØ¨Ø·Ø§Ù‚Ø§ØªÙ‡Ø§ Ù…Ø«Ø¨ØªØ© Ù…Ø¹ Ø¥Ø«Ø¨Ø§Øª Ø§Ù„Ø´Ø±Ø§Ø¡. ÙˆØ±Ø³ÙˆÙ… Ø§Ù„Ø¥Ø±Ø¬Ø§Ø¹ Ø¹Ù„Ù‰ Ø­Ø³Ø§Ø¨ÙƒØŒ Ø¥Ù„Ø§ ÙÙŠ Ø­Ø§Ù„ ÙˆØ¬ÙˆØ¯ Ø¹ÙŠØ¨ Ø£Ùˆ Ø®Ø·Ø£ Ù…Ù† Ø¬Ø§Ù†Ø¨Ù†Ø§ â€” ÙÙŠØªÙƒÙÙ„ Ø­ÙŠÙ†Ù‡Ø§ Ù…ÙŠØ²ÙˆÙ† ØªÙŠØªØ±ÙŠØª Ø¨Ø§Ù„Ø§Ø³ØªØ¨Ø¯Ø§Ù„ Ø£Ùˆ Ø§Ù„Ø§Ø³ØªØ±Ø¯Ø§Ø¯.",
						"Ù„Ø£ÙŠ Ø´ÙƒÙˆÙ‰ØŒ Ø±Ø§Ø³Ù„Ù†Ø§ Ø¹Ø¨Ø± ÙˆØ§ØªØ³Ø§Ø¨ Ø£Ùˆ Ø§Ù„Ø¨Ø±ÙŠØ¯ Ù…Ø¹ Ø±Ù‚Ù… Ø·Ù„Ø¨Ùƒ.",
					],
				},
				{
					h: "8. Ø§Ù„Ø¶Ù…Ø§Ù†Ø§Øª",
					p: [
						"ÙÙŠ Ø­Ø§Ù„ ÙˆØ¬ÙˆØ¯ Ø¹ÙŠØ¨ ØªØµÙ†ÙŠØ¹ Ø£Ùˆ Ø¹Ø¯Ù… Ù…Ø·Ø§Ø¨Ù‚Ø©ØŒ Ø±Ø§Ø³Ù„Ù†Ø§ Ø¨ØµÙˆØ± Ø§Ù„Ù…Ù†ØªØ¬. ÙˆØ­Ø³Ø¨ Ø§Ù„Ø­Ø§Ù„Ø©ØŒ Ù†Ù‚ØªØ±Ø­ Ø§Ù„Ø§Ø³ØªØ¨Ø¯Ø§Ù„ Ø£Ùˆ Ø§Ù„Ø¥ØµÙ„Ø§Ø­ Ø£Ùˆ Ø§Ù„Ø§Ø³ØªØ±Ø¯Ø§Ø¯ØŒ ÙˆÙÙ‚Ù‹Ø§ Ù„Ù„ØªØ´Ø±ÙŠØ¹ Ø§Ù„Ù…ØºØ±Ø¨ÙŠ Ù„Ø­Ù…Ø§ÙŠØ© Ø§Ù„Ù…Ø³ØªÙ‡Ù„Ùƒ.",
					],
				},
				{
					h: "9. Ø§Ù„Ù…Ù„ÙƒÙŠØ© Ø§Ù„ÙÙƒØ±ÙŠØ©",
					p: [
						"Ø§Ù„Ù…ÙˆÙ‚Ø¹ ÙˆÙ…Ø­ØªÙˆØ§Ù‡ ÙˆØ§Ù„Ø´Ø¹Ø§Ø± ÙˆØ§Ù„Ø²Ø®Ø§Ø±ÙØ© Ø§Ù„Ø£Ù…Ø§Ø²ÙŠØºÙŠØ© ÙˆØ§Ù„Ù†Ù…Ø§Ø°Ø¬ ÙˆØ§Ù„ØµÙˆØ± Ù…Ù„Ùƒ Ø­ØµØ±ÙŠ Ù„Ù…ÙŠØ²ÙˆÙ† ØªÙŠØªØ±ÙŠØª. ÙˆÙŠÙÙ…Ù†Ø¹ Ø§Ù„Ù†Ø³Ø® ÙƒÙ„ÙŠÙ‹Ø§ Ø£Ùˆ Ø¬Ø²Ø¦ÙŠÙ‹Ø§ Ø¯ÙˆÙ† Ø¥Ø°Ù† Ø®Ø·ÙŠ.",
					],
				},
				{
					h: "10. Ø§Ù„Ù…Ø³Ø¤ÙˆÙ„ÙŠØ©",
					p: [
						"ÙŠÙÙ‚Ø¯ÙŽÙ‘Ù… Ø§Ù„Ù…ÙˆÙ‚Ø¹ Â«ÙƒÙ…Ø§ Ù‡ÙˆÂ». ÙˆÙ„Ø§ ØªØªØ­Ù…Ù„ Ù…ÙŠØ²ÙˆÙ† ØªÙŠØªØ±ÙŠØª Ù…Ø³Ø¤ÙˆÙ„ÙŠØ© Ø§Ù„Ø§Ù†Ù‚Ø·Ø§Ø¹Ø§Øª Ø£Ùˆ Ø§Ù„Ø£Ø®Ø·Ø§Ø¡ Ø£Ùˆ Ø§Ù„Ø³Ù‡Ùˆ Ø®Ø§Ø±Ø¬ Ø¥Ø±Ø§Ø¯ØªÙ‡Ø§ØŒ ÙˆÙ„Ø§ Ù…Ø­ØªÙˆÙ‰ Ø§Ù„Ù…ÙˆØ§Ù‚Ø¹ Ø§Ù„Ø®Ø§Ø±Ø¬ÙŠØ© Ø§Ù„ØªÙŠ Ù†ÙØ­ÙŠÙ„ Ø¥Ù„ÙŠÙ‡Ø§ (ÙˆØ§ØªØ³Ø§Ø¨ØŒ Ø§Ù„Ø®Ø±Ø§Ø¦Ø·). ÙˆÙ„Ø§ ØªÙÙ‚Ø¨Ù„ Ø£ÙŠ Ù…Ø³Ø¤ÙˆÙ„ÙŠØ© ÙÙŠ Ø­Ø§Ù„ Ø§Ù„Ù‚ÙˆØ© Ø§Ù„Ù‚Ø§Ù‡Ø±Ø©.",
					],
				},
				{
					h: "11. Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„Ø´Ø®ØµÙŠØ©",
					p: [
						"ÙŠØµÙ Ù…Ø¹Ø§Ù„Ø¬Ø© Ø¨ÙŠØ§Ù†Ø§ØªÙƒ Ø§Ù„Ø´Ø®ØµÙŠØ© Ø³ÙŠØ§Ø³Ø© Ø§Ù„Ø®ØµÙˆØµÙŠØ© Ø§Ù„Ø®Ø§ØµØ© Ø¨Ù†Ø§ØŒ Ø§Ù„Ù…ØªØ§Ø­Ø© Ø£Ø³ÙÙ„ Ø§Ù„ØµÙØ­Ø©.",
					],
				},
				{
					h: "12. Ø§Ù„Ù‚Ø§Ù†ÙˆÙ† Ø§Ù„ÙˆØ§Ø¬Ø¨ Ø§Ù„ØªØ·Ø¨ÙŠÙ‚ ÙˆØ§Ù„Ù†Ø²Ø§Ø¹Ø§Øª",
					p: [
						"ØªØ®Ø¶Ø¹ Ù‡Ø°Ù‡ Ø§Ù„Ø´Ø±ÙˆØ· Ù„Ù„Ù‚Ø§Ù†ÙˆÙ† Ø§Ù„Ù…ØºØ±Ø¨ÙŠ. ÙˆÙÙŠ Ø­Ø§Ù„Ø© Ø§Ù„Ù†Ø²Ø§Ø¹ØŒ ØªØ®ØªØµ Ù…Ø­Ø§ÙƒÙ… Ø§Ù„Ø¯Ø§Ø± Ø§Ù„Ø¨ÙŠØ¶Ø§Ø¡ Ø­ØµØ±ÙŠÙ‹Ø§. ÙˆÙ†Ø¯Ø¹ÙˆÙƒ Ø£ÙˆÙ„Ù‹Ø§ Ø¥Ù„Ù‰ Ø§Ù„ØªÙˆØ§ØµÙ„ Ù…Ø¹Ù†Ø§ Ù„Ù„Ø¨Ø­Ø« Ø¹Ù† Ø­Ù„ ÙˆØ¯ÙŠ.",
					],
				},
			],
			related: [
				{ label: "Ø³ÙŠØ§Ø³Ø© Ø§Ù„Ø®ØµÙˆØµÙŠØ©", href: "/confidentialite" },
			],
		},
	},

	/* ====================================================================== */
	/* EN                                                                     */
	/* ====================================================================== */
	en: {
		privacy: {
			eyebrow: "Legal information",
			title: "Privacy policy",
			updated: "Last updated: November 14, 2026",
			intro:
				"This policy explains how Maison Titrit collects, uses and protects your personal data when you use this site. It applies in accordance with Moroccan Law No. 09-08 on the protection of individuals with regard to the processing of personal data and, where applicable, the EU General Data Protection Regulation (GDPR).",
			sections: [
				{
					h: "1. Data controller",
					p: [
						"The data controller is the operator of the Maison Titrit website. Verified legal information and contact details (when provided by the operator) are available in the site's legal notices.",
						"For any question about your personal data, use the verified contact/privacy details published on the site.",
					],
				},
				{
					h: "2. Data we collect",
					p: [
						"Account â€” authentication is provided by Supabase Auth. Depending on your sign-in method (Google or email/password), we receive your name and email address and, with Google, your profile picture. Supabase manages credentials; passwords are not stored in Maison Titrit application tables.",
						"Orders â€” name, phone, email address (optional), city, delivery address, notes and the details of your items. This information is required to process and deliver your order.",
						"Browsing â€” your cart, language and theme preferences are stored locally in your browser. Technical logs (IP address, date, pages viewed) are kept for the security of the site.",
						"Consent â€” your choices regarding analytics and marketing cookies.",
					],
				},
				{
					h: "3. Purposes of processing",
					p: [
						"We use your data to: process and deliver your orders; manage your account; contact you about an order (phone, WhatsApp, email); alert our team to new orders; keep the site secure and running; and, only with your consent, measure audience (Google Analytics) and personalize our ad campaigns (Meta, Pinterest, TikTok).",
					],
				},
				{
					h: "4. Legal basis",
					p: [
						"Performance of a contract (your order), your consent (analytics and marketing cookies â€” revocable at any time), our legitimate interest (security and operation of the site) and our legal obligations (accounting).",
					],
				},
				{
					h: "5. Recipients",
					p: [
						"Your data is hosted by Vercel (site), Supabase (database and authentication, European Union), Cloudflare R2 (images) and Brevo (internal email alerts). Analytics and advertising services are only loaded after your consent. Your order details are sent to our team via WhatsApp and email to prepare the shipment.",
						"We do not sell or rent your personal data to third parties.",
					],
				},
				{
					h: "6. Retention",
					p: [
						"Account â€” until your account is deleted. Orders â€” as long as Moroccan accounting and tax regulations require. Technical logs â€” a few months. Consent â€” until you withdraw your choice.",
					],
				},
				{
					h: "7. Your rights",
					p: [
						"You have the right to access, rectify, erase, object to and port your data. Exercise them via the verified contact/privacy details published on the site; we will respond as soon as possible.",
						"You may also lodge a complaint with Morocco's National Commission for the Protection of Personal Data (CNDP â€” cndp.ma).",
					],
				},
				{
					h: "8. Cookies",
					p: [
						"Strictly necessary cookies â€” session, consent choice, preferences: always active, they let the site function.",
						"Analytics and marketing cookies â€” loaded only if you accept them via the consent banner. You can change your choice at any time with the preferences button shown at the bottom left of every page.",
					],
				},
				{
					h: "9. Security and international transfers",
					p: [
						"The site is served over HTTPS and access to data is restricted to authorized personnel. Some providers (Vercel, Google) are located outside Morocco; their transfers are subject to appropriate safeguards, including EU Standard Contractual Clauses where the GDPR applies.",
					],
				},
				{
					h: "10. Changes",
					p: [
						"This policy may evolve to reflect our practices or the law. The update date appears at the top of this page; in case of a material change, we will announce it on the site.",
					],
				},
			],
			related: [{ label: "Terms of sale", href: "/cgv" }],
		},
		terms: {
			eyebrow: "Legal information",
			title: "Terms of sale",
			updated: "Last updated: November 14, 2026",
			intro:
				"These terms govern sales concluded on maisontitrit.com between Maison Titrit and any individual customer. Placing an order implies their unreserved acceptance.",
			sections: [
				{
					h: "1. Site publisher",
					p: [
						"The site is published and operated by the operator of the Maison Titrit brand. Verified legal notices (identity, contact details, host, where applicable) are published on the site when provided.",
					],
				},
				{
					h: "2. Products",
					p: [
						"Our pieces are handcrafted in our Bouskoura atelier, 100% Made in Morocco. Photographs are faithful to the items, though colors may vary slightly on your screen. Items are offered subject to availability or made to order.",
					],
				},
				{
					h: "3. Prices",
					p: [
						"Prices are shown in Moroccan dirhams (MAD). Delivery fees are communicated before the order is confirmed. We reserve the right to change our prices at any time; the applicable price is the one confirmed at the time of your order.",
					],
				},
				{
					h: "4. Orders",
					p: [
						"You can order through the site cart or directly on WhatsApp. Every order is confirmed by phone or WhatsApp. Without confirmation, or if the item is unavailable, the order may be cancelled. A confirmed order is final.",
					],
				},
				{
					h: "5. Payment",
					p: [
						"Payment is cash on delivery (COD), paid in cash when you receive the package. No payment is collected by the site.",
					],
				},
				{
					h: "6. Delivery",
					p: [
						"We deliver across Morocco. Timeframes are communicated at confirmation depending on the destination. You are responsible for the accuracy of your delivery address; in case of absence at delivery, additional attempts may incur fees on your account.",
					],
				},
				{
					h: "7. Exchanges and returns",
					p: [
						"You have 7 days from receipt to request an exchange or return, provided the piece is unworn, unwashed, with its tags and proof of purchase. Return shipping is at your expense, unless there is a defect or mistake on our part â€” in that case Maison Titrit covers the exchange or refund.",
						"For any claim, contact us on WhatsApp or by email with your order number.",
					],
				},
				{
					h: "8. Warranties",
					p: [
						"In case of a manufacturing defect or non-conformity, contact us with photos of the item. Depending on the case, we will offer an exchange, repair or refund, in line with Moroccan consumer protection regulations.",
					],
				},
				{
					h: "9. Intellectual property",
					p: [
						"The site, its content, the logo, the Amazigh motifs, the designs and the photographs are the exclusive property of Maison Titrit. Any reproduction, in whole or in part, without written permission is prohibited.",
					],
				},
				{
					h: "10. Liability",
					p: [
						"The site is provided â€œas isâ€. Maison Titrit cannot be held liable for interruptions, errors or omissions beyond its control, nor for the content of third-party sites we link to (WhatsApp, maps). No liability can be accepted in cases of force majeure.",
					],
				},
				{
					h: "11. Personal data",
					p: [
						"The processing of your personal data is described in our Privacy policy, available at the bottom of this page.",
					],
				},
				{
					h: "12. Governing law and disputes",
					p: [
						"These terms are governed by Moroccan law. In the event of a dispute, the courts of Casablanca have exclusive jurisdiction. We invite you to contact us first to seek an amicable solution.",
					],
				},
			],
			related: [{ label: "Privacy policy", href: "/confidentialite" }],
		},
	},
};
