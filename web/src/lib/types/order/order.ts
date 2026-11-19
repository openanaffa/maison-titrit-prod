import type { BaseEntity } from "../base/entity";

export interface BaseOrderEntity extends BaseEntity {
	number: string;
}
type OrderItem = {
	id: string;
	name: string;
	quantity: number;
	size: string | null;
};
export interface Order extends BaseOrderEntity {
	status: string;
	total: number;
	currency: string;
	items: OrderItem[];
}
export type OrderUtmRow = {
	id: string;
	number: string;
	status: string;
	total: number;
	currency: string;
	utmSource: string | null;
	utmMedium: string | null;
	utmCampaign: string | null;
	createdAt: string;
};
export type OrderItemView = {
	id: string;
	ref: string;
	name: string;
	size: string | null;
	price: number;
	quantity: number;
	product: {
		id: string;
		images: Array<{ url: string }>;
	};
};
export type OrderView = {
	id: string;
	number: string;
	status: string;
	customerName: string;
	customerPhone: string;
	customerEmail: string | null;
	city: string | null;
	address: string | null;
	notes: string | null;
	utmSource: string | null;
	utmMedium: string | null;
	utmCampaign: string | null;
	utmContent: string | null;
	utmTerm: string | null;
	total: number;
	currency: string;
	payment: string;
	createdAt: Date;
	updatedAt: Date;
	user: { id: string; name: string | null } | null;
	items: OrderItemView[];
};
export type OrderRow = {
	id: string;
	number: string;
	customerName: string;
	customerPhone: string;
	customerEmail: string;
	city: string;
	address: string;
	notes: string;
	total: number;
	currency: string;
	status: string;
	payment: string;
	createdAt: string;
	itemCount: number;
	userId: string | null;
	userName: string | null;
};
