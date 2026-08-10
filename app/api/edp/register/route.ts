import { NextResponse } from "next/server";
import { z } from "zod";
import { razorpayClient } from "@/lib/razorpay";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { sendEdpEnquiryEmail } from "@/lib/email";
import { edpRegisterBody, normalizeIndianPhone } from "@/lib/validation";
import { rateLimit, clientIp } from "@/lib/ratelimit";
import { logEvent } from "@/lib/log";

export const runtime = "nodejs";

/**
 * The /edp hero form's single submit target — one continuous guest flow:
 *
 *   1. save the LEAD (edp_registrations row) — before any payment work, so an
 *      abandoned or failed checkout still leaves a complete, followable lead;
 *   2. send the staff enquiry email (once per lead, atomically claimed);
 *   3. create the Razorpay order at the DB price (cohorts.price_inr — the
 *      browser names a cohort, never an amount) and return it for checkout.
 *
 * Retries reuse everything: the client resends `registrationId`, we update the
 * same lead, skip the already-sent enquiry email, and reuse the open order
 * (unless the price changed). No login required — this is the paid-ads funnel;
 * payment confirmation lands via /api/edp/verify plus the Razorpay webhook.
 */
export async function POST(request: Request) {
  // 1. Rate limit per IP — this route writes rows, emails staff, hits Razorpay.
  const { ok } = await rateLimit("edpRegister", clientIp(request));
  if (!ok) {
    logEvent("warn", "edp_register.rate_limited", { ip: clientIp(request) });
    return NextResponse.json(
      { error: "Too many attempts. Please wait a few minutes and try again." },
      { status: 429 },
    );
  }

  // 2. Validate the body. The honeypot field (`website`) must be empty —
  //    humans never see it, so a filled value is a bot and fails the parse.
  let body: z.infer<typeof edpRegisterBody>;
  try {
    body = edpRegisterBody.parse(await request.json());
  } catch {
    return NextResponse.json(
      { error: "Please check the form and try again." },
      { status: 400 },
    );
  }
  // The schema's refine guarantees this normalizes; fall back defensively.
  const phone = normalizeIndianPhone(body.phone) ?? body.phone.trim();
  const name = body.name;
  const email = body.email;
  const message = body.message?.trim() ? body.message.trim() : null;

  const admin = createSupabaseAdminClient();

  // 3. Authoritative cohort + price from the DB — NEVER from the client.
  let cohort: {
    id: string;
    name: string;
    price_inr: number;
    enroll_open: boolean;
  } | null = null;
  if (body.cohortId) {
    const { data } = await admin
      .from("cohorts")
      .select("id, name, price_inr, enroll_open")
      .eq("id", body.cohortId)
      .maybeSingle();
    cohort = data;
  }
  const paymentOpen =
    cohort !== null &&
    cohort.enroll_open &&
    typeof cohort.price_inr === "number" &&
    cohort.price_inr > 0;

  // 4. Save the lead. A retry (same registrationId) updates the existing row —
  //    unless it's already paid, which the browser must not be able to touch.
  type LeadRow = {
    id: string;
    razorpay_order_id: string | null;
    amount_inr: number | null;
    created_at: string;
  };
  let lead: LeadRow | null = null;
  if (body.registrationId) {
    const { data } = await admin
      .from("edp_registrations")
      .update({
        name,
        email,
        phone,
        message,
        cohort_id: cohort?.id ?? null,
      })
      .eq("id", body.registrationId)
      .neq("payment_status", "paid")
      .select("id, razorpay_order_id, amount_inr, created_at")
      .maybeSingle();
    lead = data;
  }
  if (!lead) {
    const { data, error } = await admin
      .from("edp_registrations")
      .insert({
        name,
        email,
        phone,
        message,
        cohort_id: cohort?.id ?? null,
      })
      .select("id, razorpay_order_id, amount_inr, created_at")
      .single();
    if (error || !data) {
      logEvent("error", "edp_register.insert_failed", {
        reason: error?.message,
      });
      return NextResponse.json(
        { error: "Couldn't save your details. Please try again." },
        { status: 502 },
      );
    }
    lead = data;
  }

  // 5. Staff enquiry email — exactly once per lead (atomic claim), so payment
  //    retries don't re-notify. Released on send failure for a later retry.
  const { data: claimed } = await admin
    .from("edp_registrations")
    .update({ enquiry_email_sent_at: new Date().toISOString() })
    .eq("id", lead.id)
    .is("enquiry_email_sent_at", null)
    .select("id");
  if (claimed && claimed.length > 0) {
    const result = await sendEdpEnquiryEmail({
      registrationId: lead.id,
      name,
      email,
      phone,
      message,
      submittedAt: lead.created_at,
      cohortName: cohort?.name ?? null,
      paymentStatus: paymentOpen
        ? "Pending — Razorpay checkout opened, not completed yet"
        : "Not started — registration is not open",
    });
    if (!result.sent) {
      await admin
        .from("edp_registrations")
        .update({ enquiry_email_sent_at: null })
        .eq("id", lead.id);
    }
  }

  logEvent("info", "edp_register.lead_saved", {
    registrationId: lead.id,
    paymentOpen,
  });

  // 6. No open cohort → lead-only success; the form shows a "we'll be in
  //    touch" confirmation instead of opening a checkout that can't work.
  if (!paymentOpen || !cohort) {
    return NextResponse.json({
      ok: true,
      leadOnly: true,
      registrationId: lead.id,
    });
  }

  // 7. Razorpay order at the server price. Reuse this lead's open order when
  //    the price hasn't changed (dismiss → retry), else create a fresh one.
  let orderId =
    lead.razorpay_order_id && lead.amount_inr === cohort.price_inr
      ? lead.razorpay_order_id
      : null;
  if (!orderId) {
    try {
      const order = await razorpayClient().orders.create({
        amount: cohort.price_inr, // paise — straight from the DB
        currency: "INR",
        notes: {
          source: "edp",
          edp_registration_id: lead.id,
          cohort_id: cohort.id,
        },
      });
      orderId = order.id;
    } catch {
      logEvent("error", "edp_register.order_create_failed", {
        registrationId: lead.id,
      });
      return NextResponse.json(
        {
          error:
            "Your details are saved, but we couldn't start the payment. Please try again in a moment.",
          registrationId: lead.id,
        },
        { status: 502 },
      );
    }
  }

  // Stamp the order + authoritative amount on the lead (this is what the
  // verify route and webhook match against), and re-arm a failed attempt.
  const { error: stampError } = await admin
    .from("edp_registrations")
    .update({
      razorpay_order_id: orderId,
      amount_inr: cohort.price_inr,
      payment_status: "pending",
    })
    .eq("id", lead.id);
  if (stampError) {
    // Without the stamp, a captured payment couldn't be matched — abort.
    logEvent("error", "edp_register.order_stamp_failed", {
      registrationId: lead.id,
      orderId,
    });
    return NextResponse.json(
      {
        error:
          "Your details are saved, but we couldn't start the payment. Please try again in a moment.",
        registrationId: lead.id,
      },
      { status: 502 },
    );
  }

  logEvent("info", "edp_register.order_ready", {
    registrationId: lead.id,
    orderId,
  });

  return NextResponse.json({
    ok: true,
    leadOnly: false,
    registrationId: lead.id,
    orderId,
    amount: cohort.price_inr,
    currency: "INR",
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    cohortName: cohort.name,
  });
}
