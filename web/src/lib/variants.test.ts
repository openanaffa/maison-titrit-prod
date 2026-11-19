import { describe, expect, test } from "bun:test";
import {
	buildVariantSku,
	parseOptions,
	variantCombinations,
	variantLabel,
} from "./variants";

describe("parseOptions", () => {
	test("splits on middot/comma/slash/dash", () => {
		expect(parseOptions("S · M · L")).toEqual(["S", "M", "L"]);
		expect(parseOptions("Beige, Bleu Ciel, Rose Baby")).toEqual([
			"Beige",
			"Bleu Ciel",
			"Rose Baby",
		]);
		expect(parseOptions("")).toEqual([]);
		expect(parseOptions(null)).toEqual([]);
	});
});

describe("buildVariantSku", () => {
	test("includes ref + size + color tokens", () => {
		expect(buildVariantSku("MT-01", "M", "Bleu Ciel")).toBe(
			"MT-01-M-BLEU-CIEL",
		);
	});
	test("omits missing options", () => {
		expect(buildVariantSku("MT-01", null, null)).toBe("MT-01");
		expect(buildVariantSku("MT-01", "L", null)).toBe("MT-01-L");
	});
	test("is stable for identical inputs", () => {
		expect(buildVariantSku("MT-01", "M", "Beige")).toBe(
			buildVariantSku("MT-01", "M", "Beige"),
		);
	});
});

describe("variantCombinations", () => {
	test("cartesian product", () => {
		expect(variantCombinations("Beige · Rose", "S · M")).toEqual([
			{ color: "Beige", size: "S" },
			{ color: "Beige", size: "M" },
			{ color: "Rose", size: "S" },
			{ color: "Rose", size: "M" },
		]);
	});
	test("collapses empty lists to a single default", () => {
		expect(variantCombinations("", "")).toEqual([{ color: null, size: null }]);
		expect(variantCombinations("Beige", "")).toEqual([
			{ color: "Beige", size: null },
		]);
	});
});

describe("variantLabel", () => {
	test("joins color and size", () => {
		expect(variantLabel("M", "Beige")).toBe("Beige / M");
		expect(variantLabel(null, null)).toBe("Default");
	});
});
