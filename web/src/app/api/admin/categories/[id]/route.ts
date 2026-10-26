import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, allowed } = await requirePermission("categories:write");
  if (!user || !allowed) return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  const { id } = await params;
  try {
    // unlink products first (categoryId is nullable)
    await db.product.updateMany({ where: { categoryId: id }, data: { categoryId: null } });
    await db.category.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/admin/categories/[id] failed", e);
    return NextResponse.json({ error: "Suppression impossible." }, { status: 500 });
  }
}
