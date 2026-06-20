import { NextResponse } from "next/server";
import { verifyCheckoutSignature } from "@/lib/razorpay";
import { verifyPaymentBody } from "@/lib/validation";
import { logEvent } from "@/lib/log";

export const runtime = "nodejs";

/**
 * Verifies the Razorpay Checkout HANDLER signature returned to the browser on a
 * successful payment (HMAC-SHA256 of `order_id|payment_id`, keyed with the Key
 * Secret). Lets the client fail closed if the success payload was tampered with,
 * giving instant UX feedback.
 *
 * IMPORTANT: this is a confirmation gate only — it grants NOTHING and touches no
 * data. Enrollment is still granted exclusively by /api/webhooks/razorpay, the
 * source of truth (see CLAUDE.md §5). A pass here just means "safe to send the
 * user to the dashboard; the webhook will finalize access."
 */
export async function POST(request: Request) {
  // 1. Validate shape — a missing/blank field is a 400 before any crypto.
  let body;
  try {
    body = verifyPaymentBody.parse(await request.json());
  } catch {
    return NextResponse.json(
      { verified: false, error: "Missing or invalid payment fields." },
      { status: 400 },
    );
  }

  // 2. Recompute and timing-safe compare the signature with the Key Secret.
  const ok = verifyCheckoutSignature(
    body.razorpay_order_id,
    body.razorpay_payment_id,
    body.razorpay_signature,
    process.env.RAZORPAY_KEY_SECRET,
  );

  // 3. Mismatch → 400, and (per the rules) mark nothing as paid. The webhook
  //    will never grant access for a forged payload either.
  if (!ok) {
    logEvent("warn", "verify_payment.signature_mismatch", {
      orderId: body.razorpay_order_id,
    });
    return NextResponse.json(
      { verified: false, error: "Payment signature verification failed." },
      { status: 400 },
    );
  }

  return NextResponse.json({ verified: true });
}
