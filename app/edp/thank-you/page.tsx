import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  MailCheck,
} from "lucide-react";

import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { OffsetCard } from "@/components/OffsetCard";
import { PurchasePixel } from "@/components/edp/PurchasePixel";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { WhatsappIcon } from "@/components/BrandIcons";
import { CONTACT } from "@/lib/content";
import { formatDateRange, formatINR } from "@/lib/format";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { EdpRegistration } from "@/lib/types";
import { uuid } from "@/lib/validation";

/**
 * /edp/thank-you — the landing spot AFTER a Razorpay payment whose signature
 * was verified server-side (/api/edp/verify). Reads the registration by the
 * `ref` query param (a uuid only the payer was handed) and shows the receipt,
 * reference, and what happens next.
 *
 * Deliberately forgiving: with a pending row (webhook still in flight) it says
 * "confirming", and with no/unknown ref it still confirms the registration was
 * received rather than bouncing a paying customer back to the pitch.
 */

export const metadata: Metadata = {
  title: "Registration confirmed",
  description:
    "Your NEDC EDP registration is confirmed. Check your email for the receipt and next steps.",
  // A post-payment page — never something search engines should index.
  robots: { index: false, follow: false },
};

async function getRegistration(ref: string | undefined) {
  if (!ref || !uuid.safeParse(ref).success) return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || url.includes("placeholder.supabase.co")) return null;

  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("edp_registrations")
    .select("*")
    .eq("id", ref)
    .maybeSingle();
  const registration = (data as EdpRegistration | null) ?? null;
  if (!registration) return null;

  let dateLabel: string | null = null;
  let cohortName: string | null = null;
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
  return { registration, cohortName, dateLabel };
}

