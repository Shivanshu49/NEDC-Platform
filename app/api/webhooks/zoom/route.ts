import { NextResponse } from "next/server";
import {
  verifyZoomSignature,
  zoomUrlValidationResponse,
  isAllowedZoomDownloadUrl,
} from "@/lib/zoom";
import { inngest, EVENTS } from "@/lib/inngest";
import { logEvent } from "@/lib/log";

export const runtime = "nodejs";

/**
 * Zoom "recording.completed" webhook.
 *
 * Responsibilities (kept tiny — the heavy lifting is a background job):
 *  1. Verify the signature on the RAW body, with replay protection (excluded
 *     from middleware so the body is untouched — see middleware matcher).
 *  2. Answer Zoom's one-time URL validation challenge.
 *  3. On recording.completed, pick the best video file + a download URL and
 *     hand off to the Inngest pipeline, then return 200 immediately.
 *
 * Zoom appends a `download_token` for protected downloads; we pass it on the URL
 * so the background job can fetch the file.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-zm-signature");
  const timestamp = request.headers.get("x-zm-request-timestamp");
  const secret = process.env.ZOOM_WEBHOOK_SECRET_TOKEN;

  if (!verifyZoomSignature(rawBody, signature, timestamp, secret)) {
    logEvent("warn", "zoom_webhook.invalid_signature", {});
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody);

  // 1. URL validation handshake (sent once when you enable the webhook).
  if (event.event === "endpoint.url_validation") {
    return NextResponse.json(
      zoomUrlValidationResponse(event.payload?.plainToken, secret),
    );
  }

  // 2. Only act on completed recordings; acknowledge anything else.
  if (event.event !== "recording.completed") {
    return NextResponse.json({ received: true });
  }

  const obj = event.payload?.object;
  const zoomMeetingId = obj?.id != null ? String(obj.id) : null;
  const files: Array<{ file_type?: string; download_url?: string }> =
    obj?.recording_files ?? [];

  // Prefer the first MP4 with a download URL.
  const videoFile =
    files.find((f) => f.file_type === "MP4" && !!f.download_url) ?? null;

  // SSRF guard: only fetch from Zoom's own download hosts.
  if (
    zoomMeetingId &&
    videoFile?.download_url &&
    isAllowedZoomDownloadUrl(videoFile.download_url)
  ) {
    // Zoom needs this token appended to actually download the file.
    const downloadToken = event.download_token;
    const downloadUrl = downloadToken
      ? `${videoFile.download_url}?access_token=${downloadToken}`
      : videoFile.download_url;

    // Hand off to the background job and return fast (Inngest retries on failure).
    await inngest.send({
      name: EVENTS.RECORDING_COMPLETED,
      data: { zoomMeetingId, downloadUrl },
    });
    logEvent("info", "zoom_webhook.recording_queued", { zoomMeetingId });
  } else if (videoFile?.download_url) {
    logEvent("warn", "zoom_webhook.download_url_rejected", { zoomMeetingId });
  }

  return NextResponse.json({ received: true });
}
