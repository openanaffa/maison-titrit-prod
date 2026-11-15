import { requirePagePermission } from "@/lib/session";
import { SettingsClient } from "@/components/admin/settings-client";

export const dynamic = "force-dynamic";

export default async function MaktebSettingsPage() {
  await requirePagePermission("settings:write");
  return <SettingsClient />;
}
