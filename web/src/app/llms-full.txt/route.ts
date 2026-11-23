import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const dynamic = "force-dynamic";

export async function GET() {
	const llmsMd = await readFile(
		join(process.cwd(), "public", "LLMs.md"),
		"utf-8",
	);
	return new Response(llmsMd, {
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
			"Cache-Control": "public, max-age=3600, s-maxage=3600",
		},
	});
}
