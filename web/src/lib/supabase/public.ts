import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

let publicClient: ReturnType<typeof createClient<Database>> | undefined;

export function createSupabasePublicClient() {
  if (!publicClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) {
      throw new Error(
        "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be configured.",
      );
    }
    publicClient = createClient<Database>(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return publicClient;
}
