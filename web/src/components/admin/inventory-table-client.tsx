"use client";

import { Download, History, Plus, Search } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

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
	const router = useRouter();
	const [query, setQuery] = React.useState("");
	const [filter, setFilter] = React.useState<"all" | "low" | "out">("all");
	const [active, setActive] = React.useState<Row | null>(null);
	const [action, setAction] = React.useState<string>("");
	const [qty, setQty] = React.useState<number>(1);
	const [reason, setReason] = React.useState("");
	const [history, setHistory] = React.useState<Row | null>(null);
	const [movements, setMovements] = React.useState<unknown[]>([]);

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
			toast({ title: "Stock mis à jour", description: active.sku ?? active.id });
			setActive(null);
			setAction("");
			setQty(1);
			setReason("");
			router.refresh();
		} catch (e) {
			toast({
				title: "Erreur",
				description: e instanceof Error ? e.message : "Échec",
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
		const header = "productRef,productName,sku,size,color,onHand,reserved,available,lowStockThreshold";
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
		const blob = new Blob([header + "\n" + lines.join("\n")], { type: "text/csv" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "inventory.csv";
		a.click();
		URL.revokeObjectURL(url);
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div>
					<h1 className="heading-vintage-lg">Inventaire</h1>
					<p className="mt-1 body-vintage-muted">
						Gestion des stocks par variante.
					</p>
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<Button variant="outline" size="sm" onClick={exportCsv}>
						<Download className="w-3 h-3 mr-1" /> Export CSV
					</Button>
				</div>
			</div>

			<div className="flex flex-col md:flex-row gap-3">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-soft" />
					<Input
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Rechercher..."
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
							{f === "all" ? "Tous" : f === "low" ? "Stock bas" : "Rupture"}
						</button>
					))}
				</div>
			</div>

			<div className="card-vintage overflow-hidden rounded-sm">
				<div className="overflow-x-auto">
					<table className="w-full text-sm">
						<thead className="bg-ink/5">
							<tr>
								<th className="text-left p-3 font-label text-[0.6rem] uppercase">Produit</th>
								<th className="text-left p-3 font-label text-[0.6rem] uppercase">SKU</th>
								<th className="text-left p-3 font-label text-[0.6rem] uppercase">Taille/Couleur</th>
								<th className="text-right p-3 font-label text-[0.6rem] uppercase">En stock</th>
								<th className="text-right p-3 font-label text-[0.6rem] uppercase">Réservé</th>
								<th className="text-right p-3 font-label text-[0.6rem] uppercase">Disponible</th>
								<th className="text-right p-3 font-label text-[0.6rem] uppercase">Actions</th>
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
										{[r.color, r.size].filter(Boolean).join(" / ") || "Défaut"}
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
												Réception
											</button>
											<button
												type="button"
												onClick={() => {
													setActive(r);
													setAction("adjust");
												}}
												className="rounded border px-2 py-1 text-xs hover:bg-ink/5"
											>
												Ajuster
											</button>
											<button
												type="button"
												onClick={() => {
													setActive(r);
													setAction("damage");
												}}
												className="rounded border px-2 py-1 text-xs hover:bg-ink/5"
											>
												Perte
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
								? "Réception de stock"
								: action === "adjust"
									? "Ajustement"
									: action === "damage"
										? "Perte / casse"
										: action === "return"
											? "Retour en stock"
											: "Action"}
						</h2>
						<p className="text-sm">
							{active.productName} — {active.sku}
						</p>
						<div>
							<label className="label-vintage-tight">Quantité</label>
							<Input
								type="number"
								value={qty}
								onChange={(e) => setQty(Number(e.target.value))}
								className="field-vintage"
							/>
						</div>
						<div>
							<label className="label-vintage-tight">Motif</label>
							<Input
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
								Annuler
							</Button>
							<Button onClick={submitAction}>Valider</Button>
						</div>
					</div>
				</div>
			)}

			{/* History dialog */}
			{history && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
					<div className="bg-cream rounded-sm p-6 w-full max-w-2xl space-y-4 max-h-[80vh] overflow-auto">
						<div className="flex justify-between items-center">
							<h2 className="heading-vintage">Historique — {history.sku}</h2>
							<button
								type="button"
								onClick={() => setHistory(null)}
								className="text-ink-soft hover:text-ink"
							>
								✕
							</button>
						</div>
						{movements.length === 0 ? (
							<p className="text-sm text-ink-soft">Aucun mouvement.</p>
						) : (
							<table className="w-full text-xs">
								<thead>
									<tr className="text-left">
										<th className="p-2">Date</th>
										<th className="p-2">Type</th>
										<th className="p-2">Qté</th>
										<th className="p-2">Stock après</th>
										<th className="p-2">Réservé après</th>
										<th className="p-2">Motif</th>
									</tr>
								</thead>
								<tbody>
									{movements.map((m: any) => (
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
