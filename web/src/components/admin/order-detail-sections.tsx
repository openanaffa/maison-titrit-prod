"use client";

import { Mail, MapPin, Phone } from "lucide-react";

import { useT } from "@/i18n/locale-provider";
import type { OrderView } from "@/lib/types";

export function OrderMeta({ order }: { order: OrderView }) {
	const { t } = useT();
	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
			<div className="card-vintage p-4">
				<p className="label-vintage-tight">
					{t("admin.orders.detail.created")}
				</p>
				<p className="body-vintage-sm">
					{new Date(order.createdAt).toLocaleDateString("fr-FR", {
						weekday: "long",
						year: "numeric",
						month: "long",
						day: "numeric",
					})}
				</p>
			</div>
			<div className="card-vintage p-4">
				<p className="label-vintage-tight">
					{t("admin.orders.detail.payment")}
				</p>
				<p className="body-vintage-sm">{order.payment}</p>
			</div>
			<div className="card-vintage p-4">
				<p className="label-vintage-tight">
					{t("admin.orders.detail.updated")}
				</p>
				<p className="body-vintage-sm">
					{new Date(order.updatedAt).toLocaleDateString("fr-FR")}
				</p>
			</div>
		</div>
	);
}

export function OrderCustomer({ order }: { order: OrderView }) {
	const { t } = useT();
	return (
		<div className="card-vintage p-4">
			<p className="label-vintage-tight mb-3 block">
				{t("admin.orders.detail.customer")}
			</p>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				<div className="flex items-center gap-2">
					<Phone className="w-4 h-4 text-ink" />
					<div>
						<p className="body-vintage-sm">{order.customerName}</p>
						{order.user ? (
							<p className="font-label text-[0.55rem] uppercase tracking-[0.12em] body-vintage-soft">
								{t("admin.orders.detail.loggedAs", {
									name: order.user.name ?? order.user.id,
								})}
							</p>
						) : null}
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Mail className="w-4 h-4 text-ink" />
					<p className="body-vintage-sm">
						{order.customerEmail ?? t("admin.orders.detail.noEmail")}
					</p>
				</div>
				<div className="flex items-center gap-2">
					<MapPin className="w-4 h-4 text-ink" />
					<div>
						<p className="body-vintage-sm">
							{order.city ?? ""} {order.address ?? ""}
						</p>
						{order.city || order.address ? null : (
							<p className="font-label text-[0.55rem] uppercase tracking-[0.12em] body-vintage-soft">
								{t("admin.orders.detail.noAddress")}
							</p>
						)}
					</div>
				</div>
			</div>
			{order.notes && (
				<div className="mt-4 pt-4 border-t border-bronze/20">
					<p className="label-vintage-tight mb-1 block">
						{t("admin.orders.detail.notes")}
					</p>
					<p className="body-vintage-muted whitespace-pre-line">
						{order.notes}
					</p>
				</div>
			)}
		</div>
	);
}

export function OrderProvenance({ order }: { order: OrderView }) {
	const { t } = useT();
	return (
		<div className="card-vintage p-4">
			<p className="label-vintage-tight mb-3 block">
				{t("admin.orders.detail.provenance")}
			</p>
			{order.utmSource ||
			order.utmMedium ||
			order.utmCampaign ||
			order.utmContent ||
			order.utmTerm ? (
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm font-serif text-ink dark:text-cream">
					{order.utmSource && (
						<div className="flex justify-between pb-1 border-b border-bronze/10 last:border-0">
							<span className="body-vintage-soft">
								{t("admin.orders.detail.utmSource")}
							</span>
							<span className="text-ink dark:text-cream">
								{order.utmSource}
							</span>
						</div>
					)}
					{order.utmMedium && (
						<div className="flex justify-between pb-1 border-b border-bronze/10 last:border-0">
							<span className="body-vintage-soft">
								{t("admin.orders.detail.utmMedium")}
							</span>
							<span className="text-ink dark:text-cream">
								{order.utmMedium}
							</span>
						</div>
					)}
					{order.utmCampaign && (
						<div className="flex justify-between pb-1 border-b border-bronze/10 last:border-0">
							<span className="body-vintage-soft">
								{t("admin.orders.detail.utmCampaign")}
							</span>
							<span className="text-ink dark:text-cream">
								{order.utmCampaign}
							</span>
						</div>
					)}
					{order.utmContent && (
						<div className="flex justify-between pb-1 border-b border-bronze/10 last:border-0">
							<span className="body-vintage-soft">
								{t("admin.orders.detail.utmContent")}
							</span>
							<span className="text-ink dark:text-cream">
								{order.utmContent}
							</span>
						</div>
					)}
					{order.utmTerm && (
						<div className="flex justify-between pb-1 border-b border-bronze/10 last:border-0">
							<span className="body-vintage-soft">
								{t("admin.orders.detail.utmTerm")}
							</span>
							<span className="text-ink dark:text-cream">{order.utmTerm}</span>
						</div>
					)}
				</div>
			) : (
				<p className="font-label text-[0.6rem] body-vintage-soft">
					{t("admin.orders.detail.noUtm")}
				</p>
			)}
		</div>
	);
}
