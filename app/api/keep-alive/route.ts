import { createHash, timingSafeEqual } from "node:crypto";

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
// Never cache — every hit must actually reach the database to count as activity.
export const dynamic = "force-dynamic";

/**
 * Keep-alive ping for Supabase's FREE tier, which pauses a project after ~7 days
 * with no requests. A Vercel Cron (see vercel.json) calls this once a day; the
 * lightweight count query below is a real round-trip to Postgres, which resets
 * the inactivity timer. (It only PREVENTS pausing — it cannot un-pause an already
 * paused project; that's a manual "Restore" in the Supabase dashboard.)
 *
 * Auth: Vercel Cron automatically attaches `Authorization: Bearer <CRON_SECRET>`
 * when the CRON_SECRET env var is set, so only the cron (or someone holding the
 * secret) can trigger it. In production the route FAILS CLOSED if CRON_SECRET is
 * unset, so a forgotten secret can't leave an unauthenticated, DB-touching
 * endpoint exposed. Locally (dev) it stays open for convenience.
 */

// Constant-time compare: hash both inputs to a fixed 32-byte digest first, so
// timingSafeEqual gets equal-length buffers and we never leak length.
function safeEqual(a: string, b: string): boolean {
  const ah = createHash("sha256").update(a).digest();
  const bh = createHash("sha256").update(b).digest();
  return timingSafeEqual(ah, bh);
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const isProd =
    process.env.VERCEL_ENV === "production" ||
    process.env.NODE_ENV === "production";

  if (secret) {
    const auth = request.headers.get("authorization") ?? "";
    if (!safeEqual(auth, `Bearer ${secret}`)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } else if (isProd) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Least privilege: a plain ANON client (RLS applies) is enough to make one real
  // query — no need for the service-role key on a publicly reachable route.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return NextResponse.json(
      { ok: false, error: "Supabase not configured" },
      { status: 500 },
    );
  }
  const supabase = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // head+count = a real SELECT against Postgres while transferring no rows. We do
  // NOT return the count (no info leak); a 200 just means the DB was reached.
  const { error } = await supabase
    .from("courses")
    .select("id", { count: "exact", head: true });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
