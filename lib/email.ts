import "server-only"; // never bundle the Resend API key into client code
import { Resend } from "resend";
import { formatINR } from "@/lib/format";
import { logEvent } from "@/lib/log";

type SessionLink = {
  title: string;
  starts_at: string;
  zoom_join_url: string | null;
};

/** Escape a value for safe interpolation into HTML text/attributes. */
function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Only allow http(s) links in the email; anything else becomes inert text. */
function safeHref(url: string | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.protocol === "http:" || u.protocol === "https:") return u.toString();
  } catch {
    /* not a URL */
  }
  return null;
}

/**
 * Send the enrollment confirmation: a receipt + a link to the dashboard, plus
 * any live-session Zoom links we already have. Called by the Razorpay webhook
 * after a successful payment.
 *
 * All interpolated values are HTML-escaped (and links scheme-checked) so a
 * stray/malicious DB value can't inject markup into the email.
 */
export async function sendEnrollmentEmail(params: {
  to: string;
  cohortName: string;
  amountInr: number; // paise
  razorpayPaymentId: string | null;
  sessions: SessionLink[];
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  if (!apiKey || !from) {
    // Not configured yet — don't crash the webhook; just report we didn't send.
    logEvent("warn", "email.not_configured", {});
    return { sent: false as const };
  }

  const resend = new Resend(apiKey);

  const sessionRows = params.sessions
    .map((s) => {
      const when = new Date(s.starts_at).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Kolkata",
      });
      const href = safeHref(s.zoom_join_url);
      const link = href
        ? `<a href="${esc(href)}">Join link</a>`
        : "Link coming soon";
      return `<tr><td style="padding:4px 8px">${esc(s.title)}</td><td style="padding:4px 8px">${esc(when)} IST</td><td style="padding:4px 8px">${link}</td></tr>`;
    })
    .join("");

  const html = `
  <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#0f172a">
    <h2>You're enrolled! 🎉</h2>
    <p>Thanks for joining <strong>${esc(params.cohortName)}</strong>.</p>
    <p><strong>Receipt:</strong> ${esc(formatINR(params.amountInr))}${
      params.razorpayPaymentId
        ? ` · Payment ID ${esc(params.razorpayPaymentId)}`
        : ""
    }</p>
    <p>Open your dashboard for the full schedule and live links:</p>
    <p><a href="${esc(siteUrl)}/dashboard" style="background:#4f46e5;color:#fff;padding:10px 18px;border-radius:9999px;text-decoration:none;display:inline-block">Go to my dashboard</a></p>
    ${
      sessionRows
        ? `<h3>Your live sessions</h3><table style="border-collapse:collapse;font-size:14px">${sessionRows}</table>`
        : ""
    }
    <p style="color:#64748b;font-size:13px;margin-top:24px">See you in class,<br/>The NEDC team</p>
  </div>`;

  const { error } = await resend.emails.send({
    from,
    to: params.to,
    subject: `You're enrolled in ${params.cohortName}`,
    html,
  });
  if (error) {
    logEvent("error", "email.send_failed", { reason: String(error) });
    return { sent: false as const };
  }
  return { sent: true as const };
}

/* ============================================================================
 * /edp landing-page emails (guest registration + payment funnel)
 * ==========================================================================*/

/** Resend client + verified sender, or null when email isn't configured yet. */
function emailClient(): { resend: Resend; from: string } | null {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    logEvent("warn", "email.not_configured", {});
    return null;
  }
  return { resend: new Resend(apiKey), from };
}

/**
 * Where /edp enquiry + payment notifications go. Comma-separated addresses in
 * the EDP_NOTIFY_EMAILS env var (e.g. "info@nedc.co.in,ppc@example.com") —
 * recipients live in config, never in code.
 */
