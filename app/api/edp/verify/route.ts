import { NextResponse } from "next/server";
import { verifyCheckoutSignature } from "@/lib/razorpay";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { markEdpRegistrationPaid } from "@/lib/edp";
import { verifyPaymentBody } from "@/lib/validation";
import { logEvent } from "@/lib/log";

export const runtime = "nodejs";

/**
 * Confirms a guest /edp payment from the browser's Razorpay success handler.
 *
 * Verifies the checkout signature (HMAC of `order_id|payment_id`, keyed with
 * the Razorpay Key Secret) BEFORE touching any data, then marks the matching
 * edp_registrations row paid and triggers the confirmation emails — all
 * idempotent, because the Razorpay webhook performs the same transition as a
 * fallback (see lib/edp.ts). Only after this returns verified:true does the
 * client navigate to /edp/thank-you.
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

  // 2. Recompute and timing-safe compare the signature. FAIL CLOSED.
  const ok = verifyCheckoutSignature(
    body.razorpay_order_id,
    body.razorpay_payment_id,
    body.razorpay_signature,
    process.env.RAZORPAY_KEY_SECRET,
  );
  if (!ok) {
    logEvent("warn", "edp_verify.signature_mismatch", {
      orderId: body.razorpay_order_id,
    });
    return NextResponse.json(
      { verified: false, error: "Payment signature verification failed." },
      { status: 400 },
    );
  }

  // 3. Signature is genuine → record the payment on the lead and send the
  //    confirmation emails (claimed atomically; the webhook can't double-send).
  const admin = createSupabaseAdminClient();
  const { registration } = await markEdpRegistrationPaid(admin, {
    orderId: body.razorpay_order_id,
    paymentId: body.razorpay_payment_id,
  });

  if (!registration) {
    // Genuine payment but no matching lead (e.g. row deleted in the Table
    // Editor). Don't fail the user — the webhook/staff will reconcile.
    logEvent("warn", "edp_verify.registration_missing", {
      orderId: body.razorpay_order_id,
    });
    return NextResponse.json({ verified: true, ref: null });
  }

  logEvent("info", "edp_verify.paid", {
    registrationId: registration.id,
    orderId: body.razorpay_order_id,
  });
  return NextResponse.json({ verified: true, ref: registration.id });
}
