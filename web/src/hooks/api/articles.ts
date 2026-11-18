"use client";

import { useMutation } from "@tanstack/react-query";
import * as React from "react";
import { apiFetch } from "@/lib/react-query/fetch";

/** POST /api/admin/articles */
export function useCreateArticle() {
	return useMutation({
		mutationFn: async (body: Record<string, unknown>) => {
			const res = await apiFetch("/api/admin/articles", {
				method: "POST",
				body: JSON.stringify(body),
			});
			return res.json() as Promise<{ article: Record<string, unknown> }>;
		},
	});
}

/** PATCH /api/admin/articles/[id] */
export function useUpdateArticle() {
	return useMutation({
		mutationFn: async ({
			id,
			body,
		}: {
			id: string;
			body: Record<string, unknown>;
		}) => {
			const res = await apiFetch(`/api/admin/articles/${id}`, {
				method: "PATCH",
				body: JSON.stringify(body),
			});
			return res.json() as Promise<{ article: Record<string, unknown> }>;
		},
	});
}

/** DELETE /api/admin/articles/[id] */
export function useDeleteArticle() {
	return useMutation({
		mutationFn: async (id: string) => {
			const res = await apiFetch(`/api/admin/articles/${id}`, {
				method: "DELETE",
			});
			return res.json() as Promise<{ ok: boolean }>;
		},
	});
}
