import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { markEdpRegistrationPaid } from "@/lib/edp";
import { sendEnrollmentEmail } from "@/lib/email";
import { sendEnrollmentSms } from "@/lib/sms";
import { logEvent } from "@/lib/log";

export const runtime = "nodejs";

/**
 * Razorpay payment webhook — the SOURCE OF TRUTH for enrollment.
 *
 * Hardening (see CLAUDE.md §5):
 *  1. Verify the HMAC signature on the RAW body before any DB access.
 *  2. Idempotent: payments keyed on razorpay_order_id (unique); the enrollment
 *     upsert is keyed on (user_id, cohort_id), so Razorpay retries are safe.
 *  3. Trust the server, not the body: user_id / cohort_id / amount come from the
 *     payments row we wrote at checkout, not from the webhook payload.
 *  4. Amount is validated FAIL-CLOSED (must be a number equal to what we charged).
 *  5. A paid re-purchase RE-ACTIVATES a previously cancelled/refunded enrollment.
 *  6. The welcome email is claimed ATOMICALLY so concurrent retries can't double-send.
 *
 * NOTE: this route is excluded from middleware (see middleware.ts matcher) so it
 * receives the raw, unmodified body with no session handling.
 */
export async function POST(request: Request) {
  // 1. Verify signature on the RAW body FIRST.
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature");
  if (!verifyWebhookSignature(rawBody, signature, process.env.RAZORPAY_WEBHOOK_SECRET)) {
    logEvent("warn", "razorpay_webhook.invalid_signature", {});
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(rawBody);
  const payment = event?.payload?.payment?.entity;
  const orderId: string | undefined = payment?.order_id;

  const admin = createSupabaseAdminClient();

  // Keep the ledger honest: record failed attempts (no access is granted).
  if (event.event === "payment.failed") {
    if (orderId) {
      await admin
        .from("payments")
        .update({ status: "failed", razorpay_payment_id: payment?.id })
        .eq("razorpay_order_id", orderId)
        .eq("status", "created");
      // Guest /edp funnel: keep the lead, just record the failed attempt so
      // staff can follow up (the form also lets the visitor retry in place).
      await admin
        .from("edp_registrations")
        .update({ payment_status: "failed", razorpay_payment_id: payment?.id })
        .eq("razorpay_order_id", orderId)
        .eq("payment_status", "pending");
    }
    return NextResponse.json({ received: true });
  }

  // Only a successful capture grants access; acknowledge everything else.
  if (event.event !== "payment.captured" || !orderId) {
    return NextResponse.json({ received: true });
  }

  // 2. Find OUR payment row (written at checkout). It carries the trusted
  //    user_id / cohort_id / amount.
  const { data: pay } = await admin
    .from("payments")
    .select("*")
    .eq("razorpay_order_id", orderId)
    .maybeSingle();
  if (!pay) {
    // Not a logged-in checkout order — maybe a guest /edp registration. This
    // webhook is the fallback confirmation when the browser never returned
    // from Razorpay (tab closed, network drop). markEdpRegistrationPaid is
    // idempotent and FAILS CLOSED unless the captured amount and currency
    // exactly match what we stamped on the lead at order creation.
    const currencyOk =
      typeof payment.currency !== "string" || payment.currency === "INR";
    const capturedAmount =
      currencyOk && typeof payment.amount === "number" ? payment.amount : -1;
    const { registration } = await markEdpRegistrationPaid(admin, {
      orderId,
      paymentId: payment.id ?? null,
      amountPaise: capturedAmount,
    });
    if (registration) {
      logEvent("info", "razorpay_webhook.edp_paid", {
        registrationId: registration.id,
        orderId,
      });
    }
    return NextResponse.json({ received: true }); // unknown orders are ignored
  }

  // A terminal payment must never be reprocessed. This blocks a stale
  // payment.captured retry (Razorpay can redeliver much later) from flipping a
  // refunded payment back to 'paid' or resurrecting access after a refund.
  if (pay.status === "refunded" || pay.status === "failed") {
    return NextResponse.json({ received: true });
  }

  // 3. Amount AND currency must be exactly what we recorded (which came from the
  //    DB price). FAIL CLOSED: anything unexpected is rejected. (Currency is
  //    fixed to INR at order creation, but we assert it here as defense-in-depth.)
  const currencyOk =
    typeof payment.currency !== "string" || payment.currency === "INR";
  if (
    typeof payment.amount !== "number" ||
    payment.amount !== pay.amount_inr ||
    !currencyOk
  ) {
    await admin.from("payments").update({ status: "failed" }).eq("id", pay.id);
    logEvent("warn", "razorpay_webhook.amount_mismatch", {
      orderId,
      expected: pay.amount_inr,
      got: payment.amount,
      currency: payment.currency,
    });
    return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
  }

  // 4. Mark the payment paid (idempotent on retries).
  await admin
    .from("payments")
    .update({
      status: "paid",
      razorpay_payment_id: payment.id,
      method: payment.method,
    })
    .eq("id", pay.id);

  // 5. Grant access. Upsert on (user_id, cohort_id): creates the enrollment, OR
  //    if one already exists (e.g. a previously refunded re-purchase) flips it
  //    back to 'active' and links the new payment. Safe on Razorpay retries
  //    because re-applying the same values is a no-op.
  await admin.from("enrollments").upsert(
    {
      user_id: pay.user_id,
      cohort_id: pay.cohort_id,
      status: "active",
      payment_id: pay.id,
      plan: pay.plan ?? "basic", // record the tier they bought (Basic / Premium)
    },
    { onConflict: "user_id,cohort_id" },
  );
  logEvent("info", "razorpay_webhook.enrollment_granted", {
    userId: pay.user_id,
    cohortId: pay.cohort_id,
    orderId,
  });

  // 6. Send the confirmation email exactly once. We CLAIM the send atomically:
  //    the conditional update only returns a row to the invocation that flips
  //    welcome_email_sent_at from null, so concurrent retries can't double-send.
  const { data: claimed } = await admin
    .from("enrollments")
    .update({ welcome_email_sent_at: new Date().toISOString() })
    .eq("user_id", pay.user_id)
    .eq("cohort_id", pay.cohort_id)
    .is("welcome_email_sent_at", null)
    .select("id");

  if (claimed && claimed.length > 0) {
    const enrollmentId = claimed[0].id;
    const { data: userResult } = await admin.auth.admin.getUserById(pay.user_id);
    const email = userResult?.user?.email;
    const { data: cohort } = await admin
      .from("cohorts")
      .select("name")
      .eq("id", pay.cohort_id)
      .maybeSingle();
    const { data: sessions } = await admin
      .from("sessions")
      .select("title, starts_at, zoom_join_url")
      .eq("cohort_id", pay.cohort_id)
      .order("day_number", { ascending: true });

    const result = email
      ? await sendEnrollmentEmail({
          to: email,
          cohortName: cohort?.name ?? "your NEDC cohort",
          amountInr: pay.amount_inr,
          razorpayPaymentId: payment.id ?? null,
          sessions: sessions ?? [],
        })
      : { sent: false as const };

    // If we couldn't actually send, release the claim so a later retry re-sends.
    if (!result.sent) {
      await admin
        .from("enrollments")
        .update({ welcome_email_sent_at: null })
        .eq("id", enrollmentId);
    }

    // SMS confirmation is PLANNED — this hook is a safe no-op until a provider is
    // configured (lib/sms.ts). It never throws and never blocks enrollment.
    const { data: profile } = await admin
      .from("profiles")
      .select("phone")
      .eq("id", pay.user_id)
      .maybeSingle();
    await sendEnrollmentSms({
      phone: profile?.phone ?? null,
      cohortName: cohort?.name ?? "your NEDC program",
    });
  }

  return NextResponse.json({ received: true });
}
