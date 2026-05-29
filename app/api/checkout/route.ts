import { NextResponse } from "next/server";
import { razorpayClient } from "@/lib/razorpay";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { checkoutBody } from "@/lib/validation";
import { rateLimit, clientIp } from "@/lib/ratelimit";
import { logEvent } from "@/lib/log";

export const runtime = "nodejs";

/**
 * Creates a Razorpay order for a cohort and records a 'created' payment row.
 * The browser then opens Razorpay Checkout with the returned order id; the
 * actual enrollment is granted later by the webhook (the source of truth).
 *
 * Security: the price comes from the DB, never the client; the order's user_id /
 * cohort_id are server-set in `notes`; and we mirror them in our payments row.
 * Rate-limited per user, and the body is Zod-validated.
 */
export async function POST(request: Request) {
  // 1. Require a signed-in user.
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Please log in to enroll." }, { status: 401 });
  }

  // 2. Rate limit (per user; falls back to IP). Blunts scripted order spam.
  const { ok } = await rateLimit("checkout", user.id || clientIp(request));
  if (!ok) {
    logEvent("warn", "checkout.rate_limited", { userId: user.id });
    return NextResponse.json(
      { error: "Too many attempts. Please wait a minute and try again." },
      { status: 429 },
    );
  }

  // 3. Validate the body (cohortId must be a uuid).
  let cohortId: string;
  try {
    const parsed = checkoutBody.parse(await request.json());
    cohortId = parsed.cohortId;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();

  // 4. Authoritative price + availability from the DB (NEVER trust the client).
  const { data: cohort } = await admin
    .from("cohorts")
    .select("id, name, price_inr, enroll_open")
    .eq("id", cohortId)
    .maybeSingle();
  if (!cohort || !cohort.enroll_open) {
    return NextResponse.json(
      { error: "This cohort isn't open for enrollment." },
      { status: 400 },
    );
  }

  // 5. Already ACTIVELY enrolled? Don't charge again. (A previously
  //    cancelled/refunded enrollment is intentionally allowed to re-purchase —
  //    the webhook re-activates that row on a successful payment.)
  const { data: existing } = await admin
    .from("enrollments")
    .select("id, status")
    .eq("user_id", user.id)
    .eq("cohort_id", cohort.id)
    .maybeSingle();
  if (existing && existing.status === "active") {
    return NextResponse.json({ alreadyEnrolled: true }, { status: 409 });
  }

  // 6. Reuse an existing OPEN order for this (user, cohort) at the current price.
  //    Without this, every Enroll click (e.g. opening then dismissing the modal)
  //    would pile up separate, independently-capturable orders.
  const { data: openPayment } = await admin
    .from("payments")
    .select("razorpay_order_id")
    .eq("user_id", user.id)
    .eq("cohort_id", cohort.id)
    .eq("status", "created")
    .eq("amount_inr", cohort.price_inr)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let orderId = openPayment?.razorpay_order_id;

  // 7. Otherwise create a fresh Razorpay order and record a 'created' payment.
  if (!orderId) {
    const razorpay = razorpayClient();
    let order;
    try {
      order = await razorpay.orders.create({
        amount: cohort.price_inr, // paise
        currency: "INR",
        notes: { user_id: user.id, cohort_id: cohort.id }, // server-set, authoritative
      });
    } catch {
      logEvent("error", "checkout.order_create_failed", {
        userId: user.id,
        cohortId: cohort.id,
      });
      return NextResponse.json(
        { error: "Couldn't start checkout. Please try again." },
        { status: 502 },
      );
    }

    // The 'created' payment row is the webhook's anchor — if this insert fails,
    // a later capture would have no row to match, so abort and let the user retry.
    const { error: insertError } = await admin.from("payments").insert({
      user_id: user.id,
      cohort_id: cohort.id,
      razorpay_order_id: order.id,
      amount_inr: cohort.price_inr,
      currency: "INR",
      status: "created",
    });
    if (insertError) {
      logEvent("error", "checkout.payment_insert_failed", {
        userId: user.id,
        cohortId: cohort.id,
      });
      return NextResponse.json(
        { error: "Couldn't start checkout. Please try again." },
        { status: 502 },
      );
    }
    orderId = order.id;
    logEvent("info", "checkout.order_created", {
      userId: user.id,
      cohortId: cohort.id,
      orderId,
    });
  }

  return NextResponse.json({
    orderId,
    amount: cohort.price_inr,
    currency: "INR",
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    cohortName: cohort.name,
    prefillEmail: user.email,
  });
}
