"use client";

import { Check, CircleAlert, Loader2, UserCog } from "lucide-react";
import * as React from "react";
import { OrnamentDivider } from "@/components/maison/motifs";
import { useUpdateUserRole } from "@/hooks/api/users";
import { useT } from "@/i18n/locale-provider";
import { can, ROLES } from "@/lib/roles";
import type { TeamUser } from "@/lib/types";
import { ROLE_BADGE } from "@/lib/types/constants";

export function TeamClient({
	meId,
	users: initial,
}: {
	meId: string;
	users: TeamUser[];
}) {
	const { t } = useT();
	const changeRole = useUpdateUserRole();
	const [users, setUsers] = React.useState(initial);
	const [pendingId, setPendingId] = React.useState<string | null>(null);
	const [error, setError] = React.useState<string | null>(null);
	const [savedId, setSavedId] = React.useState<string | null>(null);

	async function changeRoleUser(user: TeamUser, role: string) {
		if (role === user.role) return;
		setError(null);
		setPendingId(user.id);
		try {
			await changeRole.mutateAsync({ id: user.id, role });
			setUsers((prev) =>
				prev.map((u) => (u.id === user.id ? { ...u, role } : u)),
			);
			setSavedId(user.id);
			setTimeout(() => setSavedId((id) => (id === user.id ? null : id)), 2000);
		} catch {
			setError(t("admin.team.error"));
		} finally {
			setPendingId(null);
		}
	}

	return (
		<div className="space-y-8">
			<div>
				<h1 className="heading-vintage-lg">{t("admin.team.title")}</h1>
				<p className="mt-1 body-vintage">{t("admin.team.subtitle")}</p>
			</div>

			<OrnamentDivider />

			{error && (
				<p
					className="flex items-center gap-2 rounded-sm border border-terracotta/40 bg-terracotta/10 px-4 py-3 font-serif text-sm text-ink"
					role="alert"
				>
					<CircleAlert className="size-4" /> {error}
				</p>
			)}

			<div className="card-vintage overflow-x-auto rounded-sm">
				<table className="w-full">
					<thead>
						<tr className="border-b border-border">
							{[
								"admin.team.colUser",
								"admin.team.colRole",
								"admin.team.colAuth",
								"admin.team.actions",
							].map((key) => (
								<th
									key={key}
									className="px-4 py-3 text-start font-label text-[0.6rem] uppercase tracking-[0.18em] body-vintage-soft"
								>
									{key === "admin.team.actions" ? "" : t(key)}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{users.map((u) => {
							const isMe = u.id === meId;
							const editable = !isMe && can("FOUNDER", "users:manage");
							return (
								<tr
									key={u.id}
									className="border-b border-border/60 last:border-0"
								>
									<td className="px-4 py-3">
										<p className="body-vintage-sm">
											{u.name || u.email}
											{isMe && (
												<span className="ms-2 label-vintage-sm">
													({t("admin.team.you")})
												</span>
											)}
										</p>
										<p className="font-serif text-xs text-ink-soft/80 dark:text-cream/50">
											{u.email}
										</p>
									</td>
									<td className="px-4 py-3">
										{editable ? (
											<span className="flex items-center gap-2">
												<select
													value={u.role}
													onChange={(e) => changeRoleUser(u, e.target.value)}
													disabled={pendingId === u.id}
													aria-label={t("admin.team.changeRole")}
													className="rounded-sm border border-border bg-background px-2 py-1.5 font-serif text-xs text-ink disabled:opacity-50 dark:text-cream"
												>
													{ROLES.map((r) => (
														<option key={r} value={r}>
															{r}
														</option>
													))}
												</select>
												{pendingId === u.id && (
													<Loader2 className="size-3.5 animate-spin text-ink" />
												)}
												{savedId === u.id && (
													<Check
														className="size-3.5 text-olive"
														aria-hidden="true"
													/>
												)}
											</span>
										) : (
											<span
												className={`inline-flex rounded-full px-2.5 py-1 font-label text-[0.58rem] uppercase tracking-[0.14em] ${ROLE_BADGE[u.role] ?? ROLE_BADGE.CUSTOMER}`}
											>
												{u.role}
											</span>
										)}
									</td>
									<td className="px-4 py-3 font-serif text-xs text-ink-soft/80 dark:text-cream/50">
										{u.supabaseId
											? t("admin.team.linked")
											: t("admin.team.notLinked")}
									</td>
									<td className="px-4 py-3 font-serif text-xs text-ink-soft/60 dark:text-cream/40">
										{new Date(u.createdAt).toLocaleDateString("fr-FR")}
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>

			<p className="flex items-start gap-2 font-serif text-xs text-ink-soft/80 dark:text-cream/60">
				<UserCog className="mt-0.5 size-4 shrink-0 text-ink" />
				{t("admin.team.hint")}
			</p>
		</div>
	);
}
