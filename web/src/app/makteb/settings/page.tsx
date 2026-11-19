import { SettingsClient } from "@/components/admin/settings-client";
import { requirePagePermission } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function MaktebSettingsPage() {
	await requirePagePermission("settings:write");
	return <SettingsClient />;
}
