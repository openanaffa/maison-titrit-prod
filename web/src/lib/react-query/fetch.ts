/**
 * Typed fetch helper for the admin API routes used by react-query mutations.
 * Throws on non-ok responses so callers only handle the success path in
 * `onSuccess` and the error path in `onError`.
 */
export async function apiFetch(
	input: RequestInfo | URL,
	init?: RequestInit,
): Promise<Response> {
	const res = await fetch(input, {
		headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
		...init,
	});
	if (!res.ok) {
		let body = "";
		try {
			body = await res.text();
		} catch {
			/* ignore */
		}
		const err = new Error(`API ${res.status} ${res.statusText}`) as Error & {
			status?: number;
			body?: string;
		};
		err.status = res.status;
		err.body = body;
		throw err;
	}
	return res;
}
