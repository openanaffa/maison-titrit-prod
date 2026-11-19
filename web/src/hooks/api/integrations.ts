"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import * as React from "react";
import { apiFetch } from "@/lib/react-query/fetch";

/** GET /api/settings/integrations */
export function useIntegrations() {
	return useQuery({
		queryKey: ["integrations"],
		queryFn: async () => {
			const res = await apiFetch("/api/settings/integrations");
			return res.json() as Promise<{
				analyticsValue?: Record<string, unknown>;
				verificationValue?: Record<string, unknown>;
				effective: Record<string, unknown>;
			}>;
		},
	});
}

/** PATCH /api/settings/integrations */
export function useUpdateIntegrations() {
	return useMutation({
		mutationFn: async (body: {
			analytics?: Record<string, unknown> | null;
			verification?: Record<string, unknown> | null;
		}) => {
			const res = await apiFetch("/api/settings/integrations", {
				method: "PATCH",
				body: JSON.stringify(body),
			});
			return res.json() as Promise<{
				analytics: Record<string, unknown> | null;
				verification: Record<string, unknown> | null;
			}>;
		},
	});
}
