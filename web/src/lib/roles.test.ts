import { describe, expect, test } from "bun:test";
import { can, isOwnerRole, isStaffRole, ROLES } from "./roles";

describe("RBAC role helpers", () => {
	test("role registry carries the six roles", () => {
		expect(ROLES).toEqual([
			"FOUNDER",
			"DEVELOPER",
			"ADMIN",
			"MANAGER",
			"MARKETER",
			"CUSTOMER",
		]);
	});

	test("owner roles are FOUNDER and DEVELOPER", () => {
		expect(isOwnerRole("FOUNDER")).toBe(true);
		expect(isOwnerRole("DEVELOPER")).toBe(true);
		expect(isOwnerRole("ADMIN")).toBe(false);
		expect(isOwnerRole(null)).toBe(false);
	});

	test("staff roles reach /makteb, customers do not", () => {
		for (const role of [
			"FOUNDER",
			"DEVELOPER",
			"ADMIN",
			"MANAGER",
			"MARKETER",
		]) {
			expect(isStaffRole(role)).toBe(true);
		}
		expect(isStaffRole("CUSTOMER")).toBe(false);
	});

	test("catalog reads exclude the marketer", () => {
		expect(can("FOUNDER", "products:read")).toBe(true);
		expect(can("MANAGER", "products:read")).toBe(true);
		expect(can("MARKETER", "products:read")).toBe(false);
		expect(can("MARKETER", "categories:read")).toBe(false);
	});

	test("catalog and order writes are owner+admin only", () => {
		for (const action of [
			"products:write",
			"orders:write",
			"categories:write",
		] as const) {
			expect(can("DEVELOPER", action)).toBe(true);
			expect(can("ADMIN", action)).toBe(true);
			expect(can("MANAGER", action)).toBe(false);
			expect(can("MARKETER", action)).toBe(false);
		}
	});

	test("orders and customers readable by all staff", () => {
		for (const role of [
			"FOUNDER",
			"DEVELOPER",
			"ADMIN",
			"MANAGER",
			"MARKETER",
		]) {
			expect(can(role, "orders:read")).toBe(true);
			expect(can(role, "customers:read")).toBe(true);
		}
		expect(can("CUSTOMER", "orders:read")).toBe(false);
	});

	test("marketer writes the journal but not settings", () => {
		expect(can("MARKETER", "content:write")).toBe(true);
		expect(can("MANAGER", "content:write")).toBe(false);
		expect(can("MARKETER", "settings:write")).toBe(false);
		expect(can("MARKETER", "users:manage")).toBe(false);
	});

	test("integrations:write covers marketers and owners, not other staff", () => {
		expect(can("MARKETER", "integrations:write")).toBe(true);
		expect(can("FOUNDER", "integrations:write")).toBe(true);
		expect(can("DEVELOPER", "integrations:write")).toBe(true);
		expect(can("ADMIN", "integrations:write")).toBe(false);
		expect(can("MANAGER", "integrations:write")).toBe(false);
		expect(can("CUSTOMER", "integrations:write")).toBe(false);
		expect(can(null, "integrations:write")).toBe(false);
	});

	test("workspace-owner actions are owner-only", () => {
		for (const action of [
			"users:manage",
			"invites:manage",
			"settings:write",
		] as const) {
			expect(can("FOUNDER", action)).toBe(true);
			expect(can("DEVELOPER", action)).toBe(true);
			expect(can("ADMIN", action)).toBe(false);
		}
	});
});
