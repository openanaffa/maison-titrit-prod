import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/session";
import { saveUpload } from "@/lib/storage";

export const dynamic = "force-dynamic";

/** POST /api/admin/upload — upload a product image to Cloudflare R2 (prod) or local disk (dev).
 *
 * Requires products:write permission. Returns { url, key } on success.
 */
export async function POST(req: Request) {
	const { user, allowed } = await requirePermission("products:write");
	if (!user || !allowed) {
		return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
	}

	const formData = await req.formData();
	const file = formData.get("file");
	if (!(file instanceof File)) {
		return NextResponse.json({ error: "Aucun fichier reçu." }, { status: 400 });
	}

	try {
		const { url, key } = await saveUpload(file);
		return NextResponse.json({ url, key });
	} catch (e) {
		const message = e instanceof Error ? e.message : "Upload failed.";
		console.error("POST /api/admin/upload failed", e);
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
