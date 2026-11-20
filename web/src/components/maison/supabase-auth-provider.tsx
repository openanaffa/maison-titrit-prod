"use client";

import type { Session } from "@supabase/supabase-js";
import posthog from "posthog-js";
import * as React from "react";
import type { AuthenticatedUser } from "@/lib/supabase/auth-client";
import { getRoleFromAccessToken } from "@/lib/supabase/auth-client";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type AuthState = {
	user: AuthenticatedUser | null;
	loading: boolean;
};

const AuthContext = React.createContext<AuthState>({
	user: null,
	loading: true,
});

function userFromSession(session: Session | null): AuthenticatedUser | null {
	if (!session?.user) return null;
	return {
		...session.user,
		role: getRoleFromAccessToken(session.access_token),
	};
}

function identifyPostHogUser(session: Session): boolean {
	if (
		!process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN ||
		!process.env.NEXT_PUBLIC_POSTHOG_HOST
	)
		return false;

	const name = session.user.user_metadata.name;
	posthog.identify(session.user.id, {
		email: session.user.email,
		name: typeof name === "string" ? name : undefined,
		role: getRoleFromAccessToken(session.access_token),
	});
	return true;
}

export function SupabaseAuthProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [state, setState] = React.useState<AuthState>({
		user: null,
		loading: true,
	});
	const identifiedUserId = React.useRef<string | null>(null);

	React.useEffect(() => {
		let supabase: ReturnType<typeof createSupabaseBrowserClient>;
		try {
			supabase = createSupabaseBrowserClient();
		} catch (error) {
			// Public env not configured: degrade to signed-out instead of
			// crashing the whole storefront for every visitor.
			console.error("Supabase auth is not configured", error);
			setState({ user: null, loading: false });
			return;
		}
		let active = true;
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((event, session) => {
			if (event === "SIGNED_OUT") {
				if (identifiedUserId.current) posthog.reset();
				identifiedUserId.current = null;
			} else if (session?.user && identifiedUserId.current !== session.user.id) {
				if (identifiedUserId.current) posthog.reset();
				if (identifyPostHogUser(session)) {
					identifiedUserId.current = session.user.id;
				}
			}

			if (active) setState({ user: userFromSession(session), loading: false });
		});

		void supabase.auth.getSession().then(({ data, error }) => {
			if (!active) return;
			if (error) {
				console.error("Unable to load Supabase auth session", error);
				setState({ user: null, loading: false });
				return;
			}
			setState({ user: userFromSession(data.session), loading: false });
		});

		return () => {
			active = false;
			subscription.unsubscribe();
		};
	}, []);

	return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useSupabaseAuth() {
	return React.useContext(AuthContext);
}
