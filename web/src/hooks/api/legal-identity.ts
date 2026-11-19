"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/react-query/fetch";
import type { LegalIdentity } from "@/lib/types/legal-identity";

/** GET /api/settings/legal */
export function useLegalIdentity() {
	return useQuery({
		queryKey: ["settings", "legal-identity"],
		queryFn: async () => {
			const res = await apiFetch("/api/settings/legal");
			return res.json() as Promise<{
				stored: LegalIdentity;
				effective: LegalIdentity;
				defaults: LegalIdentity;
			}>;
		},
	});
}

/** PATCH /api/settings/legal */
export function useUpdateLegalIdentity() {
	return useMutation({
		mutationFn: async (body: LegalIdentity) => {
			const res = await apiFetch("/api/settings/legal", {
				method: "PATCH",
				body: JSON.stringify(body),
			});
			return res.json() as Promise<{
				stored: LegalIdentity;
				effective: LegalIdentity;
			}>;
		},
	});
}
