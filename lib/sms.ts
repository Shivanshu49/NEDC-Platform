import "server-only";
import { logEvent } from "@/lib/log";

/**
 * SMS confirmation hook — PLANNED, not yet wired to a provider.
 *
 * Phase A leaves a clean seam so a provider (MSG91 / Twilio / Gupshup / etc.)
 * can be dropped in later without touching the webhook. Today it's a safe no-op
 * that just logs intent — it never throws and never blocks enrollment.
 *
 * To enable later: implement the provider call here (read its API key from a
 * server-only env var, e.g. SMS_API_KEY), and the existing call site in the
 * Razorpay webhook will start sending automatically.
 */
export async function sendEnrollmentSms(params: {
  phone: string | null;
  cohortName: string;
}): Promise<{ sent: boolean }> {
  if (!process.env.SMS_API_KEY) {
    // Not configured — planned feature. Don't crash the webhook.
    return { sent: false };
  }
  if (!params.phone) return { sent: false };

  // TODO(Phase B): call the SMS provider here, e.g.
  //   await fetch(provider, { method: "POST", body: ... })
  // For now, just record intent so logs show it would have fired.
  logEvent("info", "sms.enrollment_planned", { cohortName: params.cohortName });
  return { sent: false };
}
