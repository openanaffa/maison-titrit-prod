/**
 * ============================================================================
 *  MAISON TITRIT — i18n DICTIONARIES (FR / AR / EN + Tifinagh flourishes)
 * ----------------------------------------------------------------------------
 *  All user-facing UI strings live here, keyed by dot-notation.
 *  Access via: const { t } = useT();  t("hero.title")
 *
 *  `fr` is the default. `ar` flips the layout to RTL in the provider.
 *  Product copy stays in French (the brand's working language); the brand's
 *  Arabic welcome "مرحبا ب طلباتكم 🥰" is used as a flourish in AR locale.
 * ============================================================================
 */
import { Arabic, English, French } from "./lang";

export type Locale = "fr" | "ar" | "en";

export const LOCALES: {
	code: Locale;
	label: string;
	short: string;
	dir: "ltr" | "rtl";
}[] = [
	{ code: "fr", label: "Français", short: "FR", dir: "ltr" },
	{ code: "ar", label: "العربية", short: "AR", dir: "rtl" },
	{ code: "en", label: "English", short: "EN", dir: "ltr" },
];

export const DEFAULT_LOCALE: Locale = "fr";

/** Resolve an arbitrary (possibly bogus) locale string to a known locale. */
export function resolveLocale(value: string | null | undefined): Locale {
	return value && dictionaries[value as Locale]
		? (value as Locale)
		: DEFAULT_LOCALE;
}

type Dict = Record<string, string>;

export const dictionaries: Record<Locale, Dict> = {
	/* --------------------------------------------------------------------- */
	fr: French,
	/* --------------------------------------------------------------------- */
	ar: Arabic,

	/* --------------------------------------------------------------------- */
	en: English,
};

/** Interpolate {name} placeholders in a translated string. */
export function interpolate(
	str: string,
	vars?: Record<string, string | number>,
): string {
	if (!vars) return str;
	return str.replace(/\{(\w+)\}/g, (_, k) =>
		vars[k] !== undefined ? String(vars[k]) : `{${k}}`,
	);
}
