"use client";

import { AlertTriangle, Calendar, RefreshCcw, Search } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { StatusBadge } from "@/components/admin/status-badge";
import { useUpdateOrderStatus } from "@/hooks/api/orders";
import { useToast } from "@/hooks/use-toast";
import { useT } from "@/i18n/locale-provider";
import { apiFetch } from "@/lib/react-query/fetch";
import type { FulfilmentOrderRow } from "@/lib/repositories/orders";
import { QUEUE_NEXT_ACTION } from "@/lib/types/constants";

type Queue = { key: string; statuses: string[] };

/** Targets that ask for an optional reason (audit trail). */
const REASON_TARGETS = new Set(["CANCELLED", "RETURN_REQUESTED", "RETURNED"]);

export function FulfilmentQueueClient({
	queues,
	counts,
	activeQueue,
	rows,
	canWrite,
}: {
	queues: Queue[];
	counts: Record<string, number>;
	activeQueue: string;
	rows: FulfilmentOrderRow[];
	/** Staff without orders:write see the queues read-only (Codex P2). */
	canWrite: boolean;
}) {
	const { t } = useT();
	const router = useRouter();
	// Read query params via the router (window is not defined during SSR).
	const searchParams = useSearchParams();
	const { toast } = useToast();
	const updateOrderStatus = useUpdateOrderStatus();
	const [pending, setPending] = React.useState<string | null>(null);
	const [formOpen, setFormOpen] = React.useState<string | null>(null); // `${orderId}:${target}`
	const [reason, setReason] = React.useState("");
	const [provider, setProvider] = React.useState("");
	const [reference, setReference] = React.useState("");
	const [retries, setRetries] = React.useState<string | null>(null);

	function navigate(next: Record<string, string | undefined>) {
		const params = new URLSearchParams(searchParams.toString());
		for (const [k, v] of Object.entries(next)) {
			if (v) params.set(k, v);
			else params.delete(k);
		}
		router.push(`/makteb/fulfilment?${params.toString()}`);
	}

	function openForm(orderId: string, target: string) {
		const key = `${orderId}:${target}`;
		setFormOpen(formOpen === key ? null : key);
		setReason("");
		setProvider("");
		setReference("");
	}

	async function transition(
		row: FulfilmentOrderRow,
		target: string,
	): Promise<void> {
		setPending(row.id);
		try {
			await updateOrderStatus.mutateAsync({
				id: row.id,
				status: target,
				reason: REASON_TARGETS.has(target) && reason ? reason : undefined,
				deliveryProvider:
					target === "DISPATCHED" && provider ? provider : undefined,
				deliveryReference:
					target === "DISPATCHED" && reference ? reference : undefined,
			});
			toast({
				title: t("admin.fulfilment.updated"),
				description: `${row.number} → ${target}`,
			});
			setFormOpen(null);
			router.refresh();
		} catch {
			toast({ title: t("admin.fulfilment.error"), variant: "destructive" });
		} finally {
			setPending(null);
		}
	}

	async function retryFailed(row: FulfilmentOrderRow): Promise<void> {
		setRetries(row.id);
		try {
			const res = await apiFetch(`/api/admin/orders/${row.id}/notifications`);
			const { notifications } = (await res.json()) as {
				notifications: { id: string; status: string; channel: string }[];
			};
			const failed = notifications.filter(
				(n) => n.status === "FAILED" && n.channel === "EMAIL",
			);
			const results = await Promise.allSettled(
				failed.map((n) =>
					apiFetch(`/api/admin/notifications/${n.id}/retry`, {
						method: "POST",
					}),
				),
			);
			const sent = results.filter((r) => r.status === "fulfilled").length;
			toast({
				title: t("admin.fulfilment.retryDone"),
				description: `${row.number} — ${sent}/${failed.length}`,
			});
			router.refresh();
		} catch {
			toast({ title: t("admin.fulfilment.error"), variant: "destructive" });
		} finally {
			setRetries(null);
		}
	}

	const next = QUEUE_NEXT_ACTION[activeQueue];

	return (
		<div className="space-y-6">
			<div>
				<h1 className="heading-vintage-lg">{t("admin.fulfilment.title")}</h1>
				<p className="mt-1 body-vintage">{t("admin.fulfilment.subtitle")}</p>
			</div>

			{/* Queue tabs */}
			<div className="flex flex-wrap items-center gap-2">
				{queues.map((f) => (
					<button
						type="button"
						key={f.key}
						onClick={() => navigate({ queue: f.key })}
						className={`rounded-full border px-3 py-1.5 font-label text-[0.62rem] uppercase tracking-[0.14em] ${f.key === activeQueue ? "border-ink bg-ink text-cream dark:border-cream dark:bg-cream dark:text-ink" : "border-bronze/45 text-ink-soft dark:text-cream/70"}`}
					>
						{t(`admin.fulfilment.queue.${f.key}`)} ({counts[f.key] ?? 0})
					</button>
				))}
			</div>

			{/* Search + date window */}
			<div className="flex flex-wrap items-center gap-3">
				<div className="relative w-full md:w-64">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 body-vintage-soft" />
					<input
						type="search"
						placeholder={t("admin.common.search")}
						defaultValue={searchParams.get("q") ?? ""}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								navigate({ q: (e.target as HTMLInputElement).value });
							}
						}}
						className="w-full pl-9 pr-3 py-2 rounded border border-bronze/45 bg-transparent text-sm text-ink dark:text-cream placeholder-ink-soft dark:placeholder-cream/60 focus:border-bronze outline-none"
					/>
				</div>
				<Calendar className="w-4 h-4 text-ink" />
				<input
					type="date"
					defaultValue={searchParams.get("from") ?? ""}
					onChange={(e) => navigate({ from: e.target.value })}
					className="px-2 py-2 rounded border border-bronze/45 bg-transparent text-sm text-ink dark:text-cream"
					aria-label={t("admin.fulfilment.from")}
				/>
				<input
					type="date"
					defaultValue={searchParams.get("to") ?? ""}
					onChange={(e) => navigate({ to: e.target.value })}
					className="px-2 py-2 rounded border border-bronze/45 bg-transparent text-sm text-ink dark:text-cream"
					aria-label={t("admin.fulfilment.to")}
				/>
			</div>

			{/* Queue table */}
			<div className="card-vintage overflow-hidden rounded-sm">
				<div className="overflow-x-auto">
					<table className="w-full text-sm">
						<thead className="border-b border-bronze/20 bg-muted/40">
							<tr>
								<th className="p-3 text-start label-vintage-wide">
									{t("admin.orders.col.number")}
								</th>
								<th className="p-3 text-start label-vintage-wide">
									{t("admin.orders.col.customer")}
								</th>
								<th className="p-3 text-end label-vintage-wide">
									{t("admin.orders.col.total")}
								</th>
								<th className="p-3 text-center label-vintage-wide">
									{t("admin.orders.col.status")}
								</th>
								<th className="p-3 text-start label-vintage-wide">
									{t("admin.fulfilment.delivery")}
								</th>
								<th className="p-3 text-end label-vintage-wide">
									{t("admin.orders.col.actions")}
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-bronze/15">
							{rows.length === 0 ? (
								<tr>
									<td
										colSpan={6}
										className="p-10 text-center body-vintage-muted"
									>
										{t("admin.orders.empty")}
									</td>
								</tr>
							) : (
								rows.map((o) => (
									<React.Fragment key={o.id}>
										<tr className="hover:bg-muted/30">
											<td className="p-3">
												<Link href={`/makteb/orders/${o.id}`}>
													<span className="heading-vintage-sm hover:underline">
														{o.number}
													</span>
												</Link>
												<p className="label-vintage-sm">
													{new Date(o.createdAt).toLocaleDateString("fr-FR")}
													{" · "}
													{o.itemCount}{" "}
													{t("admin.orders.detail.articleCount").replace(
														"{count}",
														"",
													)}
												</p>
											</td>
											<td className="p-3">
												<p className="body-vintage-sm">{o.customerName}</p>
												<p className="label-vintage-sm">{o.customerPhone}</p>
											</td>
											<td className="p-3 text-end heading-vintage-sm">
												{o.total.toLocaleString("fr-FR")} {o.currency}
											</td>
											<td className="p-3 text-center">
												<StatusBadge status={o.status} />
												{o.failedNotifications > 0 && (
													<p className="mt-1 flex items-center justify-center gap-1 text-[0.6rem] font-label uppercase tracking-[0.12em] text-ink">
														<AlertTriangle className="w-3 h-3" />
														{t("admin.fulfilment.failedCount", {
															count: o.failedNotifications,
														})}
													</p>
												)}
											</td>
											<td className="p-3">
												{o.deliveryZoneName && (
													<p className="body-vintage-sm">
														{o.deliveryZoneName}
													</p>
												)}
												{o.deliveryProvider && (
													<p className="label-vintage-sm">
														{o.deliveryProvider}
														{o.deliveryReference
															? ` — ${o.deliveryReference}`
															: ""}
													</p>
												)}
											</td>
											<td className="p-3 text-end">
												<div className="flex items-center justify-end gap-2">
													{canWrite && o.failedNotifications > 0 && (
														<button
															type="button"
															onClick={() => retryFailed(o)}
															disabled={retries === o.id || pending === o.id}
															className="inline-flex items-center gap-1 rounded border border-terracotta/60 px-2 py-1.5 font-label text-[0.6rem] uppercase tracking-[0.12em] text-ink hover:bg-terracotta/10 disabled:opacity-50"
														>
															<RefreshCcw className="w-3 h-3" />
															{t("admin.fulfilment.retry")}
														</button>
													)}
													{canWrite && next && (
														<button
															type="button"
															onClick={() =>
																REASON_TARGETS.has(next) ||
																next === "DISPATCHED"
																	? openForm(o.id, next)
																	: transition(o, next)
															}
															disabled={pending === o.id}
															className="rounded bg-ink px-3 py-1.5 font-label text-[0.6rem] uppercase tracking-[0.14em] text-cream hover:bg-bronze disabled:opacity-50 dark:bg-cream dark:text-ink dark:hover:bg-bronze"
														>
															{pending === o.id
																? t("admin.fulfilment.saving")
																: t(`admin.fulfilment.action.${next}`)}
														</button>
													)}
													{canWrite && next && next !== "CANCELLED" && (
														<button
															type="button"
															onClick={() => openForm(o.id, "CANCELLED")}
															disabled={pending === o.id}
															className="rounded border border-bronze/45 px-2 py-1.5 font-label text-[0.6rem] uppercase tracking-[0.12em] text-ink-soft hover:bg-bronze/10 dark:text-cream/70 disabled:opacity-50"
														>
															{t("admin.fulfilment.action.CANCELLED")}
														</button>
													)}
												</div>
											</td>
										</tr>
										{formOpen === `${o.id}:${next ?? "CANCELLED"}` ||
										formOpen === `${o.id}:CANCELLED` ? (
											<tr>
												<td colSpan={6} className="bg-muted/40 p-4">
													{(() => {
														const target =
															formOpen === `${o.id}:${next ?? "CANCELLED"}`
																? (next ?? "CANCELLED")
																: "CANCELLED";
														return (
															<form
																onSubmit={(e) => {
																	e.preventDefault();
																	transition(o, target);
																}}
																className="flex flex-wrap items-end gap-3"
															>
																<p className="w-full body-vintage-sm">
																	{t("admin.fulfilment.formTitle", {
																		number: o.number,
																		status: t(
																			`admin.fulfilment.action.${target}`,
																		),
																	})}
																</p>
																{REASON_TARGETS.has(target) && (
																	<label className="flex flex-col gap-1">
																		<span className="label-vintage-tight">
																			{t("admin.fulfilment.reason")}
																		</span>
																		<input
																			type="text"
																			value={reason}
																			onChange={(e) =>
																				setReason(e.target.value)
																			}
																			className="w-56 rounded border border-bronze/45 bg-transparent px-2 py-1.5 text-sm text-ink dark:text-cream"
																		/>
																	</label>
																)}
																{target === "DISPATCHED" && (
																	<>
																		<label className="flex flex-col gap-1">
																			<span className="label-vintage-tight">
																				{t("admin.fulfilment.provider")}
																			</span>
																			<input
																				type="text"
																				value={provider}
																				onChange={(e) =>
																					setProvider(e.target.value)
																				}
																				className="w-40 rounded border border-bronze/45 bg-transparent px-2 py-1.5 text-sm text-ink dark:text-cream"
																			/>
																		</label>
																		<label className="flex flex-col gap-1">
																			<span className="label-vintage-tight">
																				{t("admin.fulfilment.reference")}
																			</span>
																			<input
																				type="text"
																				value={reference}
																				onChange={(e) =>
																					setReference(e.target.value)
																				}
																				className="w-40 rounded border border-bronze/45 bg-transparent px-2 py-1.5 text-sm text-ink dark:text-cream"
																			/>
																		</label>
																	</>
																)}
																<button
																	type="submit"
																	disabled={pending === o.id}
																	className="rounded bg-bronze px-4 py-2 font-label text-[0.62rem] uppercase tracking-[0.14em] text-cream hover:bg-terracotta disabled:opacity-50"
																>
																	{t("admin.fulfilment.confirm")}
																</button>
																<button
																	type="button"
																	onClick={() => setFormOpen(null)}
																	className="rounded border border-bronze/45 px-4 py-2 font-label text-[0.62rem] uppercase tracking-[0.14em] text-ink-soft hover:bg-bronze/10 dark:text-cream/70"
																>
																	{t("admin.fulfilment.cancel")}
																</button>
															</form>
														);
													})()}
												</td>
											</tr>
										) : null}
									</React.Fragment>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
