import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for use in the BROWSER (Client Components, "use client").
 *
 * It only ever sees the public URL + anon key (both safe to expose to the
 * browser). Every query it makes is constrained by Row Level Security, so a
 * logged-in student can only read/write the rows our RLS policies allow.
 *
 * Usage (inside a Client Component):
 *   const supabase = createSupabaseBrowserClient();
 *   const { data } = await supabase.from("courses").select("*");
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
