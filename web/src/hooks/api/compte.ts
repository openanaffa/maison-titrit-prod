"use client";

import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/react-query/fetch";

/** PATCH /api/compte/profile */
export function useUpdateProfile() {
	return useMutation({
		mutationFn: async (body: { name: string; phone: string }) => {
			const res = await apiFetch("/api/compte/profile", {
				method: "PATCH",
				body: JSON.stringify(body),
			});
			return res.json() as Promise<{ ok: boolean }>;
		},
	});
}
