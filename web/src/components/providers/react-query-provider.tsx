"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";
import { createQueryClient } from "@/lib/react-query/client";

/**
 * Provides a TanStack Query client to the whole app.
 *
 * Mounted once in the root layout. A fresh client is created per render so
 * cached data never leaks between users on the server; on the client the
 * state is preserved by React.
 */
export function ReactQueryProvider({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	const [queryClient] = React.useState(() => createQueryClient());
	return (
		<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	);
}
