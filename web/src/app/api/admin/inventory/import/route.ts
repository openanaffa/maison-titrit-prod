import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
	adjustStock,
	damageStock,
	receiveStock,
	returnStock,
} from "@/lib/inventory";
import {
	type ImportRow,
	importRowKey,
	normalizeRow,
	validateImportRows,
} from "@/lib/inventory-import";
import { requirePermission } from "@/lib/session";

export const dynamic = "force-dynamic";

const MAX_ROWS = 500;

/**
 * Bulk stock import (#120).
 *
 * Body: { rows: unknown[], commit: boolean, idempotencyKey: string }
 * - commit=false → dry-run: per-row validation only, nothing applied.
 * - commit=true  → rows are applied independently through the ledger
 *   service; failures are reported per row (never silently skipped).
 *   Duplicate SKUs within the file are rejected during validation.
 * - Per-row movement idempotency keys (`import:<key>:<row>`) make a
 *   retried commit ledger-safe: already-applied rows replay as no-ops.
 */
export async function POST(req: Request) {
	const { user, allowed } = await requirePermission("products:write");
	if (!user || !allowed)
		return NextResponse.json({ error: "Non autorisé." }, { status: 403 });

	let body: unknown;
	try {
		body = await req.json();
	} catch {
		return NextResponse.json({ error: "Corps invalide." }, { status: 400 });
	}
	const data = body as {
		rows?: unknown[];
		commit?: boolean;
		idempotencyKey?: string;
	};
	if (!Array.isArray(data.rows) || data.rows.length === 0)
		return NextResponse.json({ error: "Aucune ligne." }, { status: 400 });
	if (data.rows.length > MAX_ROWS)
		return NextResponse.json(
			{ error: `Trop de lignes (max ${MAX_ROWS}).` },
			{ status: 400 },
		);
	const importKey =
		typeof data.idempotencyKey === "string" && data.idempotencyKey.trim()
			? data.idempotencyKey.trim()
			: `imp-${createHash("sha256").update(JSON.stringify(data.rows)).digest("hex").slice(0, 16)}`;

	const rows: ImportRow[] = [];
	const shapeIssues: { row: number; sku: string; errors: string[] }[] = [];
	data.rows.forEach((raw, i) => {
		const row = normalizeRow(raw, i + 1);
		if (row) rows.push(row);
		else shapeIssues.push({ row: i + 1, sku: "", errors: ["ROW_MALFORMED"] });
	});

	const { issues } = validateImportRows(rows);
	const allIssues = [...shapeIssues, ...issues];
	if (allIssues.length > 0) {
		return NextResponse.json(
			{ ok: false, stage: "validation", issues: allIssues },
			{ status: 422 },
		);
	}

	if (data.commit !== true) {
		return NextResponse.json({
			ok: true,
			stage: "preview",
			count: rows.length,
		});
	}

	// Resolve SKUs to variant ids; unknown SKUs are row failures.
	const skus = [...new Set(rows.map((r) => r.sku))];
	const variants = await db.productVariant.findMany({
		where: { sku: { in: skus } },
		select: { id: true, sku: true },
	});
	const bySku = new Map(variants.map((v) => [v.sku, v.id]));

	const applied: number[] = [];
	const replayed: number[] = [];
	const failed: { row: number; sku: string; error: string }[] = [];
	for (const row of rows) {
		const n = row.originalRow;
		const variantId = bySku.get(row.sku);
		if (!variantId) {
			failed.push({ row: n, sku: row.sku, error: "SKU_UNKNOWN" });
			continue;
		}
		const opts = {
			actorId: user.id,
			reason: row.reason ?? `import ${importKey}`,
			idempotencyKey: importRowKey(importKey, n),
		};
		try {
			let result: Awaited<ReturnType<typeof receiveStock>>;
			switch (row.action) {
				case "receive":
					result = await receiveStock(variantId, row.qty, opts);
					break;
				case "adjust":
					result = await adjustStock(variantId, row.qty, opts);
					break;
				case "damage":
					result = await damageStock(variantId, Math.abs(row.qty), opts);
					break;
				case "return":
					result = await returnStock(variantId, Math.abs(row.qty), opts);
					break;
			}
			// The ledger replays an already-applied row key as a no-op — a
			// retried import never double-applies.
			if (result.replayed) replayed.push(n);
			else applied.push(n);
		} catch (e) {
			failed.push({
				row: n,
				sku: row.sku,
				error: e instanceof Error ? e.message : "ERREUR_INCONNU",
			});
		}
	}

	return NextResponse.json({
		ok: true,
		stage: "commit",
		appliedCount: applied.length,
		appliedRows: applied,
		replayedRows: replayed,
		failed,
	});
}
