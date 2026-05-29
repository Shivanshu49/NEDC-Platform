import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Where magic-link and Google sign-ins land. Supabase appends a `code` we
 * exchange for a logged-in session (which sets the auth cookies), then we send
 * the user on to `next` (defaults to the dashboard).
 *
 * `next` is forced to a same-site path to avoid open-redirects.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next") ?? "/dashboard";
  // Only allow internal paths (must start with a single "/").
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//")
    ? nextParam
    : "/dashboard";

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Something went wrong (expired/invalid link) — back to login with a flag.
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
