"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/react-query/fetch";

/** GET /api/products?category=... */
export function useProducts(category?: string) {
	return useQuery({
		queryKey: ["products", category ?? "all"],
		queryFn: async () => {
			const url = category
				? `/api/products?category=${encodeURIComponent(category)}`
				: "/api/products";
			const res = await apiFetch(url);
			return res.json() as Promise<{ products: unknown[] }>;
		},
	});
}
