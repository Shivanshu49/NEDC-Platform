import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { signPlaybackToken } from "@/lib/mux";
import { uuid } from "@/lib/validation";
import { rateLimit, clientIp } from "@/lib/ratelimit";

export const runtime = "nodejs";

/**
 * Mints a short-lived SIGNED Mux playback token for ONE recording — but only
 * after re-checking, AT REQUEST TIME, that the caller is actively enrolled in
 * the recording's cohort. This is the share-proof gate:
 *   - The recording row is RLS-protected, so the user-scoped client below
 *     returns it only if the caller is enrolled (status='active').
 *   - The token expires quickly, so even a leaked URL stops working fast.
 *   - A refunded student can no longer mint new tokens (RLS now hides the row).
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  // Validate the id is a uuid before touching the DB.
  if (!uuid.safeParse(id).success) {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Rate limit token minting (per user, falls back to IP).
  const { ok } = await rateLimit("recordingToken", user.id || clientIp(request));
  if (!ok) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  // RLS (recordings_select_enrolled) only returns this row if the user is
  // actively enrolled in the parent session's cohort.
  const { data: recording } = await supabase
    .from("recordings")
    .select("id, mux_playback_id, status")
    .eq("id", id)
    .maybeSingle();

  if (!recording || recording.status !== "ready" || !recording.mux_playback_id) {
    // Either not enrolled (RLS hid it), not ready, or has no playback id.
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  const token = await signPlaybackToken(recording.mux_playback_id);
  return NextResponse.json({ playbackId: recording.mux_playback_id, token });
}
