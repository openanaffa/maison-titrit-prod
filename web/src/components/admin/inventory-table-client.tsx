"use client";

import { Download, History, Search, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useT } from "@/i18n/locale-provider";
import {
	ACTION_ALIASES,
	type ImportAction,
	type ImportRow,
	normalizeRow,
	parseCsv,
	validateImportRows,
} from "@/lib/inventory-import";

type Row = {
	id: string;
	sku: string | null;
	size: string | null;
	color: string | null;
	isActive: boolean;
	onHand: number;
	reserved: number;
	available: number;
	lowStockThreshold: number;
	lowStock: boolean;
	outOfStock: boolean;
	productRef: string;
	productName: string;
};

export function InventoryTableClient({ rows }: { rows: Row[] }) {
	const { toast } = useToast();
	const { t } = useT();
	const router = useRouter();
	const [query, setQuery] = React.useState("");
	const [filter, setFilter] = React.useState<"all" | "low" | "out">("all");
	const [active, setActive] = React.useState<Row | null>(null);
	const [action, setAction] = React.useState<string>("");
	const [qty, setQty] = React.useState<number>(1);
	const [reason, setReason] = React.useState("");
	const [history, setHistory] = React.useState<Row | null>(null);
	type MovementRow = {
		id: string;
		createdAt: string;
		type: string;
		quantity: number;
		onHandAfter?: number;
		reservedAfter?: number;
		reason?: string | null;
	};
	const [movements, setMovements] = React.useState<MovementRow[]>([]);

	// CSV import state (#120)
	const fileInputRef = React.useRef<HTMLInputElement>(null);
	const [importOpen, setImportOpen] = React.useState(false);
	const [importBusy, setImportBusy] = React.useState(false);
	const importKeyRef = React.useRef(
		`inv-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
	);
	type PreviewRow = {
		row: number;
		sku: string;
		action: ImportAction | "";
		qty: number | "";
		reason: string;
		error: string | null;
	};
	const [preview, setPreview] = React.useState<PreviewRow[]>([]);

	const filtered = rows.filter((r) => {
		const q = query.trim().toLowerCase();
		const matchQ =
			!q ||
			r.productName.toLowerCase().includes(q) ||
			r.productRef.toLowerCase().includes(q) ||
			(r.sku ?? "").toLowerCase().includes(q);
		const matchF =
			filter === "all" ||
			(filter === "low" && r.lowStock) ||
			(filter === "out" && r.outOfStock);
		return matchQ && matchF;
	});

	async function submitAction() {
		if (!active || !action) return;
		try {
			const res = await fetch(`/api/admin/inventory/${active.id}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ type: action, qty, reason }),
			});
			if (!res.ok) {
				const j = await res.json().catch(() => ({}));
				throw new Error(j.error ?? "Erreur");
			}
			toast({
				title: t("admin.inventory.updated"),
				description: active.sku ?? active.id,
			});
			setActive(null);
			setAction("");
			setQty(1);
			setReason("");
			router.refresh();
		} catch (e) {
			toast({
				title: t("admin.inventory.error"),
				description:
					e instanceof Error ? e.message : t("admin.inventory.failed"),
				variant: "destructive",
			});
		}
	}

	async function openHistory(row: Row) {
		setHistory(row);
		const res = await fetch(`/api/admin/inventory/${row.id}`);
		const j = await res.json();
		setMovements(j.movements ?? []);
	}

	function exportCsv() {
		const header =
			"productRef,productName,sku,size,color,onHand,reserved,available,lowStockThreshold";
		const lines = rows.map((r) =>
			[
				r.productRef,
				`"${r.productName}"`,
				r.sku ?? "",
				r.size ?? "",
				r.color ?? "",
				r.onHand,
				r.reserved,
				r.available,
				r.lowStockThreshold,
			].join(","),
		);
		const blob = new Blob([`${header}\n${lines.join("\n")}`], {
			type: "text/csv",
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "inventory.csv";
		a.click();
		URL.revokeObjectURL(url);
	}

	function onImportFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => {
			const text = String(reader.result ?? "");
			const table = parseCsv(text);
			const header = (table[0] ?? []).map((h) => h.trim().toLowerCase());
			const skuIdx = header.indexOf("sku");
			const actionIdx = header.findIndex((h) => h === "action" || h === "type");
			const qtyIdx = header.findIndex(
				(h) => h === "qty" || h === "quantite" || h === "quantité",
			);
			const reasonIdx = header.findIndex(
				(h) => h === "reason" || h === "raison",
			);
			const parsedRows: (ImportRow | null)[] = [];
			for (let i = 1; i < table.length; i++) {
				const cells = table[i];
				if (skuIdx < 0 || actionIdx < 0 || qtyIdx < 0) {
					parsedRows.push(null);
					continue;
				}
				const rawAction = (cells[actionIdx] ?? "").trim().toLowerCase();
				parsedRows.push(
					normalizeRow(
						{
							sku: cells[skuIdx] ?? "",
							action: ACTION_ALIASES[rawAction] ?? rawAction,
							qty: cells[qtyIdx] ?? "",
							reason: reasonIdx >= 0 ? (cells[reasonIdx] ?? "") : "",
						},
						i + 1,
					),
				);
			}
			const validRows = parsedRows.filter((r): r is ImportRow => r !== null);
			const { issues } = validateImportRows(validRows);
			// `issues` row numbers are 1-based over the valid rows; map each
			// back to its displayed (CSV) row number with a valid-row counter.
			let validIdx = 0;
			const grid: PreviewRow[] = parsedRows.map((r, i) => {
				const rowNum = i + 2;
				if (!r) {
					return {
						row: rowNum,
						sku: (table[i + 1]?.[skuIdx] ?? "").trim(),
						action: "",
						qty: "",
						reason: "",
						error: "ROW_MALFORMED",
					};
				}
				const issue = issues.find(
					(it) => it.row === validIdx + 1 && it.sku === r.sku,
				);
				validIdx++;
				return {
					row: rowNum,
					sku: r.sku,
					action: r.action,
					qty: r.qty,
					reason: r.reason ?? "",
					error: issue ? issue.errors.join(",") : null,
				};
			});
			setPreview(grid);
		};
		reader.readAsText(file);
	}

	async function applyImport() {
		const valid = preview.filter((r) => !r.error);
		if (valid.length === 0) return;
		setImportBusy(true);
		try {
			const res = await fetch("/api/admin/inventory/import", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					rows: valid.map((r) => ({
						sku: r.sku,
						action: r.action,
						qty: r.qty,
						reason: r.reason || undefined,
					})),
					commit: true,
					idempotencyKey: importKeyRef.current,
				}),
			});
			const j = await res.json().catch(() => ({}));
			if (!res.ok) {
				throw new Error(j.error ?? t("admin.inventory.failed"));
			}
			const applied = j.appliedCount ?? 0;
			const failed = (j.failed ?? []) as {
				row: number;
				sku: string;
				error: string;
			}[];
			if (failed.length > 0) {
				toast({
					title: t("admin.inventory.importPartial")
						.replace("{applied}", String(applied))
						.replace("{failed}", String(failed.length)),
					description: failed
						.map((f) => `#${f.row} ${f.sku}: ${f.error}`)
						.join("\n"),
					variant: "destructive",
				});
			} else {
				toast({
					title: t("admin.inventory.importDone"),
					description: t("admin.inventory.importApplied").replace(
						"{count}",
						String(applied),
					),
				});
			}
			setImportOpen(false);
			setPreview([]);
			importKeyRef.current = `inv-${Date.now().toString(36)}-${Math.random()
				.toString(36)
				.slice(2, 8)}`;
			router.refresh();
		} catch (e) {
			toast({
				title: t("admin.inventory.importFailed").replace("{failed}", "0"),
				description:
					e instanceof Error ? e.message : t("admin.inventory.failed"),
				variant: "destructive",
			});
		} finally {
			setImportBusy(false);
		}
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div>
					<h1 className="heading-vintage-lg">{t("admin.inventory.title")}</h1>
					<p className="mt-1 body-vintage-muted">
						{t("admin.inventory.subtitle")}
					</p>
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => {
							setImportOpen(true);
							setPreview([]);
							if (fileInputRef.current) fileInputRef.current.value = "";
						}}
					>
						<Upload className="w-3 h-3 mr-1" /> {t("admin.inventory.import")}
					</Button>
					<Button variant="outline" size="sm" onClick={exportCsv}>
						<Download className="w-3 h-3 mr-1" />{" "}
						{t("admin.inventory.exportCsv")}
					</Button>
				</div>
			</div>

			<input
				ref={fileInputRef}
				type="file"
				accept=".csv,text/csv"
				className="hidden"
				onChange={onImportFileChosen}
			/>

			{importOpen && (
				<div className="card-vintage rounded-sm p-4 space-y-3" dir="auto">
					<div>
						<h2 className="heading-vintage">
							{t("admin.inventory.importPreview")}
						</h2>
						<p className="mt-0.5 text-xs text-ink-soft">
							{t("admin.inventory.importHint")}
						</p>
					</div>
					<Button
						variant="outline"
						size="sm"
						onClick={() => fileInputRef.current?.click()}
					>
						<Upload className="w-3 h-3 mr-1" /> {t("admin.inventory.import")}
					</Button>
					{preview.length > 0 && (
						<div className="overflow-x-auto max-h-80 overflow-y-auto border border-bronze/20">
							<table className="w-full text-xs">
								<thead className="bg-ink/5">
									<tr>
										<th className="text-left p-2 font-label text-[0.6rem] uppercase">
											#
										</th>
										<th className="text-left p-2 font-label text-[0.6rem] uppercase">
											{t("admin.inventory.importColSku")}
										</th>
										<th className="text-left p-2 font-label text-[0.6rem] uppercase">
											{t("admin.inventory.importColAction")}
										</th>
										<th className="text-right p-2 font-label text-[0.6rem] uppercase">
											{t("admin.inventory.importColQty")}
										</th>
										<th className="text-left p-2 font-label text-[0.6rem] uppercase">
											{t("admin.inventory.importColReason")}
										</th>
										<th className="text-left p-2 font-label text-[0.6rem] uppercase">
											{t("admin.inventory.importColStatus")}
										</th>
									</tr>
								</thead>
								<tbody>
									{preview.map((r) => (
										<tr key={r.row} className="border-t border-bronze/10">
											<td className="p-2">{r.row}</td>
											<td className="p-2 font-mono">{r.sku}</td>
											<td className="p-2">{r.action}</td>
											<td className="p-2 text-right">{r.qty}</td>
											<td className="p-2">{r.reason}</td>
											<td className="p-2">
												{r.error ? (
													<span className="text-rose-600">
														{t("admin.inventory.importRowError")} ({r.error})
													</span>
												) : (
													<span className="text-emerald-700">OK</span>
												)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
					<div className="flex justify-end gap-2">
						<Button
							variant="outline"
							onClick={() => setImportOpen(false)}
							disabled={importBusy}
						>
							{t("admin.inventory.importCancel")}
						</Button>
						<Button
							onClick={applyImport}
							disabled={
								importBusy ||
								preview.length === 0 ||
								preview.every((r) => r.error)
							}
						>
							{importBusy
								? t("admin.inventory.importValidating")
								: t("admin.inventory.importApply")}
						</Button>
					</div>
				</div>
			)}

			<div className="flex flex-col md:flex-row gap-3">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-soft" />
					<Input
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder={t("admin.inventory.search")}
						className="pl-9 field-vintage"
					/>
				</div>
				<div className="flex gap-2">
					{(["all", "low", "out"] as const).map((f) => (
						<button
							key={f}
							type="button"
							onClick={() => setFilter(f)}
							className={`rounded-full border px-3 py-1.5 font-label text-[0.6rem] uppercase tracking-[0.12em] ${
								filter === f
									? "border-ink bg-ink text-cream"
									: "border-bronze/45 text-ink-soft hover:border-terracotta"
							}`}
						>
							{f === "all"
								? t("admin.inventory.filterAll")
								: f === "low"
									? t("admin.inventory.filterLow")
									: t("admin.inventory.filterOut")}
						</button>
					))}
				</div>
			</div>

			<div className="card-vintage overflow-hidden rounded-sm">
				<div className="overflow-x-auto">
					<table className="w-full text-sm">
						<thead className="bg-ink/5">
							<tr>
								<th className="text-left p-3 font-label text-[0.6rem] uppercase">
									{t("admin.inventory.product")}
								</th>
								<th className="text-left p-3 font-label text-[0.6rem] uppercase">
									{t("admin.inventory.sku")}
								</th>
								<th className="text-left p-3 font-label text-[0.6rem] uppercase">
									{t("admin.inventory.variant")}
								</th>
								<th className="text-right p-3 font-label text-[0.6rem] uppercase">
									{t("admin.inventory.onHand")}
								</th>
								<th className="text-right p-3 font-label text-[0.6rem] uppercase">
									{t("admin.inventory.reserved")}
								</th>
								<th className="text-right p-3 font-label text-[0.6rem] uppercase">
									{t("admin.inventory.available")}
								</th>
								<th className="text-right p-3 font-label text-[0.6rem] uppercase">
									{t("admin.inventory.actions")}
								</th>
							</tr>
						</thead>
						<tbody>
							{filtered.map((r) => (
								<tr key={r.id} className="border-t border-bronze/10">
									<td className="p-3">
										<div className="font-medium">{r.productName}</div>
										<div className="text-xs text-ink-soft">{r.productRef}</div>
									</td>
									<td className="p-3 font-mono text-xs">{r.sku ?? "—"}</td>
									<td className="p-3 text-xs">
										{[r.color, r.size].filter(Boolean).join(" / ") ||
											t("admin.inventory.defaultVariant")}
									</td>
									<td className="p-3 text-right">{r.onHand}</td>
									<td className="p-3 text-right">{r.reserved}</td>
									<td
										className={`p-3 text-right font-medium ${
											r.outOfStock
												? "text-rose-600"
												: r.lowStock
													? "text-amber-600"
													: ""
										}`}
									>
										{r.available}
									</td>
									<td className="p-3 text-right">
										<div className="flex justify-end gap-1">
											<button
												type="button"
												onClick={() => {
													setActive(r);
													setAction("receive");
												}}
												className="rounded border px-2 py-1 text-xs hover:bg-ink/5"
											>
												{t("admin.inventory.actReceive")}
											</button>
											<button
												type="button"
												onClick={() => {
													setActive(r);
													setAction("adjust");
												}}
												className="rounded border px-2 py-1 text-xs hover:bg-ink/5"
											>
												{t("admin.inventory.actAdjust")}
											</button>
											<button
												type="button"
												onClick={() => {
													setActive(r);
													setAction("damage");
												}}
												className="rounded border px-2 py-1 text-xs hover:bg-ink/5"
											>
												{t("admin.inventory.actDamage")}
											</button>
											<button
												type="button"
												onClick={() => {
													setActive(r);
													setAction("return");
												}}
												className="rounded border px-2 py-1 text-xs hover:bg-ink/5"
											>
												{t("admin.inventory.actReturn")}
											</button>
											<button
												type="button"
												onClick={() => openHistory(r)}
												className="rounded border px-2 py-1 text-xs hover:bg-ink/5"
											>
												<History className="inline w-3 h-3" />
											</button>
										</div>
									</td>
								</tr>
							))}
							{filtered.length === 0 && (
								<tr>
									<td colSpan={7} className="p-6 text-center text-ink-soft">
										Aucune variante.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Action dialog */}
			{active && action && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
					<div className="bg-cream rounded-sm p-6 w-full max-w-md space-y-4">
						<h2 className="heading-vintage">
							{action === "receive"
								? t("admin.inventory.dialogReceive")
								: action === "adjust"
									? t("admin.inventory.dialogAdjust")
									: action === "damage"
										? t("admin.inventory.dialogDamage")
										: action === "return"
											? t("admin.inventory.dialogReturn")
											: t("admin.inventory.dialogAction")}
						</h2>
						<p className="text-sm">
							{active.productName} — {active.sku}
						</p>
						<div>
							<label htmlFor="inv-qty" className="label-vintage-tight">
								{t("admin.inventory.labelQty")}
							</label>
							<Input
								id="inv-qty"
								type="number"
								value={qty}
								onChange={(e) => setQty(Number(e.target.value))}
								className="field-vintage"
							/>
						</div>
						<div>
							<label htmlFor="inv-reason" className="label-vintage-tight">
								{t("admin.inventory.labelReason")}
							</label>
							<Input
								id="inv-reason"
								value={reason}
								onChange={(e) => setReason(e.target.value)}
								className="field-vintage"
							/>
						</div>
						<div className="flex justify-end gap-2">
							<Button
								variant="outline"
								onClick={() => {
									setActive(null);
									setAction("");
								}}
							>
								{t("admin.inventory.cancel")}
							</Button>
							<Button onClick={submitAction}>
								{t("admin.inventory.submit")}
							</Button>
						</div>
					</div>
				</div>
			)}

			{/* History dialog */}
			{history && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
					<div className="bg-cream rounded-sm p-6 w-full max-w-2xl space-y-4 max-h-[80vh] overflow-auto">
						<div className="flex justify-between items-center">
							<h2 className="heading-vintage">
								{t("admin.inventory.historyTitle")} — {history.sku}
							</h2>
							<button
								type="button"
								onClick={() => setHistory(null)}
								className="text-ink-soft hover:text-ink"
							>
								✕
							</button>
						</div>
						{movements.length === 0 ? (
							<p className="text-sm text-ink-soft">
								{t("admin.inventory.noMovements")}
							</p>
						) : (
							<table className="w-full text-xs">
								<thead>
									<tr className="text-left">
										<th className="p-2">{t("admin.inventory.movementDate")}</th>
										<th className="p-2">{t("admin.inventory.movementType")}</th>
										<th className="p-2">{t("admin.inventory.movementQty")}</th>
										<th className="p-2">
											{t("admin.inventory.movementAfter")}
										</th>
										<th className="p-2">
											{t("admin.inventory.movementReservedAfter")}
										</th>
										<th className="p-2">
											{t("admin.inventory.movementReason")}
										</th>
									</tr>
								</thead>
								<tbody>
									{movements.map((m: MovementRow) => (
										<tr key={m.id} className="border-t border-bronze/10">
											<td className="p-2">
												{new Date(m.createdAt).toLocaleString("fr-FR")}
											</td>
											<td className="p-2">{m.type}</td>
											<td className="p-2">{m.quantity}</td>
											<td className="p-2">{m.onHandAfter}</td>
											<td className="p-2">{m.reservedAfter}</td>
											<td className="p-2">{m.reason ?? "—"}</td>
										</tr>
									))}
								</tbody>
							</table>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
