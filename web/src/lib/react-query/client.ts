import { QueryClient } from "@tanstack/react-query";

/**
 * Shared TanStack Query client.
 *
 * One instance per server-side render; a fresh client is created on every
 * request so cached data never leaks between users. Client components obtain
 * it via the `ReactQueryProvider` (mounted in the root layout).
 */
export function createQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 30_000,
				gcTime: 5 * 60_000,
				refetchOnWindowFocus: false,
				retry: 1,
			},
			mutations: {
				retry: 0,
			},
		},
	});
}
