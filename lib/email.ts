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
    subject: `You're enrolled — ${params.cohortName}`,
    html,
  });
  if (error) {
    logEvent("error", "email.send_failed", { reason: String(error) });
    return { sent: false as const };
  }
  return { sent: true as const };
}
