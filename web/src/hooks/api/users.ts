"use client";

import { useMutation } from "@tanstack/react-query";
import * as React from "react";
import { apiFetch } from "@/lib/react-query/fetch";

/** PATCH /api/admin/users/[id] */
export function useUpdateUserRole() {
	return useMutation({
		mutationFn: async ({ id, role }: { id: string; role: string }) => {
			const res = await apiFetch(`/api/admin/users/${id}`, {
				method: "PATCH",
				body: JSON.stringify({ role }),
			});
			return res.json() as Promise<{ user: { id: string; role: string } }>;
		},
	});
}
