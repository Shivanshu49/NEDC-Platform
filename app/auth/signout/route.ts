import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Sign out via a POST (so it can't be triggered by a stray link/prefetch).
 * Clears the Supabase session cookies and returns home.
 *
 * CSRF defense-in-depth: Supabase auth cookies default to SameSite=Lax (so a
 * cross-site POST won't carry the session anyway), but we also verify the
 * request originated from our own site before acting.
 */
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const expected = new URL(request.url).origin;
  if (origin && origin !== expected) {
    return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  }

  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  // 303 turns the POST into a GET for the redirect.
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}
