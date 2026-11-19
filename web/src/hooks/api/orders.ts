"use client";

import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/react-query/fetch";

/** PATCH /api/admin/orders/[id] — status + optional reason/delivery fields. */
export function useUpdateOrderStatus() {
	return useMutation({
		mutationFn: async ({
			id,
			status,
			reason,
			deliveryProvider,
			deliveryReference,
		}: {
			id: string;
			status: string;
			reason?: string;
			deliveryProvider?: string;
			deliveryReference?: string;
		}) => {
			const res = await apiFetch(`/api/admin/orders/${id}`, {
				method: "PATCH",
				body: JSON.stringify({
					status,
					...(reason ? { reason } : {}),
					...(deliveryProvider ? { deliveryProvider } : {}),
					...(deliveryReference ? { deliveryReference } : {}),
				}),
			});
			return res.json() as Promise<{ order: { id: string; number: string } }>;
		},
	});
}