export default async function EdpThankYouPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;
  const found = await getRegistration(ref);
  const registration = found?.registration ?? null;
  const paid = registration?.payment_status === "paid";
  const firstName = registration?.name.split(" ")[0];

  const whatsappHref = `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(
    "Hi NEDC, I just registered for the EDP program and have a question.",
  )}`;

  const steps: { Icon: typeof MailCheck; title: string; body: string }[] = [
    {
      Icon: MailCheck,
      title: "Check your inbox",
      body: paid
        ? `Your receipt and confirmation email are on their way to ${registration!.email}.`
        : "Your confirmation email (with the receipt) arrives as soon as the payment is confirmed — usually within a minute.",
    },
    {
      Icon: CalendarCheck,
      title: "We add you to the cohort",
      body: `Our team confirms your seat and emails the session schedule and live joining links before Day 1${
        found?.dateLabel ? ` (${found.dateLabel})` : ""
      }.`,
    },
    {
      Icon: BadgeCheck,
      title: "Show up and build",
      body: "Join the live mentor-led sessions, bring your business idea, and finish with your Certificate of Completion by NEDC.",
    },
  ];

  return (
    <>
      {/* Meta Pixel Purchase — only for a confirmed-paid ref (never pending or
          unknown); the component itself guarantees once-per-payment. */}
      {registration && paid && typeof registration.amount_inr === "number" && (
        <PurchasePixel
          registrationId={registration.id}
          amountPaise={registration.amount_inr}
        />
      )}
      <main className="relative overflow-hidden bg-background">
        <div
          aria-hidden
          className="bg-dot-grid mask-fade-edges pointer-events-none absolute inset-0 opacity-60"
        />
        <Container className="relative py-14 sm:py-20">
          <div className="mx-auto max-w-2xl">
            {/* ---------- Confirmation ---------- */}
            <div className="text-center">
              <span
                aria-hidden
                className="inline-flex size-16 items-center justify-center rounded-full bg-success/10 ring-8 ring-success/5"
              >
                {paid || !registration ? (
                  <CheckCircle2 className="size-9 text-success" />
                ) : (
                  <Clock3 className="size-9 text-success" />
                )}
              </span>
              <h1 className="font-display mt-6 text-balance text-fluid-h2 font-extrabold tracking-tight text-primary">
                {paid
                  ? `You're registered${firstName ? `, ${firstName}` : ""}!`
                  : registration
                    ? "Almost there — confirming your payment"
                    : "Registration received"}
              </h1>
              <p className="mx-auto mt-4 max-w-lg text-pretty leading-relaxed text-muted-foreground">
                {paid
                  ? "Your payment is confirmed and your seat is reserved. Welcome to the program — here's what happens next."
                  : registration
                    ? "Your registration is saved and Razorpay is finalizing the payment. This page's email confirmation follows within a few minutes — no action needed."
                    : "Your registration has been recorded. If you completed the payment, your confirmation email and receipt are on their way."}
              </p>
            </div>

            {/* ---------- Reference / receipt ---------- */}
            {registration && (
              <OffsetCard className="mt-10">
                <dl className="grid gap-x-6 gap-y-4 p-6 sm:grid-cols-2 sm:p-7">
                  <div>
                    <dt className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                      Registration reference
                    </dt>
                    <dd className="font-display mt-1 text-base font-bold tracking-wide text-foreground">
                      NEDC-EDP-{registration.id.slice(0, 8).toUpperCase()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                      Payment
                    </dt>
                    <dd className="mt-1 text-sm font-medium text-foreground">
                      {paid ? (
                        <>
                          {typeof registration.amount_inr === "number"
                            ? `${formatINR(registration.amount_inr)} · `
                            : ""}
                          <span className="text-success">Paid</span>
                        </>
                      ) : (
                        <span className="text-muted-foreground">
                          Confirming with Razorpay…
                        </span>
                      )}
                    </dd>
                  </div>
                  {(found?.cohortName || registration.razorpay_payment_id) && (
                    <>
                      {found?.cohortName && (
                        <div>
                          <dt className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                            Program
                          </dt>
                          <dd className="mt-1 text-sm font-medium text-foreground">
                            {found.cohortName}
                            {found.dateLabel ? ` · ${found.dateLabel}` : ""}
                          </dd>
                        </div>
                      )}
                      {registration.razorpay_payment_id && (
                        <div>
                          <dt className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                            Razorpay payment ID
                          </dt>
                          <dd className="mt-1 break-all text-sm font-medium text-foreground">
                            {registration.razorpay_payment_id}
                          </dd>
                        </div>
                      )}
                    </>
                  )}
                </dl>
              </OffsetCard>
            )}

            {/* ---------- What happens next ---------- */}
            <h2 className="font-display mt-12 text-center text-xl font-bold tracking-tight text-foreground">
              What happens next
            </h2>
            <ol className="mt-6 space-y-4">
              {steps.map(({ Icon, title, body }, i) => (
                <li
                  key={title}
                  className="flex gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft"
                >
                  <span
                    aria-hidden
                    className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
                  >
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                      Step {i + 1}
                    </p>
                    <h3 className="font-display text-base font-bold text-foreground">
                      {title}
                    </h3>
                    <p className="mt-1 text-pretty text-sm leading-relaxed text-muted-foreground">
                      {body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            {/* ---------- Support + back to the site ---------- */}
            <p className="mt-8 text-center text-sm leading-relaxed text-muted-foreground">
              Didn&apos;t get an email within 10 minutes, or paid but see
              &ldquo;confirming&rdquo;? Message us on{" "}
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-sm font-medium text-foreground underline underline-offset-2 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <WhatsappIcon className="size-3.5 text-[#25D366]" aria-hidden />
                WhatsApp
              </a>{" "}
              or email{" "}
              <a
                href={`mailto:${CONTACT.email}`}
                className="rounded-sm font-medium text-brand underline underline-offset-2 hover:text-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {CONTACT.email}
              </a>
              .
            </p>

            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <Button href="/" variant="primary" size="lg" className="group">
                Back to the NEDC website
                <ArrowRight
                  className="size-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </Button>
              <Button href="/edp" variant="secondary" size="lg">
                Program details
              </Button>
            </div>
            <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">
              Changed your mind? Our{" "}
              <Link
                href="/refund"
                className="rounded-sm font-medium underline underline-offset-2 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Refund &amp; Cancellation Policy
              </Link>{" "}
              has you covered.
            </p>
          </div>
        </Container>
      </main>

      <WhatsAppButton />
    </>
  );
}
