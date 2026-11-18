"use client";

import { useMutation } from "@tanstack/react-query";
import * as React from "react";
import { apiFetch } from "@/lib/react-query/fetch";

/** PATCH /api/admin/orders/[id] */
export function useUpdateOrderStatus() {
	return useMutation({
		mutationFn: async ({ id, status }: { id: string; status: string }) => {
			const res = await apiFetch(`/api/admin/orders/${id}`, {
				method: "PATCH",
				body: JSON.stringify({ status }),
			});
			return res.json() as Promise<{ order: { id: string; number: string } }>;
		},
	});
}
