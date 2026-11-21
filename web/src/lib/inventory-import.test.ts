import { describe, expect, test } from "bun:test";
import {
	importRowKey,
	normalizeRow,
	parseCsv,
	rowsFromCsv,
	validateImportRows,
} from "./inventory-import";

describe("inventory import validation", () => {
	test("accepts valid rows and counts them", () => {
		const { issues, validCount } = validateImportRows([
			{ sku: "MT-S-M", action: "receive", qty: 5 },
			{ sku: "MT-S-L", action: "adjust", qty: -2, reason: "comptage" },
			{ sku: "MT-S-S", action: "damage", qty: 1 },
			{ sku: "MT-S-XL", action: "return", qty: 3, reason: "retour client" },
		]);
		expect(issues).toHaveLength(0);
		expect(validCount).toBe(4);
	});

	test("rejects non-positive quantities except signed adjust", () => {
		const { issues } = validateImportRows([
			{ sku: "A", action: "receive", qty: 0 },
			{ sku: "B", action: "damage", qty: -3 },
			{ sku: "C", action: "adjust", qty: 0 },
			{ sku: "D", action: "adjust", qty: 1.5 },
			{ sku: "E", action: "receive", qty: Number.NaN },
		]);
		expect(issues.map((i) => i.row)).toEqual([1, 2, 3, 4, 5]);
	});

	test("flags duplicate SKUs within one file", () => {
		const { issues } = validateImportRows([
			{ sku: "DUP", action: "receive", qty: 1 },
			{ sku: "DUP", action: "adjust", qty: 2 },
			{ sku: "OTHER", action: "receive", qty: 1 },
		]);
		const dup = issues.filter((i) => i.errors.includes("SKU_DUPLICATE"));
		expect(dup.map((i) => i.row)).toEqual([1, 2]);
		expect(issues).toHaveLength(2);
	});

	test("normalization rejects malformed raw rows", () => {
		expect(normalizeRow({ sku: "X", action: "unknown", qty: 1 })).toBeNull();
		expect(
			normalizeRow({ sku: "X", action: "receive", qty: "abc" }),
		).toBeNull();
		expect(normalizeRow(null)).toBeNull();
		expect(normalizeRow({ sku: "X", action: "receive", qty: 2 })).toEqual({
			sku: "X",
			action: "receive",
			qty: 2,
			reason: undefined,
		});
	});
});

describe("csv parsing", () => {
	test("parses quoted fields, CRLF and skips blank lines", () => {
		const parsed = parseCsv(
			'sku,action,qty,reason\r\nA,receive,2,"un, deux"\r\n\r\nB,adjust,-1,\r\n',
		);
		expect(parsed).toHaveLength(3);
		expect(parsed[1]).toEqual(["A", "receive", "2", "un, deux"]);
	});

	test("rowsFromCsv maps the documented header and ignores extra columns", () => {
		const { rows, parseIssues } = rowsFromCsv(
			"productRef,productName,sku,action,qty,reason,onHand\nREF1,Nom,E2E-SKU-M,receive,4,,5\nREF1,Nom,E2E-SKU-M,adjust,x,,5\n",
		);
		expect(rows).toHaveLength(1);
		expect(rows[0]).toEqual({
			sku: "E2E-SKU-M",
			action: "receive",
			qty: 4,
			reason: undefined,
		});
		expect(parseIssues).toEqual([
			{ row: 3, sku: "E2E-SKU-M", errors: ["ROW_MALFORMED"] },
		]);
	});

	test("header without sku/action/qty is rejected", () => {
		const { rows, parseIssues } = rowsFromCsv("a,b,c\n1,2,3\n");
		expect(rows).toHaveLength(0);
		expect(parseIssues[0].errors).toEqual(["HEADER_INVALID"]);
	});
});

describe("ledger key convention", () => {
	test("per-row keys are unique and namespaced", () => {
		const k1 = importRowKey("e2e-import-1", 0);
		const k2 = importRowKey("e2e-import-1", 1);
		expect(k1).toBe("import:e2e-import-1:0");
		expect(k1).not.toBe(k2);
	});
});
