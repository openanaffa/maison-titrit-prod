/**
 * ============================================================================
 *  MAISON TITRIT — LEGAL DOCUMENT CONTENT (Privacy policy · CGV)
 * ----------------------------------------------------------------------------
 *  Long-form legal content lives HERE (not in dictionaries.ts, which carries
 *  short UI strings only). Rendered by components/maison/legal-page.tsx and
 *  indexed publicly at /confidentialite and /cgv.
 *
 *  Content reflects the actual data practices of this codebase (Google OAuth,
 *  COD checkout fields, consent-gated pixels — see config/site.ts `analytics`).
 *  ⚠️ The return/exchange window (7 days) should be reviewed by the owner
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
  /* FR — default locale                                                    */
  /* ====================================================================== */
  fr: {
    privacy: {
      eyebrow: "Informations légales",
      title: "Politique de confidentialité",
      updated: "Mis à jour le 14 novembre 2026",
      intro:
        "Cette politique explique comment Maison Titrit collecte, utilise et protège vos données personnelles lorsque vous utilisez ce site. Elle s'applique conformément à la loi marocaine n° 09-08 relative à la protection des données à caractère personnel et, lorsque le RGPD s'applique, au Règlement (UE) 2016/679.",
      sections: [
        {
          h: "1. Responsable du traitement",
          p: [
            "Le responsable du traitement est Mohamed Moughamir — Auto-Entrepreneur, exploitant la marque Maison Titrit, Magasin N°4, Lots 5-6, Lotissement Dar Najeddine, Bouskoura, Casablanca (Maroc).",
            "Pour toute question relative à vos données personnelles : Maisontitrit67@gmail.com.",
          ],
        },
        {
          h: "2. Données collectées",
          p: [
            "Compte — lorsque vous vous connectez avec Google, nous recevons votre nom, votre adresse email et votre photo de profil depuis votre compte Google. Nous ne stockons jamais votre mot de passe.",
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
            "Vos données sont hébergées par Vercel (site), Supabase (base de données, Union européenne), Cloudflare R2 (images) et Brevo (alertes email internes). L'authentification passe par Google. Les services de mesure d'audience et de publicité ne sont chargés qu'après votre consentement. Le détail de votre commande est transmis à notre équipe via WhatsApp et email pour préparer l'expédition.",
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
            "Vous disposez d'un droit d'accès, de rectification, d'effacement, d'opposition et de portabilité de vos données. Exercez-les en écrivant à Maisontitrit67@gmail.com — nous vous répondrons dans les meilleurs délais.",
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
      ],
    },
    terms: {
      eyebrow: "Informations légales",
      title: "Conditions générales de vente",
      updated: "Mis à jour le 14 novembre 2026",
      intro:
        "Les présentes conditions régissent les ventes conclues sur maisontitrit.com entre Maison Titrit et tout client particulier. Toute commande implique leur acceptation sans réserve.",
      sections: [
        {
          h: "1. Éditeur du site",
          p: [
            "Le site est édité par Mohamed Moughamir — Auto-Entrepreneur (RNAE 001609783000007), marque Maison Titrit, Magasin N°4, Lots 5-6, Lotissement Dar Najeddine, Bouskoura, Casablanca (Maroc). Contact : Maisontitrit67@gmail.com — 06 84 92 19 42.",
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
      updated: "آخر تحديث: 14 نوفمبر 2026",
      intro:
        "توضح هذه السياسة كيفية جمع ميزون تيتريت لبياناتك الشخصية واستخدامها وحمايتها عند استخدامك لهذا الموقع. وهي تُطبَّق وفقًا للقانون المغربي رقم 09-08 المتعلق بحماية الأشخاص الذاتيين من معالجة المعطيات ذات الطابع الشخصي، ووفقًا للائحة العامة لحماية البيانات (GDPR) عند انطباقها.",
      sections: [
        {
          h: "1. مسؤول المعالجة",
          p: [
            "مسؤول المعالجة هو محمد مغيمل — مقاول ذاتي، صاحب علامة ميزون تيتريت، المحل رقم 4، القطع 5-6، تجزئة دار نجيد، بوسكورة، الدار البيضاء (المغرب).",
            "لأي سؤال يتعلق ببياناتك الشخصية: Maisontitrit67@gmail.com.",
          ],
        },
        {
          h: "2. البيانات المجمَّعة",
          p: [
            "الحساب — عند تسجيل الدخول عبر Google، نستقبل اسمك وعنوان بريدك الإلكتروني وصورة ملفك الشخصي من حساب Google. لا نخزّن كلمة مرورك أبدًا.",
            "الطلبات — الاسم، الهاتف، البريد الإلكتروني (اختياري)، المدينة، عنوان التوصيل، الملاحظات وتفاصيل المنتجات. هذه المعلومات ضرورية لمعالجة طلبك وتوصيله.",
            "التصفح — يُحفظ سلة التفضيلات ولغتك وسمتك محليًا في متصفحك. كما نحتفظ بسجلات تقنية (عنوان IP، التاريخ، الصفحات المزارة) لحماية الموقع.",
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
            "تُستضاف بياناتك لدى Vercel (الموقع) وSupabase (قاعدة البيانات، الاتحاد الأوروبي) وCloudflare R2 (الصور) وBrevo (تنبيهات البريد الداخلية). ويمر تسجيل الدخول عبر Google. ولا تُحمَّل خدمات قياس الجمهور والإعلانات إلا بعد موافقتك. ويُرسَل تفاصيل طلبك إلى فريقنا عبر واتساب والبريد لإعداد الشحنة.",
            "لا نبيع بياناتك الشخصية ولا نؤجّرها إلى أي طرف ثالث.",
          ],
        },
        {
          h: "6. مدة الاحتفاظ بالبيانات",
          p: [
            "الحساب — حتى حذف حسابك. الطلبات — المدة التي تفرضها اللوائح المحاسبية وال fiscale المغربية. السجلات التقنية — بضعة أشهر. الموافقة — حتى سحب اختيارك.",
          ],
        },
        {
          h: "7. حقوقك",
          p: [
            "يحق لك الاطلاع على بياناتك وتصحيحها وحذفها والاعتراض عليها ونقلها. مارس حقوقك عبر مراسلة Maisontitrit67@gmail.com — وسنرد عليك في أقرب وقت ممكن.",
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
            "قد تتطور هذه السياسة لتعكس ممارساتنا أو التشريعات. ويظهر تاريخ آخر تحديث أعلى الصفحة؛ وسنُعلمكم على الموقع عند أي جوهري.",
          ],
        },
      ],
      related: [{ label: "شروط البيع العامة", href: "/cgv" }],
    },
    terms: {
      eyebrow: "معلومات قانونية",
      title: "شروط البيع العامة",
      updated: "آخر تحديث: 14 نوفمبر 2026",
      intro:
        "تحكم هذه الشروط عمليات البيع التي تتم عبر maisontitrit.com بين ميزون تيتريت وأي زبون شخصي. ويشمل أي طلب قبولها دون تحفظ.",
      sections: [
        {
          h: "1. مُحرِّر الموقع",
          p: [
            "يُحرِّر الموقع محمد مغيمل — مقاول ذاتي (RNAE 001609783000007)، علامة ميزون تيتريت، المحل رقم 4، القطع 5-6، تجزئة دار نجيد، بوسكورة، الدار البيضاء (المغرب). التواصل: Maisontitrit67@gmail.com — 06 84 92 19 42.",
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
            "الأسعار معروضة بالدرهم المغربي (MAD). وتُبلَّغ вам رسوم التوصيل قبل تأكيد الطلب. ونحتفظ بحق تعديل أسعارنا في أي وقت؛ والسعر المعتمد هو المؤكَّد عند طلبك.",
          ],
        },
        {
          h: "4. الطلبات",
          p: [
            "يمكنك الطلب عبر سلة الموقع أو مباشرة عبر واتساب. ويُخضع كل طلب للتأكيد عبر الهاتف أو واتساب. وعند غياب التأكيد أو توفر المنتج، قد يُلغى الطلب. والطلب المؤكَّد نهائي.",
          ],
        },
        {
          h: "5. الأداء",
          p: [
            "يُؤدَّى الأداء عند التوصيل (COD)، نقدًا عند استلام الطرد. ولا يحصّل الموقع أي دفعة مسبقًا.",
          ],
        },
        {
          h: "6. التوصيل",
          p: [
            "نوصّل إلى جميع أنحاء المغرب. وتُبلَّغ المدد عند التأكيد حسب الوجهة. ومسؤوليتك دقة عنوان التوصيل؛ وعند غيابك وقت التوصيل، قد تستلزم المحاولات الإضافية رسومًا على حسابك.",
          ],
        },
        {
          h: "7. الاستبدال والإرجاع",
          p: [
            "يحق لك خلال 7 أيام من الاستلام طلب استبدال أو إرجاع، شرط أن تكون القطعة غير مستعملة وغير مغسولة وبطاقاتها مثبتة مع إثبات الشراء. ورسوم الإرجاع على حسابك، إلا في حال وجود عيب أو خطأ من جانبنا — فيتكفل حينها ميزون تيتريت بالاستبدال أو الاسترداد.",
            "لأي شكوى، راسلنا عبر واتساب أو البريد مع رقم طلبك.",
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
            "يصف معالجة بياناتك الشخصية سياسة الخصوصية الخاصة بنا، المتاحة أسفل الصفحة.",
          ],
        },
        {
          h: "12. القانون الواجب التطبيق والنزاعات",
          p: [
            "تخضع هذه الشروط للقانون المغربي. وفي حالة النزاع، تختص محاكم الدار البيضاء حصريًا. وندعوك أولًا إلى التواصل معنا للبحث عن حل ودي.",
          ],
        },
      ],
      related: [{ label: "سياسة الخصوصية", href: "/confidentialite" }],
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
            "The data controller is Mohamed Moughamir — Sole Proprietor, operating the Maison Titrit brand, Shop No. 4, Lots 5-6, Dar Najeddine Estate, Bouskoura, Casablanca (Morocco).",
            "For any question about your personal data: Maisontitrit67@gmail.com.",
          ],
        },
        {
          h: "2. Data we collect",
          p: [
            "Account — when you sign in with Google, we receive your name, email address and profile picture from your Google account. We never store your password.",
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
            "Your data is hosted by Vercel (site), Supabase (database, European Union), Cloudflare R2 (images) and Brevo (internal email alerts). Sign-in goes through Google. Analytics and advertising services are only loaded after your consent. Your order details are sent to our team via WhatsApp and email to prepare the shipment.",
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
            "You have the right to access, rectify, erase, object to and port your data. Exercise them by writing to Maisontitrit67@gmail.com — we will respond as soon as possible.",
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
            "The site is published by Mohamed Moughamir — Sole Proprietor (RNAE 001609783000007), Maison Titrit brand, Shop No. 4, Lots 5-6, Dar Najeddine Estate, Bouskoura, Casablanca (Morocco). Contact: Maisontitrit67@gmail.com — 06 84 92 19 42.",
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
      related: [{ label: "Privacy policy", href: "/confidentialite" }],
    },
  },
};
