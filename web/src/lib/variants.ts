/**
 * Product variant helpers.
 *
 * A ProductVariant represents one purchasable size/colour combination of a
 * Product. These helpers are pure and shared by the backoffice (variant
 * generation), the storefront (selection) and tests.
 */

export function parseOptions(input: string | null | undefined): string[] {
	if (!input) return [];
	return input
		.split(/[·,/-]/)
		.map((s) => s.trim())
		.filter(Boolean);
}

/** Normalise a free-text option value into a SKU-safe token. */
export function optionToken(value: string | null | undefined): string {
	if (!value) return "";
	return value
		.trim()
		.toUpperCase()
		.replace(/[^A-Z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

/** Build a stable, human-readable SKU for a variant. */
export function buildVariantSku(
	productRef: string,
	size: string | null,
	color: string | null,
): string {
	const parts = [productRef.trim().toUpperCase()];
	const sizeToken = optionToken(size);
	const colorToken = optionToken(color);
	if (sizeToken) parts.push(sizeToken);
	if (colorToken) parts.push(colorToken);
	return parts.join("-");
}

export type VariantCombination = { size: string | null; color: string | null };

/**
 * Cartesian product of the parsed colour and size option lists.
 * Empty lists collapse to a single null entry so products without options
 * still get one default variant.
 */
export function variantCombinations(
	colorsInput: string | null | undefined,
	sizesInput: string | null | undefined,
): VariantCombination[] {
	const colors = parseOptions(colorsInput);
	const sizes = parseOptions(sizesInput);
	const colorList = colors.length ? colors : [null];
	const sizeList = sizes.length ? sizes : [null];
	const out: VariantCombination[] = [];
	for (const color of colorList) {
		for (const size of sizeList) {
			out.push({ color, size });
		}
	}
	return out;
}

export function variantLabel(
	size: string | null,
	color: string | null,
): string {
	return [color, size].filter(Boolean).join(" / ") || "Default";
}
