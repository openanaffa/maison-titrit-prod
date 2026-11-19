import { TagsClient } from "@/components/admin/tags-client";
import { requirePagePermission } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function MaktebTagsPage() {
	await requirePagePermission("integrations:write");
	return <TagsClient />;
}
