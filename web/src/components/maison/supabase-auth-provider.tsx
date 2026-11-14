"use client";

import * as React from "react";
import type { Session } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  getRoleFromAccessToken,
} from "@/lib/supabase/auth-client";
import type { AuthenticatedUser } from "@/lib/supabase/auth-client";

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

export function SupabaseAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = React.useState<AuthState>({
    user: null,
    loading: true,
  });

  React.useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    let active = true;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
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
