import "server-only"; // never bundle the Razorpay secret into client code
import crypto from "node:crypto";
import Razorpay from "razorpay";

/**
 * Razorpay server helpers. The Key ID is public (the browser checkout needs it);
 * the Key Secret and Webhook Secret are server-only.
 */
export function razorpayClient() {
  return new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
}

/**
 * Verify a Razorpay webhook signature against the RAW request body using a
 * timing-safe comparison. Returns true only if the HMAC-SHA256 matches.
 */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string | null,
  secret: string | undefined,
): boolean {
  if (!signature || !secret) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  // timingSafeEqual throws if lengths differ, so guard first.
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/**
 * Verify a Razorpay Checkout HANDLER signature — the one returned to the browser
 * on a successful payment — with a timing-safe comparison. The signed message is
 * `order_id|payment_id` and the key is the Razorpay Key SECRET. This is DISTINCT
 * from verifyWebhookSignature (HMAC over the whole raw body, keyed with the
 * WEBHOOK secret).
 *
 * This is a fast, tamper-proof UX confirmation only: it lets the browser fail
 * closed if the success payload was forged. The webhook remains the SOURCE OF
 * TRUTH that actually grants enrollment (see CLAUDE.md §5) — this never writes.
 */
export function verifyCheckoutSignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string | undefined,
): boolean {
  if (!secret) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
