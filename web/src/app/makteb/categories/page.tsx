import { db } from "@/lib/db";
import { CategoriesClient } from "@/components/admin/categories-client";

export const dynamic = "force-dynamic";

export default async function MaktebCategoriesPage() {
  const cats = await db.category.findMany({ orderBy: { position: "asc" } });
  const counts = await db.product.groupBy({
    by: ["categoryId"],
    _count: { _all: true },
  });
  const countMap = new Map(counts.map((c) => [c.categoryId ?? "", c._count._all]));
  const initial = cats.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    position: c.position,
    count: countMap.get(c.id) ?? 0,
  }));
  return <CategoriesClient initial={initial} />;
}