function edpNotifyRecipients(): string[] {
  return (process.env.EDP_NOTIFY_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter((e) => e.includes("@"));
}

/** "10 Aug 2026, 6:42 pm IST" — staff-friendly timestamp for notifications. */
function istTime(iso: string): string {
  return `${new Date(iso).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  })} IST`;
}

/** Table row for the lead-details block in staff notifications. */
function detailRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:6px 12px 6px 0;color:#64748b;font-size:13px;white-space:nowrap;vertical-align:top">${esc(label)}</td>
    <td style="padding:6px 0;font-size:14px;color:#0f172a">${esc(value)}</td>
  </tr>`;
}

type EdpLeadDetails = {
  registrationId: string;
  name: string;
  email: string;
  phone: string;
  message: string | null;
  /** ISO timestamp of the original form submission. */
  submittedAt: string;
  cohortName: string | null;
};

/** The shared lead-details table used by both staff notifications. */
function edpLeadTable(
  lead: EdpLeadDetails,
  extraRows: string,
  paymentStatus: string,
): string {
  return `<table style="border-collapse:collapse">
    ${detailRow("Name", lead.name)}
    ${detailRow("Email", lead.email)}
    ${detailRow("Phone", `+91 ${lead.phone}`)}
    ${detailRow("Message", lead.message?.trim() ? lead.message : "—")}
    ${detailRow("Submitted", istTime(lead.submittedAt))}
    ${lead.cohortName ? detailRow("Cohort", lead.cohortName) : ""}
    ${extraRows}
    ${detailRow("Payment status", paymentStatus)}
    ${detailRow("Reference", lead.registrationId)}
  </table>`;
}

/**
 * Staff notification sent the moment the /edp form is submitted — BEFORE the
 * visitor reaches Razorpay, so the lead is never lost even if they abandon
 * payment. Sent once per lead (the route claims enquiry_email_sent_at).
 */
export async function sendEdpEnquiryEmail(
  lead: EdpLeadDetails & { paymentStatus: string },
) {
  const client = emailClient();
  const to = edpNotifyRecipients();
  if (!client) return { sent: false as const };
  if (to.length === 0) {
    logEvent("warn", "email.edp_recipients_missing", {});
    return { sent: false as const };
  }

  const html = `
  <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#0f172a">
    <h2 style="color:#0a2f6b">New EDP registration</h2>
    <p>Someone just registered through the <strong>/edp</strong> landing page.</p>
    ${edpLeadTable(lead, "", lead.paymentStatus)}
    <p style="color:#64748b;font-size:13px;margin-top:24px">
      If payment succeeds you'll get a second email; otherwise this lead is
      waiting in Supabase → Table Editor → edp_registrations.
    </p>
  </div>`;

  const { error } = await client.resend.emails.send({
    from: client.from,
    to,
    replyTo: lead.email,
    subject: `New EDP registration — ${lead.name}`,
    html,
  });
  if (error) {
    logEvent("error", "email.edp_enquiry_failed", { reason: String(error) });
    return { sent: false as const };
  }
  return { sent: true as const };
}

/**
 * Staff notification after Razorpay CONFIRMS the payment (verify route or
 * webhook, whichever lands first — the send is claimed atomically).
 */
export async function sendEdpPaymentNotificationEmail(
  lead: EdpLeadDetails & {
    amountInr: number; // paise
    razorpayPaymentId: string | null;
    paidAt: string;
  },
) {
  const client = emailClient();
  const to = edpNotifyRecipients();
  if (!client) return { sent: false as const };
  if (to.length === 0) {
    logEvent("warn", "email.edp_recipients_missing", {});
    return { sent: false as const };
  }

  const extra =
    detailRow("Amount", formatINR(lead.amountInr)) +
    detailRow("Paid at", istTime(lead.paidAt)) +
    (lead.razorpayPaymentId
      ? detailRow("Razorpay payment ID", lead.razorpayPaymentId)
      : "");

  const html = `
  <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#0f172a">
    <h2 style="color:#0a2f6b">EDP payment received ✅</h2>
    <p><strong>${esc(lead.name)}</strong> completed payment for the EDP program.</p>
    ${edpLeadTable(lead, extra, "Paid")}
    <p style="color:#64748b;font-size:13px;margin-top:24px">
      Next: add them to the cohort and share the joining details before Day 1.
    </p>
  </div>`;

  const { error } = await client.resend.emails.send({
    from: client.from,
    to,
    replyTo: lead.email,
    subject: `EDP payment received — ${lead.name} · ${formatINR(lead.amountInr)}`,
    html,
  });
  if (error) {
    logEvent("error", "email.edp_payment_notify_failed", { reason: String(error) });
    return { sent: false as const };
  }
  return { sent: true as const };
}

/**
 * The registrant's own confirmation — receipt + what happens next. Sent after
 * the payment is verified (never on mere form submission).
 */
export async function sendEdpRegistrationConfirmationEmail(params: {
  to: string;
  name: string;
  cohortName: string;
  /** e.g. "24 to 29 August 2026" — omitted from the email when unknown. */
  dateLabel: string | null;
  amountInr: number; // paise
  razorpayPaymentId: string | null;
  registrationId: string;
}) {
  const client = emailClient();
  if (!client) return { sent: false as const };
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const html = `
  <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#0f172a">
    <h2 style="color:#0a2f6b">You're registered! 🎉</h2>
    <p>Hi ${esc(params.name.split(" ")[0] ?? params.name)},</p>
    <p>
      Your payment is confirmed and your seat in
      <strong>${esc(params.cohortName)}</strong>${
        params.dateLabel ? ` (${esc(params.dateLabel)})` : ""
      } is reserved.
    </p>
    <p style="background:#f1f5f9;border-radius:12px;padding:12px 16px">
      <strong>Receipt:</strong> ${esc(formatINR(params.amountInr))}${
        params.razorpayPaymentId
          ? ` · Payment ID ${esc(params.razorpayPaymentId)}`
          : ""
      }<br/>
      <strong>Registration reference:</strong> ${esc(params.registrationId)}
    </p>
    <p><strong>What happens next</strong></p>
    <ol style="padding-left:20px;line-height:1.7;font-size:14px">
      <li>Our team confirms your seat and adds you to the cohort.</li>
      <li>You receive the session schedule and live joining links by email before Day&nbsp;1.</li>
      <li>Join the live sessions — and bring your business idea.</li>
    </ol>
    <p style="color:#64748b;font-size:13px;margin-top:24px">
      Questions? Just reply to this email.<br/>
      See you in class,<br/>The NEDC team · <a href="${esc(siteUrl)}" style="color:#8b1538">nedc.co.in</a>
    </p>
  </div>`;

  const { error } = await client.resend.emails.send({
    from: client.from,
    to: params.to,
    subject: `You're registered — ${params.cohortName}`,
    html,
  });
  if (error) {
    logEvent("error", "email.edp_confirmation_failed", { reason: String(error) });
    return { sent: false as const };
  }
  return { sent: true as const };
}
