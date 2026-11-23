"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/react-query/fetch";

/** GET /api/settings/announcement */
export function useAnnouncement() {
	return useQuery({
		queryKey: ["announcement"],
		queryFn: async () => {
			const res = await apiFetch("/api/settings/announcement");
			return res.json() as Promise<{
				bar: { active: boolean; message: string; link: string };
			}>;
		},
	});
}

/** PATCH /api/settings/announcement */
export function useUpdateAnnouncement() {
	return useMutation({
		mutationFn: async (bar: {
			active: boolean;
			message: string;
			link: string;
		}) => {
			const res = await apiFetch("/api/settings/announcement", {
				method: "PATCH",
				body: JSON.stringify(bar),
			});
			return res.json() as Promise<{ bar: typeof bar }>;
		},
	});
}
