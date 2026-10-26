import { NextResponse } from "next/server";
import { getProduct } from "@/lib/products";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ ref: string }> },
) {
  const { ref } = await params;
  try {
    const product = await getProduct(ref);
    if (!product) {
      return NextResponse.json({ error: "Produit introuvable." }, { status: 404 });
    }
    return NextResponse.json({ product });
  } catch (e) {
    console.error("GET /api/products/[ref] failed", e);
    return NextResponse.json(
      { error: "Impossible de charger ce produit." },
      { status: 500 },
    );
  }
}
