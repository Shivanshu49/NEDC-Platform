import "server-only"; // Build FAILS if this file is ever imported into client code.
import { createClient } from "@supabase/supabase-js";

/**
 * Supabase ADMIN client — authenticated with the SERVICE-ROLE key, which
 * BYPASSES Row Level Security.
 *
 * Use this ONLY in trusted server code that must write data users cannot write
 * themselves — above all, the Razorpay payment webhook that creates
 * `enrollments` / `payments` rows (Phase 3).
 *
 * NEVER import this into a Client Component. The `import "server-only"` line at
 * the top turns any such mistake into a build error, so the service-role key can
 * never leak to the browser.
 */
export function createSupabaseAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      // This client represents the server, not a logged-in user — don't try to
      // persist or refresh a user session.
      auth: { autoRefreshToken: false, persistSession: false },
    },
  );
}
