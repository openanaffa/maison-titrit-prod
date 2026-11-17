import { requirePagePermission } from "@/lib/session";
import { db } from "@/lib/db";
import { TeamClient } from "@/components/admin/team-client";

export const dynamic = "force-dynamic";

export default async function MaktebTeamPage() {
  const me = await requirePagePermission("users:manage");
  const users = await db.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      supabaseId: true,
      createdAt: true,
    },
    orderBy: [{ role: "asc" }, { createdAt: "desc" }],
  });
  return (
    <TeamClient
      meId={me.id}
      users={users.map((u) => ({ ...u, createdAt: u.createdAt.toISOString() }))}
    />
  );
}
