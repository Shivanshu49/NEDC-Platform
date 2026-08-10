import "server-only";

import {
  sendEdpPaymentNotificationEmail,
  sendEdpRegistrationConfirmationEmail,
} from "@/lib/email";
import { formatDateRange } from "@/lib/format";
import { logEvent } from "@/lib/log";
import type { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { EdpRegistration } from "@/lib/types";

type AdminClient = ReturnType<typeof createSupabaseAdminClient>;

/**
 * Mark a guest /edp registration as PAID and send the confirmation emails.
 *
 * Called from BOTH confirmation paths — /api/edp/verify (the browser's
 * signature-checked success handler, for the instant redirect) and the
 * Razorpay webhook (the reliable fallback when the browser never returns) —
 * so everything here must be idempotent:
 *
 *  - the status update is a no-op once the row is already 'paid';
 *  - the two confirmation emails (staff + registrant) are CLAIMED atomically
 *    via confirmation_email_sent_at, so concurrent/retried calls single-send.
 *
 * When `amountPaise` is provided (webhook path), it must equal the amount we
 * stamped on the lead at order creation — FAIL CLOSED on any mismatch. The
 * verify path omits it: a valid checkout signature already proves that OUR
 * order (whose amount the server set from the DB price) was the one paid.
 */
export async function markEdpRegistrationPaid(
  admin: AdminClient,
  params: {
    orderId: string;
    paymentId: string | null;
    amountPaise?: number;
  },
): Promise<{ registration: EdpRegistration | null }> {
  const { data } = await admin
    .from("edp_registrations")
    .select("*")
    .eq("razorpay_order_id", params.orderId)
    .maybeSingle();
  const registration = (data as EdpRegistration | null) ?? null;
  if (!registration) return { registration: null };

  if (
    typeof params.amountPaise === "number" &&
    params.amountPaise !== registration.amount_inr
  ) {
    logEvent("warn", "edp.amount_mismatch", {
      orderId: params.orderId,
      expected: registration.amount_inr,
      got: params.amountPaise,
    });
    return { registration: null };
  }

  if (registration.payment_status !== "paid") {
    await admin
      .from("edp_registrations")
      .update({
        payment_status: "paid",
        razorpay_payment_id:
          params.paymentId ?? registration.razorpay_payment_id,
      })
      .eq("id", registration.id);
    registration.payment_status = "paid";
    registration.razorpay_payment_id =
      params.paymentId ?? registration.razorpay_payment_id;
  }

  // Claim the confirmation sends atomically: only the caller that flips
  // confirmation_email_sent_at from null gets to send.
  const { data: claimed } = await admin
    .from("edp_registrations")
    .update({ confirmation_email_sent_at: new Date().toISOString() })
    .eq("id", registration.id)
    .is("confirmation_email_sent_at", null)
    .select("id");

  if (claimed && claimed.length > 0) {
    let cohortName = "NEDC Entrepreneurship Development Program (EDP)";
    let dateLabel: string | null = null;
    if (registration.cohort_id) {
      const { data: cohort } = await admin
        .from("cohorts")
        .select("name, start_date, end_date")
        .eq("id", registration.cohort_id)
        .maybeSingle();
      if (cohort) {
        cohortName = cohort.name;
        dateLabel = formatDateRange(cohort.start_date, cohort.end_date);
      }
    }

    const lead = {
      registrationId: registration.id,
      name: registration.name,
      email: registration.email,
      phone: registration.phone,
      message: registration.message,
      submittedAt: registration.created_at,
      cohortName,
    };
    const amountInr = registration.amount_inr ?? 0;

    await sendEdpPaymentNotificationEmail({
      ...lead,
      amountInr,
      razorpayPaymentId: registration.razorpay_payment_id,
      paidAt: new Date().toISOString(),
    });
    const userResult = await sendEdpRegistrationConfirmationEmail({
      to: registration.email,
      name: registration.name,
      cohortName,
      dateLabel,
      amountInr,
      razorpayPaymentId: registration.razorpay_payment_id,
      registrationId: registration.id,
    });

    // If the registrant's receipt didn't go out, release the claim so a
    // webhook retry re-sends it. Staff may then see a duplicate notification —
    // acceptable; the student's confirmation matters more.
    if (!userResult.sent) {
      await admin
        .from("edp_registrations")
        .update({ confirmation_email_sent_at: null })
        .eq("id", registration.id);
    }
  }

  return { registration };
}
