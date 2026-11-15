import { requirePagePermission } from "@/lib/session";
import { TagsClient } from "@/components/admin/tags-client";

export const dynamic = "force-dynamic";

export default async function MaktebTagsPage() {
  await requirePagePermission("integrations:write");
  return <TagsClient />;
}
