import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase client for use on the SERVER (Server Components, Route Handlers,
 * Server Actions).
 *
 * It reads the user's auth session from cookies, so queries run AS THE LOGGED-IN
 * USER and are still constrained by Row Level Security. Use this — not the
 * service-role client — for anything that should respect a user's permissions.
 *
 * `cookies()` is async in Next.js 15, so this helper is async too:
 *   const supabase = await createSupabaseServerClient();
 *   const { data: { user } } = await supabase.auth.getUser();
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Read all cookies so Supabase can find the session.
        getAll() {
          return cookieStore.getAll();
        },
        // Write refreshed session cookies back. This throws when called from a
        // Server Component (where cookies are read-only); that's expected and
        // safe to ignore because middleware refreshes the session instead.
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component — ignore.
          }
        },
      },
    },
  );
}
