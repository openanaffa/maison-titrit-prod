"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useUpdateOrderStatus } from "@/hooks/api/orders";
import { useToast } from "@/hooks/use-toast";
import { useT } from "@/i18n/locale-provider";
import type { OrderRow } from "@/lib/types";
import { ALLOWED_TRANSITIONS, STATUS_LABELS } from "@/lib/types/constants";

export type OrderDetailDialogProps = {
	order: OrderRow | null;
	onClose: () => void;
};

/**
 * Order detail dialog — extracted from OrdersTableClient. Shows the order
 * summary and the status-workflow buttons.
 */
export function OrderDetailDialog({ order, onClose }: OrderDetailDialogProps) {
	const { t } = useT();
	const router = useRouter();
	const { toast } = useToast();
	const updateOrderStatus = useUpdateOrderStatus();
	const allowed = order ? (ALLOWED_TRANSITIONS[order.status] ?? []) : [];

	async function updateStatus(status: string) {
		try {
			await updateOrderStatus.mutateAsync({ id: order!.id, status });
			toast({
				title: "Statut mis à jour",
				description: `${order!.number} → ${STATUS_LABELS[status] ?? status}`,
			});
			router.refresh();
			onClose();
		} catch {
			toast({ title: "Erreur", variant: "destructive" });
		}
	}

	if (!order) return null;

	return (
		<Dialog open={true} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle className="font-display text-xl">
						Commande {order.number}
					</DialogTitle>
				</DialogHeader>
				<div className="space-y-4">
					<div className="grid grid-cols-2 gap-3 font-serif text-sm">
						<div>
							<span className="label-vintage-tight">Client</span>
							<br />
							{order.customerName}
						</div>
						<div>
							<span className="label-vintage-tight">Téléphone</span>
							<br />
							{order.customerPhone}
						</div>
						{order.customerEmail && (
							<div>
								<span className="label-vintage-tight">Email</span>
								<br />
								{order.customerEmail}
							</div>
						)}
						<div>
							<span className="label-vintage-tight">Articles</span>
							<br />
							{order.itemCount}
						</div>
						{order.city && (
							<div>
								<span className="label-vintage-tight">Ville</span>
								<br />
								{order.city}
							</div>
						)}
						<div>
							<span className="label-vintage-tight">Paiement</span>
							<br />
							{order.payment}
						</div>
					</div>
					{order.address && (
						<p className="body-vintage-muted">
							<span className="label-vintage-tight">Adresse</span>
							<br />
							{order.address}
						</p>
					)}
					{order.notes && (
						<p className="body-vintage-muted">
							<span className="label-vintage-tight">Notes</span>
							<br />
							{order.notes}
						</p>
					)}
					<div className="flex items-center justify-between border-t border-bronze/20 pt-3">
						<span className="label-vintage-tight">Total</span>
						<span className="heading-vintage">
							{order.total.toLocaleString("fr-FR")} {order.currency}
						</span>
					</div>

					{/* Status workflow */}
					<div>
						<p className="mb-2 label-vintage-tight">Statut</p>
						<div className="flex flex-wrap gap-2">
							{allowed.map((s) => (
								<button
									type="button"
									key={s}
									onClick={() => updateStatus(s)}
									className={`rounded-full border px-3 py-1.5 font-label text-[0.6rem] uppercase tracking-[0.12em] transition-colors ${
										order.status === s
											? "border-ink bg-ink text-cream"
											: "border-bronze/45 text-ink-soft hover:border-terracotta hover:text-ink dark:text-cream/70"
									}`}
								>
									{STATUS_LABELS[s] ?? s}
								</button>
							))}
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
