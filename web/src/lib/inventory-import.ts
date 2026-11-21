/**
 * Inventory CSV import (#120): row parsing + validation shared by the
 * preview UI and the import endpoint. Pure and framework-free so the
 * acceptance tests (valid/invalid rows, duplicates) can run without a
 * database.
 *
 * Import model: each row targets a variant by SKU and applies one stock
 * action via the inventory ledger service. Rows are committed
 * independently; failures are reported per row (no silent partial state).
 * Duplicate SKUs inside one file are rejected up front — two rows
 * targeting the same variant would both apply and the intent becomes
 * ambiguous.
 */

export const IMPORT_ACTIONS = [
	"receive",
	"adjust",
	"damage",
	"return",
] as const;
export type ImportAction = (typeof IMPORT_ACTIONS)[number];

export type ImportRow = {
	sku: string;
	action: ImportAction;
	qty: number;
	reason?: string;
};

export type RowIssues = { row: number; sku: string; errors: string[] };

/** Movement idempotency key for one import row (ledger-safe retries). */
export function importRowKey(importKey: string, row: number): string {
	return `import:${importKey}:${row}`;
}

function isRecord(v: unknown): v is Record<string, unknown> {
	return typeof v === "object" && v !== null;
}

/** Normalize + type-check one raw parsed row. Returns null on shape errors. */
export function normalizeRow(raw: unknown): ImportRow | null {
	if (!isRecord(raw)) return null;
	const sku = typeof raw.sku === "string" ? raw.sku.trim() : "";
	const action = typeof raw.action === "string" ? raw.action.trim() : "";
	const qtyRaw = raw.qty;
	const qty =
		typeof qtyRaw === "number"
			? qtyRaw
			: typeof qtyRaw === "string" && qtyRaw.trim() !== ""
				? Number(qtyRaw)
				: Number.NaN;
	const reason = typeof raw.reason === "string" ? raw.reason.trim() : undefined;
	if (!sku || !IMPORT_ACTIONS.includes(action as ImportAction)) return null;
	if (!Number.isFinite(qty)) return null;
	return {
		sku,
		action: action as ImportAction,
		qty,
		reason: reason || undefined,
	};
}

/**
 * Validate a full import file. Returns per-row issues (1-based row numbers
 * mirroring the CSV/preview) including duplicate-SKU detection.
 */
export function validateImportRows(rows: ImportRow[]): {
	issues: RowIssues[];
	validCount: number;
} {
	const issues: RowIssues[] = [];
	const skuRows = new Map<string, number[]>();
	rows.forEach((r, i) => {
		if (!skuRows.has(r.sku)) skuRows.set(r.sku, []);
		skuRows.get(r.sku)?.push(i + 1);
	});

	rows.forEach((r, i) => {
		const errors: string[] = [];
		const n = i + 1;
		if (!r.sku) errors.push("SKU_MISSING");
		if (!IMPORT_ACTIONS.includes(r.action)) errors.push("ACTION_INVALID");
		if (!Number.isFinite(r.qty)) errors.push("QTY_INVALID");
		else if (r.action === "adjust") {
			if (!Number.isInteger(r.qty) || r.qty === 0)
				errors.push("QTY_ADJUST_NONZERO_INT");
		} else if (!Number.isInteger(r.qty) || r.qty <= 0)
			errors.push("QTY_POSITIVE_INT");
		const seen = skuRows.get(r.sku) ?? [];
		if (r.sku && seen.length > 1) errors.push("SKU_DUPLICATE");
		if (errors.length > 0) issues.push({ row: n, sku: r.sku, errors });
	});

	return { issues, validCount: rows.length - issues.length };
}

/** Minimal CSV parser: comma-separated, double-quoted fields, CRLF-safe. */
export function parseCsv(text: string): string[][] {
	const rows: string[][] = [];
	let field = "";
	let row: string[] = [];
	let inQuotes = false;
	for (let i = 0; i < text.length; i++) {
		const c = text[i];
		if (inQuotes) {
			if (c === '"') {
				if (text[i + 1] === '"') {
					field += '"';
					i++;
				} else inQuotes = false;
			} else field += c;
		} else if (c === '"') inQuotes = true;
		else if (c === ",") {
			row.push(field);
			field = "";
		} else if (c === "\n" || c === "\r") {
			if (c === "\r" && text[i + 1] === "\n") i++;
			row.push(field);
			field = "";
			if (row.length > 1 || row[0] !== "") rows.push(row);
			row = [];
		} else field += c;
	}
	row.push(field);
	if (row.length > 1 || row[0] !== "") rows.push(row);
	return rows;
}

export const ACTION_ALIASES: Record<string, ImportAction> = {
	receive: "receive",
	adjust: "adjust",
	damage: "damage",
	return: "return",
	retour: "return",
	reception: "receive",
	réception: "receive",
	ajustement: "adjust",
	ajust: "adjust",
	casse: "damage",
};

/** CSV header: sku,action,qty,reason — exported products carry extra columns; ignore them. */
export function rowsFromCsv(text: string): {
	rows: ImportRow[];
	parseIssues: RowIssues[];
} {
	const table = parseCsv(text);
	if (table.length === 0) return { rows: [], parseIssues: [] };
	const header = table[0].map((h) => h.trim().toLowerCase());
	const skuIdx = header.indexOf("sku");
	const actionIdx = header.findIndex((h) => h === "action" || h === "type");
	const qtyIdx = header.findIndex(
		(h) => h === "qty" || h === "quantite" || h === "quantité",
	);
	const reasonIdx = header.indexOf("reason");
	if (skuIdx < 0 || actionIdx < 0 || qtyIdx < 0) {
		return {
			rows: [],
			parseIssues: [{ row: 1, sku: "", errors: ["HEADER_INVALID"] }],
		};
	}
	const rows: ImportRow[] = [];
	const parseIssues: RowIssues[] = [];
	table.slice(1).forEach((cells, i) => {
		const raw = {
			sku: cells[skuIdx] ?? "",
			action:
				ACTION_ALIASES[(cells[actionIdx] ?? "").trim().toLowerCase()] ??
				(cells[actionIdx] ?? "").trim().toLowerCase(),
			qty: cells[qtyIdx] ?? "",
			reason: reasonIdx >= 0 ? (cells[reasonIdx] ?? "") : "",
		};
		const row = normalizeRow(raw);
		if (row) rows.push(row);
		else
			parseIssues.push({
				row: i + 2,
				sku: typeof raw.sku === "string" ? raw.sku : "",
				errors: ["ROW_MALFORMED"],
			});
	});
	return { rows, parseIssues };
}
