import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Runs on every matched request (see middleware.ts):
 *  1. Refreshes the Supabase auth session and keeps its cookies in sync.
 *  2. Guards /dashboard — signed-out users are bounced to /login.
 *
 * This follows Supabase's official @supabase/ssr middleware pattern. The exact
 * cookie dance matters: we must return the SAME `supabaseResponse` object so the
 * refreshed cookies reach the browser.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: getUser() refreshes the session. Don't run other code between
  // creating the client and this call.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect the student area.
  if (!user && request.nextUrl.pathname.startsWith("/dashboard")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
