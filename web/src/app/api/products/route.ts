import { NextResponse } from "next/server";
import { listProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") || undefined;
  try {
    const products = await listProducts(category);
    return NextResponse.json({ products });
  } catch (e) {
    console.error("GET /api/products failed", e);
    return NextResponse.json(
      { error: "Impossible de charger la collection." },
      { status: 500 },
    );
  }
}
