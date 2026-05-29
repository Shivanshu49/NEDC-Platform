import "server-only";
import crypto from "node:crypto";

/**
 * Zoom webhook helpers.
 *
 * Zoom signs each webhook with HMAC-SHA256 over `v0:<timestamp>:<rawBody>`
 * using your app's Secret Token, and sends:
 *   x-zm-signature:        "v0=<hex>"
 *   x-zm-request-timestamp: <unix-ish timestamp>
 *
 * Separately, when you first enable the webhook Zoom sends a one-time URL
 * "validation" event; we must echo back a hashed token. Both are handled here.
 */

// Reject requests whose timestamp is older/newer than this, to stop replay of a
// captured (still validly-signed) request.
const MAX_SKEW_SECONDS = 300; // 5 minutes

/** Verify a Zoom webhook signature against the RAW body, with replay protection. */
export function verifyZoomSignature(
  rawBody: string,
  signature: string | null,
  timestamp: string | null,
  secret: string | undefined,
): boolean {
  if (!signature || !timestamp || !secret) return false;

  // Replay guard: timestamp must be a number within the allowed skew of now.
  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) return false;
  const nowSec = Date.now() / 1000;
  if (Math.abs(nowSec - ts) > MAX_SKEW_SECONDS) return false;

  const message = `v0:${timestamp}:${rawBody}`;
  const expected =
    "v0=" + crypto.createHmac("sha256", secret).update(message).digest("hex");
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** Compute the response for Zoom's one-time URL validation challenge. */
export function zoomUrlValidationResponse(
  plainToken: string,
  secret: string | undefined,
) {
  const encryptedToken = crypto
    .createHmac("sha256", secret ?? "")
    .update(plainToken)
    .digest("hex");
  return { plainToken, encryptedToken };
}

/**
 * SSRF guard: only let the recordings pipeline fetch from Zoom's own download
 * hosts. The download URL arrives inside a signature-verified webhook, but we
 * still allow-list the host before handing it to Mux's "ingest from URL".
 */
export function isAllowedZoomDownloadUrl(rawUrl: string): boolean {
  let u: URL;
  try {
    u = new URL(rawUrl);
  } catch {
    return false;
  }
  if (u.protocol !== "https:") return false;
  const host = u.hostname.toLowerCase();
  return (
    host === "zoom.us" ||
    host.endsWith(".zoom.us") ||
    host === "zoom.com" ||
    host.endsWith(".zoom.com")
  );
}
