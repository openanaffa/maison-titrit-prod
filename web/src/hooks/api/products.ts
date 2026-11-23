"use client";

import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/react-query/fetch";

type ProductFormValues = Record<string, unknown>;

/** POST /api/admin/products */
export function useCreateProduct() {
	return useMutation({
		mutationFn: async (body: ProductFormValues) => {
			const res = await apiFetch("/api/admin/products", {
				method: "POST",
				body: JSON.stringify(body),
			});
			return res.json() as Promise<{ product: Record<string, unknown> }>;
		},
	});
}

/** PATCH /api/admin/products/[id] */
export function useUpdateProduct() {
	return useMutation({
		mutationFn: async ({
			id,
			body,
		}: {
			id: string;
			body: ProductFormValues;
		}) => {
			const res = await apiFetch(`/api/admin/products/${id}`, {
				method: "PATCH",
				body: JSON.stringify(body),
			});
			return res.json() as Promise<{ product: Record<string, unknown> }>;
		},
	});
}

/** DELETE /api/admin/products/[id] */
export function useDeleteProduct() {
	return useMutation({
		mutationFn: async (id: string) => {
			const res = await apiFetch(`/api/admin/products/${id}`, {
				method: "DELETE",
			});
			return res.json() as Promise<{ ok: boolean }>;
		},
	});
}

/** POST /api/admin/upload */
export function useUploadImage() {
	return useMutation({
		mutationFn: async ({
			file,
			index: _index,
		}: {
			file: File;
			index: number;
		}) => {
			const fd = new FormData();
			fd.append("file", file);
			const res = await fetch("/api/admin/upload", {
				method: "POST",
				body: fd,
			});
			if (!res.ok) {
				const json = (await res.json().catch(() => ({}))) as {
					error?: string;
				};
				throw new Error(json.error || "upload failed");
			}
			return (await res.json()) as Promise<{
				url: string;
				alt?: string;
			}>;
		},
	});
}
