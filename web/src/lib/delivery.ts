/**
 * Delivery zone quote service.
 *
 * Single source of truth for coverage and fees, used by checkout and (later)
 * Wafine. Pure helpers + Prisma-backed CRUD.
 */

import { db } from "@/lib/db";

export type DeliveryQuote = {
	covered: boolean;
	zoneId: string | null;
	zoneName: string | null;
	fee: number;
};

export function parseCities(input: string): string[] {
	return input
		.split(/[,\n;]/)
		.map((s) => s.trim().toLowerCase())
		.filter(Boolean);
}

export function matchZone(city: string, zones: { cities: string }[]): number {
	const target = city.trim().toLowerCase();
	for (let i = 0; i < zones.length; i++) {
		if (parseCities(zones[i].cities).includes(target)) return i;
	}
	return -1;
}

export async function listDeliveryZones(activeOnly = false) {
	return db.deliveryZone.findMany({
		where: activeOnly ? { isActive: true } : undefined,
		orderBy: { name: "asc" },
	});
}

export async function getDeliveryQuote(
	city: string | null | undefined,
): Promise<DeliveryQuote> {
	if (!city || !city.trim()) {
		return { covered: false, zoneId: null, zoneName: null, fee: 0 };
	}
	const zones = await db.deliveryZone.findMany({ where: { isActive: true } });
	const idx = matchZone(city, zones);
	if (idx < 0) {
		return { covered: false, zoneId: null, zoneName: null, fee: 0 };
	}
	const zone = zones[idx];
	return { covered: true, zoneId: zone.id, zoneName: zone.name, fee: zone.fee };
}

export async function createDeliveryZone(input: {
	name: string;
	cities: string;
	fee: number;
	isActive?: boolean;
}) {
	return db.deliveryZone.create({
		data: {
			name: input.name.trim(),
			cities: input.cities.trim(),
			fee: input.fee,
			isActive: input.isActive ?? true,
		},
	});
}

export async function updateDeliveryZone(
	id: string,
	input: Partial<{
		name: string;
		cities: string;
		fee: number;
		isActive: boolean;
	}>,
) {
	return db.deliveryZone.update({
		where: { id },
		data: {
			...(input.name !== undefined ? { name: input.name.trim() } : {}),
			...(input.cities !== undefined ? { cities: input.cities.trim() } : {}),
			...(input.fee !== undefined ? { fee: input.fee } : {}),
			...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
		},
	});
}

export async function deleteDeliveryZone(id: string) {
	return db.deliveryZone.delete({ where: { id } });
}
