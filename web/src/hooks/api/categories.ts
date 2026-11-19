"use client";

import { useMutation } from "@tanstack/react-query";
import * as React from "react";
import { apiFetch } from "@/lib/react-query/fetch";

/** POST /api/admin/categories */
export function useCreateCategory() {
	return useMutation({
		mutationFn: async (body: { name: string; slug?: string }) => {
			const res = await apiFetch("/api/admin/categories", {
				method: "POST",
				body: JSON.stringify(body),
			});
			return res.json() as Promise<{ category: Record<string, unknown> }>;
		},
	});
}

/** PATCH /api/admin/categories/[id] */
export function useUpdateCategory() {
	return useMutation({
		mutationFn: async ({
			id,
			body,
		}: {
			id: string;
			body: { name?: string; slug?: string; position?: number };
		}) => {
			const res = await apiFetch(`/api/admin/categories/${id}`, {
				method: "PATCH",
				body: JSON.stringify(body),
			});
			return res.json() as Promise<{ category: Record<string, unknown> }>;
		},
	});
}

/** DELETE /api/admin/categories/[id] */
export function useDeleteCategory() {
	return useMutation({
		mutationFn: async (id: string) => {
			const res = await apiFetch(`/api/admin/categories/${id}`, {
				method: "DELETE",
			});
			return res.json() as Promise<{ ok: boolean }>;
		},
	});
}
