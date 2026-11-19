/** True when a field carries a real, displayable verified value. */
export function hasVerifiedLegalValue(
	value: string | null | undefined,
): boolean {
	const v = String(value ?? "").trim();
	if (!v) return false;
	if (/^todo\b/i.test(v)) return false;
	// Legacy masked placeholders used in config/site.ts.
	if (/^[�^\-_\s]+$/.test(v)) return false;
	return true;
}
