/**
 * ============================================================================
 *  MAISON TITRIT — LEGAL DOCUMENT CONTENT (Privacy policy · CGV)
 * ----------------------------------------------------------------------------
 *  Long-form legal content lives HERE (not in dictionaries.ts, which carries
 *  short UI strings only). Rendered by components/maison/legal-page.tsx and
 *  indexed publicly at /confidentialite and /cgv.
 *
 *  Content reflects the actual data practices of this codebase (Supabase Auth,
 *  COD checkout fields, consent-gated pixels — see config/site.ts `analytics`).
 *  ⚠️ The return/exchange window (7 days) should be reviewed by the owner
 *  before go-live.
 * ============================================================================
 */
import type { Locale } from "@/i18n/dictionaries";

export type LegalDocKey =
	| "privacy"
	| "terms"
	| "legalNotice"
	| "cookies"
	| "deliveryReturns"
	| "sizing";

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
	/* FR — default locale                                                    */
	/* ====================================================================== */
	fr: {
		privacy: {
			eyebrow: "Informations légales",
			title: "Politique de confidentialité",
			updated: "Mis à jour le 19 novembre 2026",
			intro:
				"Cette politique explique comment Maison Titrit collecte, utilise et protège vos données personnelles lorsque vous utilisez ce site. Elle s'applique conformément à la loi marocaine n° 09-08 relative à la protection des données à caractère personnel et, lorsque le RGPD s'applique, au Règlement (UE) 2016/679.",
			sections: [
				{
					h: "1. Responsable du traitement",
					p: [
						"Le responsable du traitement est l'exploitant du site Maison Titrit. Les informations légales et coordonnées vérifiées (lorsqu'elles sont fournies par l'exploitant) sont disponibles dans les mentions légales du site.",
						"Pour toute question relative à vos données personnelles, utilisez les coordonnées de contact/confidentialité vérifiées publiées sur le site.",
					],
				},
				{
					h: "2. Données collectées",
					p: [
						"Compte — l'authentification est assurée par Supabase Auth. Selon votre méthode de connexion (Google ou email/mot de passe), nous recevons votre nom, votre adresse email et, avec Google, votre photo de profil. Supabase gère vos identifiants; les mots de passe ne sont pas conservés dans les tables applicatives de Maison Titrit.",
						"Commandes — nom, téléphone, adresse email (facultative), ville, adresse de livraison, notes ainsi que le détail de vos articles. Ces informations sont indispensables pour traiter et livrer votre commande.",
						"Navigation — votre panier, votre langue et votre thème sont conservés localement dans votre navigateur. Des journaux techniques (adresse IP, date, pages consultées) sont conservés pour la sécurité du site.",
						"Consentement — vos choix en matière de cookies analytiques et marketing.",
					],
				},
				{
					h: "3. Finalités du traitement",
					p: [
						"Nous utilisons vos données pour : traiter et livrer vos commandes ; gérer votre compte ; vous contacter au sujet d'une commande (téléphone, WhatsApp, email) ; alerter notre équipe des nouvelles commandes ; assurer la sécurité et le fonctionnement du site ; et, uniquement avec votre consentement, mesurer l'audience (Google Analytics) et personnaliser nos campagnes publicitaires (Meta, Pinterest, TikTok).",
					],
				},
				{
					h: "4. Base légale du traitement",
					p: [
						"L'exécution du contrat (votre commande), votre consentement (cookies analytiques et marketing — révocable à tout moment), notre intérêt légitime (sécurité et fonctionnement du site) et nos obligations légales (comptabilité).",
					],
				},
				{
					h: "5. Destinataires des données",
					p: [
						"Vos données sont hébergées par Vercel (site), Supabase (base de données et authentification, Union européenne), Cloudflare R2 (images) et Brevo (alertes email internes). Les services de mesure d'audience et de publicité ne sont chargés qu'après votre consentement. Le site peut ouvrir WhatsApp avec un message prérempli contenant les détails de votre commande ; vous choisissez de l'envoyer à notre équipe. Le site n'envoie pas de messages via une API WhatsApp.",
						"Nous ne vendons ni ne louons vos données personnelles à des tiers.",
					],
				},
				{
					h: "6. Durées de conservation",
					p: [
						"Compte — jusqu'à la suppression de votre compte. Commandes — le temps exigé par la réglementation comptable et fiscale marocaine. Journaux techniques — quelques mois. Consentement — jusqu'au retrait de votre choix.",
					],
				},
				{
					h: "7. Vos droits",
					p: [
						"Vous disposez d'un droit d'accès, de rectification, d'effacement, d'opposition et de portabilité de vos données. Exercez-les via les coordonnées de contact/confidentialité vérifiées publiées sur le site ; nous vous répondrons dans les meilleurs délais.",
						"Vous pouvez également introduire une réclamation auprès de la Commission Nationale de Contrôle de la Protection des Données à caractère Personnel (CNDP — cndp.ma).",
					],
				},
				{
					h: "8. Cookies",
					p: [
						"Cookies strictement nécessaires — session, choix de consentement, préférences : toujours actifs, ils permettent au site de fonctionner.",
						"Cookies analytiques et marketing — chargés uniquement si vous les acceptez via le bandeau de consentement. Vous pouvez modifier votre choix à tout moment avec le bouton de préférences affiché en bas à gauche de chaque page.",
					],
				},
				{
					h: "9. Sécurité et transferts hors du Maroc",
					p: [
						"Le site est servi en HTTPS et l'accès aux données est restreint aux personnes habilitées. Certains prestataires (Vercel, Google) sont situés hors du Maroc ; leurs transferts sont encadrés par des garanties appropriées, notamment les clauses contractuelles types de l'Union européenne lorsque le RGPD s'applique.",
					],
				},
				{
					h: "10. Modifications",
					p: [
						"Cette politique peut évoluer pour refléter nos pratiques ou la réglementation. La date de mise à jour figure en haut de page ; en cas de changement substantiel, nous en informerons sur le site.",
					],
				},
			],
			related: [
				{ label: "Conditions générales de vente", href: "/cgv" },
				{ label: "Mentions légales", href: "/mentions-legales" },
				{ label: "Cookies", href: "/cookies" },
			],
		},
		terms: {
			eyebrow: "Informations légales",
			title: "Conditions générales de vente",
			updated: "Mis à jour le 19 novembre 2026",
			intro:
				"Les présentes conditions régissent les ventes conclues sur maisontitrit.com entre Maison Titrit et tout client particulier. Toute commande implique leur acceptation sans réserve.",
			sections: [
				{
					h: "1. Éditeur du site",
					p: [
						"Le site est édité et exploité par l'exploitant de la marque Maison Titrit. Les mentions légales vérifiées (identité, coordonnées, hébergeur, le cas échéant) sont publiées sur le site lorsqu'elles sont fournies.",
					],
				},
				{
					h: "2. Produits",
					p: [
						"Nos pièces sont confectionnées à la main dans notre atelier de Bouskoura, 100% Made in Morocco. Les photographies sont fidèles aux articles, mais les couleurs peuvent varier légèrement selon votre écran. Les articles sont proposés dans la limite des stocks disponibles ou sur commande.",
					],
				},
				{
					h: "3. Prix",
					p: [
						"Les prix sont indiqués en dirhams (MAD). Les frais de livraison vous sont communiqués avant la confirmation de la commande. Nous nous réservons le droit de modifier nos prix à tout moment ; le prix applicable est celui confirmé lors de votre commande.",
					],
				},
				{
					h: "4. Commandes",
					p: [
						"Vous pouvez commander via le panier du site ou directement sur WhatsApp. Toute commande fait l'objet d'une confirmation par téléphone ou WhatsApp. À défaut de confirmation, ou en cas d'indisponibilité de l'article, la commande peut être annulée. Une commande confirmée est ferme.",
					],
				},
				{
					h: "5. Paiement",
					p: [
						"Le paiement s'effectue à la livraison (COD), en espèces, à la réception du colis. Aucun paiement n'est encaissé par le site.",
					],
				},
				{
					h: "6. Livraison",
					p: [
						"Nous livrons partout au Maroc. Les délais sont communiqués lors de la confirmation selon la destination. Vous êtes responsable de la précision de votre adresse de livraison ; en cas d'absence au moment de la livraison, des tentatives supplémentaires peuvent engendrer des frais à votre charge.",
					],
				},
				{
					// TODO(owner): confirm the 7-day return/exchange window is the intended policy.
					h: "7. Échanges et retours",
					p: [
						"Vous disposez de 7 jours à compter de la réception pour demander un échange ou un retour, à condition que la pièce soit non portée, non lavée, avec ses étiquettes et munie d'une preuve d'achat. Les frais de retour sont à votre charge, sauf défaut ou erreur de notre part — dans ce cas, Maison Titrit prend en charge l'échange ou le remboursement.",
						"Pour toute réclamation, contactez-nous sur WhatsApp ou par email en précisant votre numéro de commande.",
					],
				},
				{
					h: "8. Garanties",
					p: [
						"En cas de défaut de fabrication ou de non-conformité, contactez-nous avec des photos de l'article. Selon le cas, nous proposerons un échange, une réparation ou un remboursement, conformément à la réglementation marocaine de protection du consommateur.",
					],
				},
				{
					h: "9. Propriété intellectuelle",
					p: [
						"Le site, son contenu, le logo, les motifs amazighs, les modèles et les photographies sont la propriété exclusive de Maison Titrit. Toute reproduction, totale ou partielle, sans autorisation écrite est interdite.",
					],
				},
				{
					h: "10. Responsabilité",
					p: [
						"Le site est fourni « en l'état ». Maison Titrit ne saurait être tenue responsable des interruptions, erreurs ou omissions indépendantes de sa volonté, ni des contenus des sites tiers vers lesquels nous renvoyons (WhatsApp, cartes). Aucune responsabilité ne peut être engagée en cas de force majeure.",
					],
				},
				{
					h: "11. Données personnelles",
					p: [
						"Le traitement de vos données personnelles est décrit dans notre Politique de confidentialité, accessible en bas de page.",
					],
				},
				{
					h: "12. Droit applicable et litiges",
					p: [
						"Les présentes conditions sont régies par le droit marocain. En cas de litige, les tribunaux de Casablanca sont seuls compétents. Nous vous invitons d'abord à nous contacter afin de rechercher une solution amiable.",
					],
				},
			],
			related: [
				{ label: "Politique de confidentialité", href: "/confidentialite" },
				{ label: "Livraison et retours", href: "/livraison-retours" },
				{ label: "Guide des tailles", href: "/guide-des-tailles" },
			],
		},
		legalNotice: {
			eyebrow: "Informations légales",
			title: "Mentions légales",
			updated: "Dernière mise à jour : 19 novembre 2026",
			intro:
				"Les présentes mentions légales identifient l'éditeur du site maisontitrit.com et précisent les informations essentielles relatives à son exploitation. Elles complètent notre politique de confidentialité et nos conditions générales de vente.",
			sections: [
				{
					h: "1. Éditeur du site",
					p: [
						"Le site est édité et exploité par l'exploitant de la marque Maison Titrit. Les informations vérifiées (identité, coordonnées, hébergeur) sont publiées dans l'encadré ci-dessus lorsqu'elles sont fournies par l'exploitant.",
					],
				},
				{
					h: "2. Activité",
					p: [
						"Maison Titrit est une maison de couture marocaine proposant des pièces de mode modeste pour femmes, confectionnées à l'atelier de Bouskoura (100 % Made in Morocco), présentées et commandables via le site et les canaux de contact indiqués.",
					],
				},
				{
					h: "3. Hébergement et services techniques",
					p: [
						"Le site et certains services techniques sont fournis par des prestataires tiers (notamment pour l'hébergement, la base de données, l'authentification, les médias et l'envoi d'e-mails opérationnels), comme décrit dans notre politique de confidentialité.",
					],
				},
				{
					h: "4. Propriété intellectuelle",
					p: [
						"Le site, son contenu, le logo, les motifs amazighs, les modèles et les photographies sont la propriété exclusive de Maison Titrit, sauf mention contraire. Toute reproduction, totale ou partielle, sans autorisation écrite préalable est interdite.",
					],
				},
				{
					h: "5. Données personnelles et cookies",
					p: [
						"Le traitement des données personnelles et l'utilisation des cookies sont détaillés dans notre politique de confidentialité et notre page dédiée aux cookies. Vous pouvez gérer vos préférences de consentement à tout moment via le bouton de préférences affiché sur le site.",
					],
				},
				{
					h: "6. Contact",
					p: [
						"Pour toute question concernant le site, une commande ou ces mentions, contactez-nous via les coordonnées de contact vérifiées publiées sur le site.",
					],
				},
			],
			related: [
				{ label: "Politique de confidentialité", href: "/confidentialite" },
				{ label: "Conditions générales de vente", href: "/cgv" },
				{ label: "Cookies", href: "/cookies" },
			],
		},
		cookies: {
			eyebrow: "Informations légales",
			title: "Cookies et préférences",
			updated: "Dernière mise à jour : 19 novembre 2026",
			intro:
				"Cette page explique comment Maison Titrit utilise les cookies et technologies similaires sur maisontitrit.com, ainsi que les choix dont vous disposez. Les outils d'analyse et de marketing ne sont activés qu'après votre consentement explicite, lorsque vous l'accordez.",
			sections: [
				{
					h: "1. Qu'est-ce qu'un cookie ?",
					p: [
						"Un cookie est un petit fichier ou une information stockée sur votre appareil (navigateur, téléphone, ordinateur) lors de la visite d'un site. Des technologies similaires (stockage local, identifiants techniques) peuvent être utilisées pour des finalités équivalentes.",
					],
				},
				{
					h: "2. Cookies et stockages nécessaires",
					p: [
						"Certains éléments sont indispensables au fonctionnement du site, par exemple la mémorisation de la langue, de vos préférences d'affichage, de l'état de votre panier et de vos choix en matière de consentement. Ces éléments sont utilisés sans recourir aux finalités d'analyse ou de marketing optionnelles.",
					],
				},
				{
					h: "3. Mesure d'audience (avec consentement)",
					p: [
						"Si vous l'autorisez, nous pouvons utiliser des outils de mesure d'audience et de performance (par exemple les outils Vercel Analytics/Speed Insights et, lorsqu'ils sont configurés, des services tels que Google Tag Manager/Google Analytics). Certains services Google fonctionnent avec le mode de consentement : par défaut, le stockage lié à l'analyse et à la publicité est refusé, puis mis à jour selon vos choix.",
					],
				},
				{
					h: "4. Marketing (avec consentement)",
					p: [
						"Si vous l'autorisez, des outils de mesure des campagnes et d'actions marketing peuvent être activés (par exemple Meta, Pinterest ou TikTok, lorsqu'ils sont configurés). Ces outils ne sont chargés qu'après votre accord explicite dans la bannière de consentement.",
					],
				},
				{
					h: "5. Gérer vos choix",
					p: [
						"Lors de votre première visite, un bandeau vous permet d'accepter, de refuser ou de personnaliser vos préférences. Vous pouvez modifier votre choix à tout moment via le bouton de préférences cookies affiché sur le site. Le refus des catégories optionnelles n'empêche pas l'utilisation des fonctions essentielles du site.",
					],
				},
				{
					h: "6. Pour en savoir plus",
					p: [
						"Pour plus d'informations sur les données personnelles, les destinataires, les durées de conservation et vos droits, consultez notre politique de confidentialité ou contactez-nous via les coordonnées publiées sur le site.",
					],
				},
			],
			related: [
				{ label: "Politique de confidentialité", href: "/confidentialite" },
				{ label: "Mentions légales", href: "/mentions-legales" },
			],
		},
		deliveryReturns: {
			eyebrow: "Aide & commande",
			title: "Livraison et retours",
			updated: "Dernière mise à jour : 19 novembre 2026",
			intro:
				"Cette page résume les informations essentielles concernant la livraison, le paiement à la livraison et les échanges ou retours chez Maison Titrit. Les conditions complètes figurent dans nos conditions générales de vente ; en cas de différence, les CGV prévalent.",
			sections: [
				{
					h: "1. Paiement",
					p: [
						"Le paiement s'effectue à la livraison (COD), en espèces, à la réception du colis. Aucun paiement n'est encaissé en ligne sur le site.",
					],
				},
				{
					h: "2. Livraison",
					p: [
						"Nous livrons au Maroc. Les délais et modalités pratiques sont communiqués lors de la confirmation de la commande, selon la destination et la disponibilité des pièces.",
						"Merci de fournir une adresse exacte et un numéro de téléphone joignable. En cas d'absence au moment de la livraison, des tentatives supplémentaires peuvent engendrer des frais conformément aux conditions applicables.",
					],
				},
				{
					h: "3. Confirmation de commande",
					p: [
						"Les commandes passées via le site ou WhatsApp sont confirmées par téléphone ou WhatsApp. Une commande n'est considérée comme ferme qu'après confirmation.",
					],
				},
				{
					h: "4. Échanges et retours",
					p: [
						"Vous pouvez demander un échange ou un retour dans les 7 jours suivant la réception, à condition que la pièce soit non portée, non lavée, avec ses étiquettes et accompagnée d'une preuve d'achat.",
						"Les frais de retour sont à votre charge, sauf en cas de défaut ou d'erreur de notre part — dans ce cas, Maison Titrit prend en charge l'échange ou le remboursement selon la situation.",
					],
				},
				{
					h: "5. Réclamations et assistance",
					p: [
						"Pour toute question relative à une livraison, un échange, un retour ou un défaut, contactez-nous via les coordonnées de contact vérifiées publiées sur le site, en indiquant votre numéro de commande et, si utile, des photos.",
					],
				},
			],
			related: [
				{ label: "Conditions générales de vente", href: "/cgv" },
				{ label: "Contact", href: "/contact" },
				{ label: "Guide des tailles", href: "/guide-des-tailles" },
			],
		},
		sizing: {
			eyebrow: "Aide & commande",
			title: "Guide des tailles",
			updated: "Dernière mise à jour : 19 novembre 2026",
			intro:
				"Ce guide vous aide à choisir la taille la plus adaptée. Les coupes, matières et disponibilités peuvent varier selon les modèles ; référez-vous toujours aux informations de la fiche produit et contactez-nous en cas de doute.",
			sections: [
				{
					h: "1. Comment prendre vos mesures",
					p: [
						"Utilisez un mètre ruban souple, porté à plat sur le corps sans serrer. Pour plus de précision, prenez vos mesures sur un vêtement léger ou directement sur vous.",
						"Poitrine : mesurez autour de la partie la plus forte. Taille : mesurez au creux de la taille. Hanches : mesurez autour de la partie la plus large. Longueur : selon la pièce, mesurez depuis l'épaule ou la taille jusqu'à la longueur souhaitée.",
					],
				},
				{
					h: "2. Tailles et disponibilités",
					p: [
						"Les tailles proposées dépendent de chaque pièce (par exemple S, M, L, XL ou XXL selon les modèles). La disponibilité par taille peut évoluer ; vérifiez la fiche produit ou contactez la maison pour confirmer la taille souhaitée.",
					],
				},
				{
					h: "3. Coupes, retouches et conseils",
					p: [
						"Certaines pièces offrent une coupe ample ou des liens de serrage (ceinture, lien) qui permettent d'ajuster le tombé. Si vous hésitez entre deux tailles ou si vous souhaitez un conseil personnalisé, nous vous recommandons de nous contacter avant de commander.",
					],
				},
				{
					h: "4. Besoin d'aide ?",
					p: [
						"Écrivez-nous sur WhatsApp ou par e-mail avec la référence du modèle, vos mesures et vos préférences de coupe. Nous vous aiderons à choisir la taille la plus adaptée avant confirmation de la commande.",
					],
				},
			],
			related: [
				{ label: "Livraison et retours", href: "/livraison-retours" },
				{ label: "Contact", href: "/contact" },
				{ label: "Conditions générales de vente", href: "/cgv" },
			],
		},
	},

	/* ====================================================================== */
	/* AR                                                                     */
	/* ====================================================================== */
	ar: {
		privacy: {
			eyebrow: "معلومات قانونية",
			title: "سياسة الخصوصية",
			updated: "آخر تحديث: 19 نوفمبر 2026",
			intro:
				"توضح هذه السياسة كيفية جمع ميزون تيتريت لبياناتك الشخصية واستخدامها وحمايتها عند استخدامك لهذا الموقع. وهي تُطبَّق وفقًا للقانون المغربي رقم 09-08 المتعلق بحماية الأشخاص الذاتيين من معالجة المعطيات ذات الطابع الشخصي، ووفقًا للائحة العامة لحماية البيانات (GDPR) عند انطباقها.",
			sections: [
				{
					h: "1. مسؤول المعالجة",
					p: [
						"المسؤول عن المعالجة هو مُشغِّل موقع Maison Titrit. تتوفر المعلومات القانونية وبيانات الاتصال الموثوقة (عند توفيرها من المُشغِّل) ضمن الإشعارات القانونية للموقع.",
						"لأي سؤال يتعلق ببياناتك الشخصية، يرجى استخدام بيانات الاتصال/الخصوصية الموثوقة المنشورة على الموقع.",
					],
				},
				{
					h: "2. البيانات المجمَّعة",
					p: [
						"الحساب — تتم المصادقة عبر Supabase Auth. بحسب طريقة تسجيل الدخول (Google أو البريد الإلكتروني وكلمة المرور)، نستقبل اسمك وعنوان بريدك الإلكتروني، وصورة ملفك الشخصي عند استخدام Google. تدير Supabase بيانات الاعتماد ولا نخزن كلمات المرور في جداول تطبيق Maison Titrit.",
						"الطلبات — الاسم، الهاتف، البريد الإلكتروني (اختياري)، المدينة، عنوان التوصيل، الملاحظات وتفاصيل المنتجات. هذه المعلومات ضرورية لمعالجة طلبك وتوصيله.",
						"التصفح — تُحفظ سلة التسوق ولغتك وسِمتك محليًا في متصفحك. كما نحتفظ بسجلات تقنية (عنوان IP، التاريخ، الصفحات التي تمت زيارتها) لأغراض أمن الموقع.",
						"الموافقة — اختياراتك بشأن ملفات تعريف الارتباط التحليلية والتسويقية.",
					],
				},
				{
					h: "3. أغراض المعالجة",
					p: [
						"نستخدم بياناتك من أجل: معالجة طلباتك وتوصيلها؛ إدارة حسابك؛ التواصل معك بخصوص طلبك (الهاتف، واتساب، البريد)؛ إعلام فريقنا بالطلبات الجديدة؛ ضمان أمن الموقع وتشغيله؛ وفقط بموافقتك، قياس عدد الزوار (Google Analytics) وتخصيص حملاتنا الإعلانية (Meta وPinterest وTikTok).",
					],
				},
				{
					h: "4. الأساس القانوني للمعالجة",
					p: [
						"تنفيذ العقد (طلبك)، موافقتك (ملفات الارتباط التحليلية والتسويقية — قابلة للسحب في أي وقت)، مصلحتنا المشروعة (أمن الموقع وتشغيله) والالتزامات القانونية (المحاسبة).",
					],
				},
				{
					h: "5. الجهات المتلقية للبيانات",
					p: [
						"تُستضاف بياناتك لدى Vercel (الموقع) وSupabase (قاعدة البيانات والمصادقة، الاتحاد الأوروبي) وCloudflare R2 (الصور) وBrevo (تنبيهات البريد الداخلية). ولا تُحمَّل خدمات قياس الجمهور والإعلانات إلا بعد موافقتك. يمكن للموقع فتح واتساب برسالة مُعدّة مسبقًا تتضمن تفاصيل طلبك؛ وأنت تختار إرسالها إلى فريقنا. لا يرسل الموقع رسائل عبر واجهة واتساب البرمجية.",
						"لا نبيع بياناتك الشخصية ولا نؤجّرها إلى أي طرف ثالث.",
					],
				},
				{
					h: "6. مدة الاحتفاظ بالبيانات",
					p: [
						"الحساب — حتى حذف حسابك. الطلبات — للمدة التي تقتضيها اللوائح المحاسبية والضريبية المغربية. السجلات التقنية — لبضعة أشهر. الموافقة — حتى سحب اختيارك.",
					],
				},
				{
					h: "7. حقوقك",
					p: [
						"لك الحق في الولوج إلى بياناتك وتصحيحها ومحوها والاعتراض على معالجتها ونقلها. يمكنك ممارسة هذه الحقوق عبر بيانات الاتصال/الخصوصية الموثوقة المنشورة على الموقع، وسنرد في أقرب الآجال.",
						"يمكنك أيضًا تقديم شكوى لدى اللجنة الوطنية للرقابة على حماية المعطيات ذات الطابع الشخصي (CNDP — cndp.ma).",
					],
				},
				{
					h: "8. ملفات تعريف الارتباط",
					p: [
						"ملفات ضرورية للغاية — الجلسة، خيار الموافقة، التفضيلات: تبقى مفعَّلة دائمًا لأنها تُمكّن الموقع من العمل.",
						"الملفات التحليلية والتسويقية — لا تُحمَّل إلا إذا قبلتها عبر شريط الموافقة. يمكنك تغيير اختيارك في أي وقت عبر زر التفضيلات الموجود أسفل يسار كل صفحة.",
					],
				},
				{
					h: "9. الأمان والتحويل خارج المغرب",
					p: [
						"يُقدَّم الموقع عبر HTTPS ويقتصر الوصول إلى البيانات على المصرَّح لهم. وبعض مزودي الخدمات (Vercel وGoogle) يقعون خارج المغرب؛ ويُنظَّم نقل البيانات بضمانات مناسبة، لا سيما البنود التعاقدية القياسية للاتحاد الأوروبي عند انطباق GDPR.",
					],
				},
				{
					h: "10. التعديلات",
					p: [
						"قد تتطور هذه السياسة لتعكس ممارساتنا أو المتطلبات القانونية. ويظهر تاريخ آخر تحديث أعلى الصفحة؛ وسنُعلمكم على الموقع عند أي تغيير جوهري.",
					],
				},
			],
			related: [
				{ label: "شروط البيع العامة", href: "/cgv" },
				{ label: "الإشعارات القانونية", href: "/mentions-legales" },
				{ label: "ملفات تعريف الارتباط", href: "/cookies" },
			],
		},
		terms: {
			eyebrow: "معلومات قانونية",
			title: "شروط البيع العامة",
			updated: "آخر تحديث: 19 نوفمبر 2026",
			intro:
				"تحكم هذه الشروط عمليات البيع التي تتم عبر maisontitrit.com بين ميزون تيتريت وأي زبون فردي. ويُعدّ تقديم أي طلب قبولًا لهذه الشروط دون تحفظ.",
			sections: [
				{
					h: "1. مُحرِّر الموقع",
					p: [
						"يُنشر الموقع ويُشغَّل من طرف مُشغِّل علامة Maison Titrit. تُنشر الإشعارات القانونية الموثوقة (الهوية، بيانات الاتصال، المستضيف، عند الاقتضاء) على الموقع عند توفيرها.",
					],
				},
				{
					h: "2. المنتجات",
					p: [
						"تُفصَّل قطعنا يدويًا في ورشتنا ببوسكورة، 100% صنع في المغرب. الصور مطابقة للمنتجات لكن الألوان قد تختلف قليلًا حسب شاشتك. وتُقدَّم المنتجات حسب توفر المخزون أو حسب الطلب.",
					],
				},
				{
					h: "3. الأسعار",
					p: [
						"الأسعار معروضة بالدرهم المغربي (MAD). وتُبلَّغون برسوم التوصيل قبل تأكيد الطلب. ونحتفظ بحق تعديل أسعارنا في أي وقت؛ والسعر المعتمد هو السعر المؤكَّد عند طلبك.",
					],
				},
				{
					h: "4. الطلبات",
					p: [
						"يمكنك الطلب عبر سلة الموقع أو مباشرة عبر واتساب. ويخضع كل طلب للتأكيد عبر الهاتف أو واتساب. وفي حال عدم التأكيد أو عدم توفر المنتج، قد يُلغى الطلب. ويُعدّ الطلب المؤكَّد نهائيًا.",
					],
				},
				{
					h: "5. الدفع",
					p: [
						"يتم الدفع عند الاستلام (COD) نقدًا عند تسلّم الطرد. ولا يتم تحصيل أي مبلغ عبر الموقع.",
					],
				},
				{
					h: "6. التوصيل",
					p: [
						"نقوم بالتوصيل إلى مختلف أنحاء المغرب. وتُبلَّغكم الآجال عند التأكيد حسب وجهة التسليم. وتقع على عاتقكم مسؤولية دقة عنوان التوصيل؛ وفي حال غيابكم وقت التسليم، قد تترتب على محاولات التسليم الإضافية رسوم على نفقتكم.",
					],
				},
				{
					h: "7. الاستبدال والإرجاع",
					p: [
						"يمكنكم خلال 7 أيام من تاريخ الاستلام طلب استبدال أو إرجاع، بشرط أن تكون القطعة غير مستعملة وغير مغسولة ومع بطاقاتها وإثبات الشراء. وتكون رسوم الإرجاع على عاتقكم، إلا في حال وجود عيب أو خطأ من جانبنا — حيث تتكفل ميزون تيتريت حينها بالاستبدال أو الاسترداد.",
						"لأي طلب أو ملاحظة، يرجى التواصل معنا عبر واتساب أو البريد الإلكتروني مع ذكر رقم الطلب.",
					],
				},
				{
					h: "8. الضمانات",
					p: [
						"في حال وجود عيب تصنيع أو عدم مطابقة، راسلنا بصور المنتج. وحسب الحالة، نقترح الاستبدال أو الإصلاح أو الاسترداد، وفقًا للتشريع المغربي لحماية المستهلك.",
					],
				},
				{
					h: "9. الملكية الفكرية",
					p: [
						"الموقع ومحتواه والشعار والزخارفة الأمازيغية والنماذج والصور ملك حصري لميزون تيتريت. ويُمنع النسخ كليًا أو جزئيًا دون إذن خطي.",
					],
				},
				{
					h: "10. المسؤولية",
					p: [
						"يُقدَّم الموقع «كما هو». ولا تتحمل ميزون تيتريت مسؤولية الانقطاعات أو الأخطاء أو السهو خارج إرادتها، ولا محتوى المواقع الخارجية التي نُحيل إليها (واتساب، الخرائط). ولا تُقبل أي مسؤولية في حال القوة القاهرة.",
					],
				},
				{
					h: "11. البيانات الشخصية",
					p: [
						"تُوضَّح كيفية معالجة بياناتكم الشخصية في سياسة الخصوصية الخاصة بنا، المتاحة أسفل الصفحة.",
					],
				},
				{
					h: "12. القانون الواجب التطبيق والنزاعات",
					p: [
						"تخضع هذه الشروط للقانون المغربي. وفي حالة النزاع، تختص محاكم الدار البيضاء حصريًا. وندعوك أولًا إلى التواصل معنا للبحث عن حل ودي.",
					],
				},
			],
			related: [
				{ label: "سياسة الخصوصية", href: "/confidentialite" },
				{ label: "التوصيل والإرجاع", href: "/livraison-retours" },
				{ label: "دليل المقاسات", href: "/guide-des-tailles" },
			],
		},
		legalNotice: {
			eyebrow: "معلومات قانونية",
			title: "الإشعارات القانونية",
			updated: "آخر تحديث: 19 نوفمبر 2026",
			intro:
				"تُحدّد هذه الإشعارات الجهة الناشرة لموقع maisontitrit.com وتعرض المعلومات الأساسية المتعلقة بتشغيله. وهي تُكمّل سياسة الخصوصية وشروط البيع العامة.",
			sections: [
				{
					h: "1. ناشر الموقع",
					p: [
						"ينشر الموقع مُشغِّل علامة Maison Titrit. المعلومات الموثوقة (الهوية، بيانات الاتصال، الاستضافة) تُنشر في الإطار أعلاه عند توفيرها من المُشغِّل.",
					],
				},
				{
					h: "2. النشاط",
					p: [
						"ميزون تيتريت دار خياطة مغربية تقدم قطع أزياء محتشمة للنساء، تُخاط في ورشة بوسكورة (صنع مغربي 100%)، وتُعرض وتُطلب عبر الموقع وقنوات التواصل المذكورة.",
					],
				},
				{
					h: "3. الاستضافة والخدمات التقنية",
					p: [
						"يستعين الموقع ببعض مزودي الخدمات التقنيين (لا سيما للاستضافة وقاعدة البيانات والمصادقة والوسائط والرسائل التشغيلية)، على النحو الموضح في سياسة الخصوصية.",
					],
				},
				{
					h: "4. الملكية الفكرية",
					p: [
						"يُعد الموقع ومحتواه والشعار والزخارف الأمازيغية والتصاميم والصور ملكًا حصريًا لميزون تيتريت، ما لم يُذكر خلاف ذلك. ويُمنع أي نسخ كلي أو جزئي دون إذن كتابي مسبق.",
					],
				},
				{
					h: "5. البيانات الشخصية وملفات تعريف الارتباط",
					p: [
						"تُفصَّل معالجة البيانات الشخصية واستخدام ملفات تعريف الارتباط في سياسة الخصوصية وصفحتنا المخصصة لملفات تعريف الارتباط. ويمكنكم تعديل تفضيلات الموافقة في أي وقت عبر زر التفضيلات المعروض على الموقع.",
					],
				},
				{
					h: "6. التواصل",
					p: [
						"لأي استفسار بشأن الموقع أو طلب أو هذه الإشعارات، تواصلوا معنا عبر بيانات التواصل الموثوقة المنشورة على الموقع.",
					],
				},
			],
			related: [
				{ label: "سياسة الخصوصية", href: "/confidentialite" },
				{ label: "شروط البيع العامة", href: "/cgv" },
				{ label: "ملفات تعريف الارتباط", href: "/cookies" },
			],
		},
		cookies: {
			eyebrow: "معلومات قانونية",
			title: "ملفات تعريف الارتباط والتفضيلات",
			updated: "آخر تحديث: 19 نوفمبر 2026",
			intro:
				"توضح هذه الصفحة كيفية استخدام Maison Titrit لملفات تعريف الارتباط والتقنيات المشابهة على maisontitrit.com والخيارات المتاحة لكم. لا يتم تفعيل أدوات القياس أو التسويق إلا بعد موافقتكم الصريحة، عند منحها.",
			sections: [
				{
					h: "1. ما هي ملفات تعريف الارتباط؟",
					p: [
						"ملف تعريف الارتباط هو ملف صغير أو معلومة تُخزَّن على جهازكم (المتصفح أو الهاتف أو الحاسوب) عند زيارة موقع. وقد تُستخدم تقنيات مشابهة (مثل التخزين المحلي أو المعرّفات التقنية) لأغراض مماثلة.",
					],
				},
				{
					h: "2. الملفات والتخزينات الضرورية",
					p: [
						"بعض العناصر ضرورية لعمل الموقع، مثل تذكر اللغة وتفضيلات العرض وحالة السلة وخيارات الموافقة. تُستخدم هذه العناصر دون اللجوء إلى أغراض القياس أو التسويق الاختيارية.",
					],
				},
				{
					h: "3. قياس الجمهور (بموافقتكم)",
					p: [
						"إذا سمحتم بذلك، يمكننا استخدام أدوات لقياس الجمهور والأداء (مثل أدوات Vercel Analytics/Speed Insights، وعند تهيئتها خدمات مثل Google Tag Manager/Google Analytics). تعمل بعض خدمات Google بنمط الموافقة: يكون التخزين المتعلق بالتحليلات والإعلانات مرفوضًا افتراضيًا، ثم يُحدَّث وفقًا لخياراتكم.",
					],
				},
				{
					h: "4. التسويق (بموافقتكم)",
					p: [
						"إذا سمحتم بذلك، قد تُفعَّل أدوات لقياس الحملات والإجراءات التسويقية (مثل Meta أو Pinterest أو TikTok عند تهيئتها). ولا تُحمَّل هذه الأدوات إلا بعد موافقتكم الصريحة عبر شريط الموافقة.",
					],
				},
				{
					h: "5. إدارة خياراتكم",
					p: [
						"عند زيارتكم الأولى، يتيح لكم شريط قبول التفضيلات أو رفضها أو تخصيصها. ويمكنكم تغيير اختياركم في أي وقت عبر زر تفضيلات ملفات تعريف الارتباط المعروض على الموقع. ولا يمنع رفض الفئات الاختيارية استخدام الوظائف الأساسية للموقع.",
					],
				},
				{
					h: "6. لمزيد من المعلومات",
					p: [
						"لمزيد من المعلومات حول البيانات الشخصية والجهات المستلمة ومدد الاحتفاظ وحقوقكم، يرجى الرجوع إلى سياسة الخصوصية أو التواصل معنا عبر بيانات التواصل الموثوقة المنشورة على الموقع.",
					],
				},
			],
			related: [
				{ label: "سياسة الخصوصية", href: "/confidentialite" },
				{ label: "الإشعارات القانونية", href: "/mentions-legales" },
			],
		},
		deliveryReturns: {
			eyebrow: "المساعدة والطلب",
			title: "التوصيل والإرجاع",
			updated: "آخر تحديث: 19 نوفمبر 2026",
			intro:
				"تلخص هذه الصفحة المعلومات الأساسية المتعلقة بالتوصيل والدفع عند الاستلام والاستبدال أو الإرجاع لدى Maison Titrit. وترد الشروط الكاملة في شروط البيع العامة؛ وفي حال الاختلاف تُعتمد شروط البيع العامة.",
			sections: [
				{
					h: "1. الدفع",
					p: [
						"يتم الدفع عند الاستلام (COD) نقدًا عند تسلّم الطرد. ولا يتم تحصيل أي مبالغ عبر الإنترنت على الموقع.",
					],
				},
				{
					h: "2. التوصيل",
					p: [
						"نقوم بالتوصيل داخل المغرب. وتُبلَّغ الآجال والإجراءات العملية عند تأكيد الطلب، بحسب وجهة التسليم وتوفر القطع.",
						"يرجى تقديم عنوان دقيق ورقم هاتف يمكن الوصول إليه. وفي حال الغياب وقت التسليم، قد تترتب على محاولات إضافية رسوم وفقًا للشروط المعمول بها.",
					],
				},
				{
					h: "3. تأكيد الطلب",
					p: [
						"تُؤكَّد الطلبات المقدمة عبر الموقع أو واتساب هاتفيًا أو عبر واتساب. ولا يُعد الطلب نهائيًا إلا بعد تأكيده.",
					],
				},
				{
					h: "4. الاستبدال والإرجاع",
					p: [
						"يمكنكم طلب الاستبدال أو الإرجاع خلال 7 أيام من تاريخ الاستلام، بشرط أن تكون القطعة غير مستعملة وغير مغسولة ومع بطاقاتها وإثبات الشراء.",
						"تكون رسوم الإرجاع على عاتقكم، إلا في حال وجود عيب أو خطأ من جانبنا — ففي هذه الحالة تتكفل Maison Titrit بالاستبدال أو الاسترداد بحسب الحالة.",
					],
				},
				{
					h: "5. الشكاوى والمساعدة",
					p: [
						"لأي سؤال يتعلق بالتوصيل أو الاستبدال أو الإرجاع أو عيب، تواصلوا معنا عبر بيانات التواصل الموثوقة المنشورة على الموقع، مع ذكر رقم الطلب وإرفاق صور عند الحاجة.",
					],
				},
			],
			related: [
				{ label: "شروط البيع العامة", href: "/cgv" },
				{ label: "اتصل بنا", href: "/contact" },
				{ label: "دليل المقاسات", href: "/guide-des-tailles" },
			],
		},
		sizing: {
			eyebrow: "المساعدة والطلب",
			title: "دليل المقاسات",
			updated: "آخر تحديث: 19 نوفمبر 2026",
			intro:
				"يساعدكم هذا الدليل على اختيار المقاس الأنسب. قد تختلف القصّات والخامات والتوفر بحسب الموديل؛ لذلك يُرجى دائمًا الرجوع إلى معلومات صفحة المنتج والتواصل معنا عند الشك.",
			sections: [
				{
					h: "1. كيفية أخذ القياسات",
					p: [
						"استخدموا شريط قياس مرنًا موضوعًا بشكل مستقيم على الجسم دون شد. وللحصول على قياس أدق، خذوا القياسات فوق ملابس خفيفة أو مباشرة على الجسم.",
						"الصدر: قيسوا حول أوسع جزء. الخصر: قيسوا عند أضيق نقطة. الورك: قيسوا حول أوسع جزء. الطول: بحسب القطعة، قيسوا من الكتف أو الخصر حتى الطول المطلوب.",
					],
				},
				{
					h: "2. المقاسات والتوفر",
					p: [
						"تختلف المقاسات المتاحة بحسب كل قطعة (مثل S أو M أو L أو XL أو XXL حسب الموديل). وقد يتغير توفر المقاسات؛ لذا يرجى التحقق من صفحة المنتج أو التواصل مع الدار لتأكيد المقاس المطلوب.",
					],
				},
				{
					h: "3. القصّة والتعديلات والنصائح",
					p: [
						"تتميز بعض القطع بقصّة واسعة أو أربطة (حزام/رباط) تسمح بضبط السقوط. وإذا ترددتم بين مقاسين أو رغبتم في نصيحة مخصصة، ننصحكم بالتواصل معنا قبل تأكيد الطلب.",
					],
				},
				{
					h: "4. هل تحتاجون مساعدة؟",
					p: [
						"راسلونا عبر واتساب أو البريد الإلكتروني مع ذكر مرجع الموديل وقياساتكم وتفضيلاتكم في القصّة. سنساعدكم على اختيار المقاس الأنسب قبل تأكيد الطلب.",
					],
				},
			],
			related: [
				{ label: "التوصيل والإرجاع", href: "/livraison-retours" },
				{ label: "اتصل بنا", href: "/contact" },
				{ label: "شروط البيع العامة", href: "/cgv" },
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
			updated: "Last updated: November 19, 2026",
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
						"Account — authentication is provided by Supabase Auth. Depending on your sign-in method (Google or email/password), we receive your name and email address and, with Google, your profile picture. Supabase manages credentials; passwords are not stored in Maison Titrit application tables.",
						"Orders — name, phone, email address (optional), city, delivery address, notes and the details of your items. This information is required to process and deliver your order.",
						"Browsing — your cart, language and theme preferences are stored locally in your browser. Technical logs (IP address, date, pages viewed) are kept for the security of the site.",
						"Consent — your choices regarding analytics and marketing cookies.",
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
						"Performance of a contract (your order), your consent (analytics and marketing cookies — revocable at any time), our legitimate interest (security and operation of the site) and our legal obligations (accounting).",
					],
				},
				{
					h: "5. Recipients",
					p: [
						"Your data is hosted by Vercel (site), Supabase (database and authentication, European Union), Cloudflare R2 (images) and Brevo (internal email alerts). Analytics and advertising services are only loaded after your consent. The site can open WhatsApp with a prefilled message containing your order details; you choose whether to send it to our team. The site does not send messages through a WhatsApp API.",
						"We do not sell or rent your personal data to third parties.",
					],
				},
				{
					h: "6. Retention",
					p: [
						"Account — until your account is deleted. Orders — as long as Moroccan accounting and tax regulations require. Technical logs — a few months. Consent — until you withdraw your choice.",
					],
				},
				{
					h: "7. Your rights",
					p: [
						"You have the right to access, rectify, erase, object to and port your data. Exercise them via the verified contact/privacy details published on the site; we will respond as soon as possible.",
						"You may also lodge a complaint with Morocco's National Commission for the Protection of Personal Data (CNDP — cndp.ma).",
					],
				},
				{
					h: "8. Cookies",
					p: [
						"Strictly necessary cookies — session, consent choice, preferences: always active, they let the site function.",
						"Analytics and marketing cookies — loaded only if you accept them via the consent banner. You can change your choice at any time with the preferences button shown at the bottom left of every page.",
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
			related: [
				{ label: "Terms of sale", href: "/cgv" },
				{ label: "Legal notice", href: "/mentions-legales" },
				{ label: "Cookies", href: "/cookies" },
			],
		},
		terms: {
			eyebrow: "Legal information",
			title: "Terms of sale",
			updated: "Last updated: November 19, 2026",
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
						"You have 7 days from receipt to request an exchange or return, provided the piece is unworn, unwashed, with its tags and proof of purchase. Return shipping is at your expense, unless there is a defect or mistake on our part — in that case Maison Titrit covers the exchange or refund.",
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
						"The site is provided “as is”. Maison Titrit cannot be held liable for interruptions, errors or omissions beyond its control, nor for the content of third-party sites we link to (WhatsApp, maps). No liability can be accepted in cases of force majeure.",
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
			related: [
				{ label: "Privacy policy", href: "/confidentialite" },
				{ label: "Delivery and returns", href: "/livraison-retours" },
				{ label: "Size guide", href: "/guide-des-tailles" },
			],
		},
		legalNotice: {
			eyebrow: "Legal information",
			title: "Legal notice",
			updated: "Last updated: November 19, 2026",
			intro:
				"This legal notice identifies the publisher of maisontitrit.com and provides key information about its operation. It complements our privacy policy and terms of sale.",
			sections: [
				{
					h: "1. Site publisher",
					p: [
						"The site is published and operated by the operator of the Maison Titrit brand. Verified information (identity, contact details, host) is published in the box above when provided by the operator.",
					],
				},
				{
					h: "2. Activity",
					p: [
						"Maison Titrit is a Moroccan couture house offering modest fashion pieces for women, crafted in our Bouskoura atelier (100% Made in Morocco), presented and available to order through the site and the contact channels indicated.",
					],
				},
				{
					h: "3. Hosting and technical services",
					p: [
						"The site relies on third-party technical providers (including for hosting, database, authentication, media and operational emails), as described in our privacy policy.",
					],
				},
				{
					h: "4. Intellectual property",
					p: [
						"The site, its content, the logo, the Amazigh motifs, the designs and the photographs are the exclusive property of Maison Titrit, unless otherwise stated. Any reproduction, in whole or in part, without prior written permission is prohibited.",
					],
				},
				{
					h: "5. Personal data and cookies",
					p: [
						"The processing of personal data and the use of cookies are detailed in our privacy policy and our dedicated cookies page. You can manage your consent preferences at any time using the preferences button displayed on the site.",
					],
				},
				{
					h: "6. Contact",
					p: [
						"For any question about the site, an order or this notice, contact us using the verified contact details published on the site.",
					],
				},
			],
			related: [
				{ label: "Privacy policy", href: "/confidentialite" },
				{ label: "Terms of sale", href: "/cgv" },
				{ label: "Cookies", href: "/cookies" },
			],
		},
		cookies: {
			eyebrow: "Legal information",
			title: "Cookies and preferences",
			updated: "Last updated: November 19, 2026",
			intro:
				"This page explains how Maison Titrit uses cookies and similar technologies on maisontitrit.com, and the choices available to you. Analytics and marketing tools are activated only after your explicit consent, when you grant it.",
			sections: [
				{
					h: "1. What is a cookie?",
					p: [
						"A cookie is a small file or piece of information stored on your device (browser, phone, computer) when you visit a site. Similar technologies (local storage, technical identifiers) may be used for equivalent purposes.",
					],
				},
				{
					h: "2. Necessary cookies and storage",
					p: [
						"Some elements are essential for the site to function, such as remembering your language, display preferences, cart state and consent choices. These elements are used without relying on optional analytics or marketing purposes.",
					],
				},
				{
					h: "3. Audience measurement (with consent)",
					p: [
						"If you allow it, we may use audience and performance measurement tools (for example Vercel Analytics/Speed Insights and, when configured, services such as Google Tag Manager/Google Analytics). Some Google services operate with consent mode: by default, storage related to analytics and advertising is denied, then updated according to your choices.",
					],
				},
				{
					h: "4. Marketing (with consent)",
					p: [
						"If you allow it, tools for measuring campaigns and marketing actions may be activated (for example Meta, Pinterest or TikTok, when configured). These tools are loaded only after your explicit consent in the consent banner.",
					],
				},
				{
					h: "5. Managing your choices",
					p: [
						"On your first visit, a banner lets you accept, reject or customize your preferences. You can change your choice at any time using the cookie preferences button displayed on the site. Refusing optional categories does not prevent you from using the essential functions of the site.",
					],
				},
				{
					h: "6. Learn more",
					p: [
						"For more information about personal data, recipients, retention periods and your rights, see our privacy policy or contact us using the verified contact details published on the site.",
					],
				},
			],
			related: [
				{ label: "Privacy policy", href: "/confidentialite" },
				{ label: "Legal notice", href: "/mentions-legales" },
			],
		},
		deliveryReturns: {
			eyebrow: "Help & orders",
			title: "Delivery and returns",
			updated: "Last updated: November 19, 2026",
			intro:
				"This page summarizes key information about delivery, cash on delivery and exchanges or returns at Maison Titrit. Full conditions are set out in our terms of sale; in case of any difference, the terms of sale prevail.",
			sections: [
				{
					h: "1. Payment",
					p: [
						"Payment is cash on delivery (COD), paid in cash when you receive the package. No online payment is collected on the site.",
					],
				},
				{
					h: "2. Delivery",
					p: [
						"We deliver within Morocco. Timeframes and practical arrangements are communicated when your order is confirmed, depending on the destination and item availability.",
						"Please provide an accurate address and a reachable phone number. In case of absence at delivery, additional attempts may incur fees in accordance with the applicable conditions.",
					],
				},
				{
					h: "3. Order confirmation",
					p: [
						"Orders placed through the site or WhatsApp are confirmed by phone or WhatsApp. An order is considered final only after confirmation.",
					],
				},
				{
					h: "4. Exchanges and returns",
					p: [
						"You may request an exchange or return within 7 days of receipt, provided the item is unworn, unwashed, with its tags and proof of purchase.",
						"Return shipping is at your expense, unless there is a defect or an error on our part — in that case, Maison Titrit covers the exchange or refund as appropriate.",
					],
				},
				{
					h: "5. Claims and assistance",
					p: [
						"For any question about delivery, an exchange, a return or a defect, contact us using the verified contact details published on the site, quoting your order number and, if helpful, attaching photos.",
					],
				},
			],
			related: [
				{ label: "Terms of sale", href: "/cgv" },
				{ label: "Contact", href: "/contact" },
				{ label: "Size guide", href: "/guide-des-tailles" },
			],
		},
		sizing: {
			eyebrow: "Help & orders",
			title: "Size guide",
			updated: "Last updated: November 19, 2026",
			intro:
				"This guide helps you choose the most suitable size. Cuts, fabrics and availability may vary by model; always refer to the product page information and contact us if you are unsure.",
			sections: [
				{
					h: "1. How to take your measurements",
					p: [
						"Use a soft measuring tape, kept flat against the body without pulling tight. For better accuracy, take measurements over light clothing or directly on your body.",
						"Bust: measure around the fullest part. Waist: measure at the natural waist. Hips: measure around the widest part. Length: depending on the piece, measure from the shoulder or waist to the desired length.",
					],
				},
				{
					h: "2. Sizes and availability",
					p: [
						"Available sizes depend on each piece (for example S, M, L, XL or XXL depending on the model). Size availability may change; check the product page or contact the house to confirm the size you want.",
					],
				},
				{
					h: "3. Fit, adjustments and tips",
					p: [
						"Some pieces have a relaxed fit or ties (belt, drawstring) that allow you to adjust the drape. If you are between two sizes or would like personalized advice, we recommend contacting us before ordering.",
					],
				},
				{
					h: "4. Need help?",
					p: [
						"Message us on WhatsApp or by email with the model reference, your measurements and your fit preferences. We will help you choose the most suitable size before confirming your order.",
					],
				},
			],
			related: [
				{ label: "Delivery and returns", href: "/livraison-retours" },
				{ label: "Contact", href: "/contact" },
				{ label: "Terms of sale", href: "/cgv" },
			],
		},
	},
};
