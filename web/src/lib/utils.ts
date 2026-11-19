import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * The vintage role classes in globals.css live in `@layer components`, so
 * tailwind-merge cannot see them. Without registration it would keep base
 * utilities such as `border-input`/`rounded-md` from shadcn primitives, and
 * those (later-layer) utilities would win the CSS cascade over the roles.
 * Each role gets its own class group with explicit conflicts for the utility
 * groups it replaces (a class can only belong to one group in twMerge).
 */
const labelRoles = [
	"label-vintage",
	"label-vintage-sm",
	"label-vintage-tight",
	"label-vintage-wide",
	"label-vintage-lg",
];
const headingRoles = [
	"heading-vintage",
	"heading-vintage-sm",
	"heading-vintage-md",
	"heading-vintage-lg",
	"heading-vintage-xl",
];
const bodyRoles = [
	"body-vintage",
	"body-vintage-sm",
	"body-vintage-muted",
	"body-vintage-soft",
];

type VintageClassGroup =
	| "vintage-label"
	| "vintage-heading"
	| "vintage-body"
	| "vintage-field";

export const twMerge = extendTailwindMerge<VintageClassGroup>({
	extend: {
		classGroups: {
			"vintage-label": labelRoles,
			"vintage-heading": headingRoles,
			"vintage-body": bodyRoles,
			"vintage-field": ["field-vintage"],
		},
		conflictingClassGroups: {
			"vintage-label": [
				"font-family",
				"font-size",
				"leading",
				"text-color",
				"text-transform",
				"tracking",
			],
			"vintage-heading": [
				"font-family",
				"font-size",
				"font-weight",
				"leading",
				"text-color",
			],
			"vintage-body": ["font-family", "font-size", "leading", "text-color"],
			"vintage-field": ["rounded", "border-color"],
		},
	},
});

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
