import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Landmark,
  ShieldCheck,
  Users,
  Video,
  Wifi,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { Logo } from "@/components/Logo";
import { PricingPlans } from "@/components/PricingPlans";
import { SectionHeading } from "@/components/SectionHeading";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { WhatsappIcon } from "@/components/BrandIcons";
import { Certification } from "@/components/sections/Certification";
import { FAQS } from "@/components/sections/FaqSection";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { EDP_CURRICULUM, CONTACT } from "@/lib/content";
import { formatDate, formatDateRange, formatTimeRange } from "@/lib/format";
import {
  getFeaturedProgram,
  pickNextCohort,
  registrationState,
  REGISTRATION_BADGE,
} from "@/lib/queries";

/*
 * TODO(meta-pixel): No Meta Pixel is installed anywhere in this codebase yet.
 * When the sitewide pixel is added (separate work), it must also:
 *   1. fire PageView on this page,
 *   2. track the WhatsApp CTA clicks (the floating WhatsAppButton and the
 *      footer WhatsApp link below), and
 *   3. track Razorpay checkout start inside EnrollButton's handleEnroll
 *      (e.g. InitiateCheckout), matching the event-naming convention the
 *      pixel setup uses elsewhere.
 */

/**
 * /edp — stripped-down landing page for PAID ad traffic (Meta "Sales"
 * campaign). One job: convert. No site nav, no scheme widget, no outbound
 * links, minimal footer. Lives OUTSIDE the (marketing) route group so it does
 * not inherit the Navbar/Footer chrome. Reuses the site's tokens, components,
 * and the real Razorpay checkout (PricingPlans → EnrollButton → /api/checkout).
 */

export const revalidate = 300;

// Metadata derives the start date from the DB like the page body does (same
// campaign-date fallback), so link previews never promise a stale date. OG and
// Twitter are overridden too: the root layout's static copy still says
// "Registrations opening soon", and Meta scrapes og:description for the ad's
// link preview — paid traffic must never be told to wait.
export async function generateMetadata(): Promise<Metadata> {
  const featured = await getFeaturedProgram();
  const nextCohort = featured ? pickNextCohort(featured.cohorts) : null;
  const startLabel = nextCohort
    ? formatDate(nextCohort.start_date)
    : "27 July 2026";
  const title = "5-Day Entrepreneurship Development Program (EDP)";
  const description = `Stop searching for a job. Learn to create one. NEDC's 5-day mentor-led EDP, live online, with government scheme guidance and a Certificate of Completion. Cohort starts ${startLabel}.`;
  return {
    title,
    description,
    openGraph: {
      type: "website",
      siteName: "NEDC, National Entrepreneurship Development Center",
      title,
      description,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

// Fractal-noise grain (data-URI SVG) — same film as the home page's navy bands.
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

// Condensed "what you get" — distilled from the home page's Why NEDC section
// and the Basic plan inclusions (lib/plans.ts). The schemes line is the ONLY
// place government schemes appear: one line of text, deliberately no links out.
const WHAT_YOU_GET: { Icon: LucideIcon; accent?: boolean; title: string; body: string }[] = [
  {
    Icon: Video,
    title: "Live mentor-led sessions, all 5 days",
    body: "Learn directly from mentors in live online sessions, with every session recorded for you to rewatch.",
  },
  {
    Icon: Wrench,
    title: "Practical business skills",
    body: "Business planning, finance basics, and marketing, with templates and worksheets you apply to your own idea.",
  },
  {
    Icon: Landmark,
    title: "Government scheme guidance",
    body: "Plain-language guidance on funding routes like PMEGP, MUDRA, and MSME support, from mentors who work with them.",
  },
  {
    Icon: BadgeCheck,
    accent: true,
    title: "Certificate of Completion by NEDC",
    body: "Finish the program and receive a certificate you can share on LinkedIn or add to your CV.",
  },
];

// Mentor credibility strip — short, one-line credentials (full bios live on the
// main site). Photos are the same optimized local assets the site already uses.
const MENTORS: { name: string; role: string; credential: string; photo: string }[] = [
  {
    name: "Satish Kumar Shervan",
    role: "Mentor",
    credential:
      "Ex-Chief Manager, Punjab National Bank. 30+ years across credit, export-import finance, and credit-risk rating.",
    photo: "/speakers/satish-kumar-shervan.jpg",
  },
  {
    name: "Ravi Gupta",
    role: "Mentor",
    credential:
      "MSME Growth Strategist. Has trained 1.75 lakh+ people across 500+ institutions.",
    photo: "/speakers/ravi-gupta.jpg",
  },
  {
    name: "Dr. Bipin Kumar Srivastava",
    role: "Organiser",
    credential:
      "Founder of NEDC. Professor & Dean, Students' Welfare, Galgotias College of Engineering & Technology. PhD, 25+ years.",
    photo: "/organiser/bipin-kumar-srivastava.jpg",
  },
];

// The conversion-relevant subset of the site FAQ (same answers, no drift).
const FAQ_QUESTIONS = new Set([
  "What do I get, and is there a certificate?",
  "Is it fully online?",
  "How do I pay, and is it secure?",
  "What's the refund policy?",
]);

export default async function EdpLandingPage() {
  const featured = await getFeaturedProgram();
  const nextCohort = featured ? pickNextCohort(featured.cohorts) : null;
  const regState = registrationState(nextCohort);
  const registrationOpen = regState === "open";
  // The campaign promises 27 July; fall back to the campaign dates if the DB
  // is unreachable so the page never contradicts the ad.
  const dateLabel = nextCohort
    ? formatDateRange(nextCohort.start_date, nextCohort.end_date)
    : "27 to 31 July 2026";
  const startLabel = nextCohort ? formatDate(nextCohort.start_date) : "27 July 2026";
  const timeLabel = nextCohort
    ? formatTimeRange(nextCohort.daily_start_time, nextCohort.daily_end_time)
    : "6:30 PM to 8:30 PM";
  const faqs = FAQS.filter((f) => FAQ_QUESTIONS.has(f.question));
  const year = new Date().getFullYear();

  const whatsappHref = `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(
    "Hi NEDC, I'd like to know more about the EDP program.",
  )}`;

  return (
    <>
      {/* ---------- Minimal header: logo → home, nothing else to leak to ---------- */}
      <header className="border-b border-border bg-background">
        <Container className="flex h-16 items-center justify-between">
          <Logo withWordmark href="/" className="h-9 w-auto" wordmarkClassName="text-lg" />
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground sm:text-sm">
            <CalendarDays className="size-4 text-primary" aria-hidden />
            Starts <span className="font-semibold text-primary">{startLabel}</span>
          </span>
        </Container>
      </header>

      <main>
        {/* ================= 1. HERO ================= */}
        <section className="relative overflow-hidden bg-background">
          <div
            aria-hidden
            className="bg-dot-grid mask-fade-edges pointer-events-none absolute inset-0 opacity-60"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 -top-24 size-[26rem] rounded-full bg-panel blur-3xl"
          />

          <Container className="relative py-14 sm:py-20">
            <div className="mx-auto max-w-2xl text-center">
              <Badge
                variant="default"
                className="border border-primary/15 px-3 py-1 text-[13px] font-semibold"
              >
                <span className="relative flex size-2" aria-hidden>
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand opacity-70 motion-reduce:hidden" />
                  <span className="relative inline-flex size-2 rounded-full bg-brand" />
                </span>
                {REGISTRATION_BADGE[regState]}
              </Badge>

              <h1 className="font-display mt-6 text-balance text-hero font-extrabold leading-[1.05] tracking-tight text-primary">
                Stop searching for a job. Learn to{" "}
                <span className="relative inline-block whitespace-nowrap">
                  create one.
                  {/* the site's signature hand-drawn maroon underline */}
                  <svg
                    aria-hidden
                    viewBox="0 0 200 14"
                    preserveAspectRatio="none"
                    className="absolute -bottom-1.5 left-0 h-[0.35em] w-full text-brand/45"
                  >
                    <path
                      d="M3 9 C 55 3, 140 3, 197 7"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="5"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </h1>

              <p className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground">
                NEDC&apos;s 5-day Entrepreneurship Development Program: live,
                mentor-led online sessions that take you from idea to a real
                business plan, with a Certificate of Completion by NEDC.
              </p>

              <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                <Button
                  href="#register"
                  variant="primary"
                  size="lg"
                  className="group w-full shadow-soft hover:-translate-y-0.5 sm:w-auto"
                >
                  Enroll now
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </Button>
              </div>
              <p className="mt-4 text-sm font-medium text-brand">
                Starts {startLabel} · Limited seats per cohort
              </p>

              {/* trust strip */}
              <ul className="mt-9 flex flex-wrap justify-center gap-x-5 gap-y-3 border-t border-border pt-6">
                {[
                  { label: "5-day program", Icon: CalendarDays },
                  { label: "100% Online / Hybrid", Icon: Wifi },
                  { label: "Mentor-led", Icon: Users },
                  { label: "Certificate by NEDC", Icon: BadgeCheck },
                ].map(({ label, Icon }) => (
                  <li
                    key={label}
                    className="inline-flex items-center gap-2 text-sm font-medium text-foreground"
                  >
                    <Icon className="size-4 shrink-0 text-primary" aria-hidden />
                    {label}
                  </li>
                ))}
              </ul>
            </div>
          </Container>
        </section>

        {/* ================= 2. WHAT YOU GET ================= */}
        <section className="border-y border-border bg-panel/50 py-14 sm:py-20">
          <Container>
            <SectionHeading
              center
              eyebrow="What you get"
              title="Five days that change how you think about work"
            />
            <ul className="mx-auto mt-10 grid max-w-4xl gap-6 sm:grid-cols-2">
              {WHAT_YOU_GET.map(({ Icon, accent, title, body }) => (
                <li
                  key={title}
                  className="flex gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft"
                >
                  <span
                    aria-hidden
                    className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${
                      accent ? "bg-brand/10 text-brand" : "bg-primary/10 text-primary"
                    }`}
                  >
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <h3 className="font-display text-base font-bold leading-snug text-foreground">
                      {title}
                    </h3>
                    <p className="mt-1.5 text-pretty text-sm leading-relaxed text-muted-foreground">
                      {body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Container>
        </section>

        {/* ================= 3. THE 5-DAY PLAN (titles only) ================= */}
        <section className="py-14 sm:py-20">
          <Container>
            <SectionHeading
              center
              eyebrow="The 5-day plan"
              title="One focused week, day by day"
            />
            <ol className="mx-auto mt-10 max-w-2xl overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
              {EDP_CURRICULUM.map(({ day, theme }) => (
                <li
                  key={day}
                  className="flex items-center gap-4 border-b border-border px-5 py-4 last:border-b-0 sm:px-7"
                >
                  <span
                    aria-hidden
                    className="font-display flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-extrabold tabular-nums text-primary"
                  >
                    {day}
                  </span>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                      Day {day}
                    </p>
                    <p className="font-display text-base font-bold text-foreground">
                      {theme}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mx-auto mt-6 max-w-2xl text-center text-sm text-muted-foreground">
              Two live one-hour sessions each day, held online
              {timeLabel ? `, ${timeLabel} IST` : ""}. {dateLabel}.
            </p>
          </Container>
        </section>

        {/* ================= 4. MENTORS ================= */}
        <section className="border-y border-border bg-panel/50 py-14 sm:py-20">
          <Container>
            <SectionHeading
              center
              eyebrow="Your mentors"
              title="Learn from people who fund and build businesses"
            />
            <ul className="mx-auto mt-10 grid max-w-4xl gap-5 sm:grid-cols-3">
              {MENTORS.map(({ name, role, credential, photo }) => (
                <li
                  key={name}
                  className="flex gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft sm:flex-col"
                >
                  <Image
                    src={photo}
                    alt={name}
                    width={160}
                    height={160}
                    sizes="(min-width: 640px) 10rem, 5rem"
                    className="size-20 shrink-0 rounded-2xl object-cover object-top sm:size-28"
                  />
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand">
                      {role}
                    </p>
                    <h3 className="font-display mt-0.5 text-base font-bold text-foreground">
                      {name}
                    </h3>
                    <p className="mt-1.5 text-pretty text-sm leading-relaxed text-muted-foreground">
                      {credential}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Container>
        </section>

        {/* ================= 5. PRICING (real Razorpay checkout) ================= */}
        <section id="register" className="scroll-mt-24 py-14 sm:py-20">
          <Container>
            <SectionHeading
              center
              eyebrow="Registration"
              title="Enroll in the Advance Certificate Course"
              subtitle="One complete program, one price. Live mentor-led sessions, personal 1-on-1 mentorship, and a Certificate of Completion by NEDC. Pay once for your cohort; no subscriptions."
            />

            <div className="mt-10">
              {/* Keeps the heading outline h2 → h3 (the card renders an h3 name). */}
              <PricingPlans
                basicPriceInr={nextCohort?.price_inr}
                dateLabel={dateLabel}
                timeLabel={timeLabel ?? undefined}
                cohortId={registrationOpen ? nextCohort!.id : undefined}
                cohortName={registrationOpen ? nextCohort!.name : undefined}
                registrationClosed={regState === "closed"}
              />
            </div>

            {/* Trust: secure payment + the REAL refund terms, linked, not invented. */}
            <div className="mx-auto mt-8 max-w-2xl space-y-3 text-center">
              <p className="flex items-start justify-center gap-2 text-xs leading-relaxed text-muted-foreground">
                <ShieldCheck aria-hidden className="mt-0.5 size-4 flex-none text-success" />
                <span className="text-balance">
                  Secure payment via Razorpay · UPI, cards &amp; net banking ·
                  Instant confirmation by email.
                </span>
              </p>
              <p className="text-pretty text-xs leading-relaxed text-muted-foreground">
                Cancel at least 7 days before the start date for a full refund,
                or before the program begins for a 50% refund. Read the full{" "}
                <Link
                  href="/refund"
                  className="rounded-sm font-medium text-brand underline underline-offset-2 hover:text-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Refund &amp; Cancellation Policy
                </Link>
                .
              </p>
            </div>
          </Container>
        </section>

        {/* ================= 6. CERTIFICATE (reused site section) ================= */}
        <Certification />

        {/* ================= 7. FAQ (trimmed, same answers as the site) ================= */}
        <section className="border-y border-border bg-secondary/40 py-14 sm:py-20">
          <Container>
            <SectionHeading center eyebrow="FAQ" title="Quick answers" />
            <div className="mx-auto mt-10 max-w-2xl overflow-hidden rounded-2xl border border-border bg-card px-5 shadow-soft sm:px-7">
              <Accordion type="single" collapsible>
                {faqs.map((faq) => (
                  <AccordionItem key={faq.question} value={faq.question}>
                    <AccordionTrigger className="text-base text-foreground">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-base">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </Container>
        </section>

        {/* ================= 8. FINAL CTA ================= */}
        <section className="py-14 sm:py-20">
          <Container>
            <div
              className="relative overflow-hidden rounded-4xl px-6 py-14 text-center text-primary-foreground shadow-float sm:px-12 sm:py-16"
              style={{ background: "var(--gradient-hero)" }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-[0.22] mix-blend-soft-light"
                style={{ backgroundImage: GRAIN }}
              />
              <div
                aria-hidden
                className="bg-dot-grid-light mask-fade-edges pointer-events-none absolute inset-0 opacity-40"
              />
              <div className="relative">
                <h2 className="font-display text-balance text-fluid-h2 font-bold tracking-tight">
                  Your business idea deserves 5 days.
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-pretty text-primary-foreground/80">
                  Join the cohort starting {startLabel}. Live mentor-led
                  sessions, government scheme guidance, and a certificate to
                  show for it.
                </p>
                <div className="mt-8 flex justify-center">
                  <Button
                    href="#register"
                    variant="primary"
                    size="lg"
                    className="bg-card text-primary shadow-xl shadow-primary/25 hover:-translate-y-0.5 hover:bg-card/90"
                  >
                    Enroll now
                    <ArrowRight className="size-4" aria-hidden />
                  </Button>
                </div>
                <p className="mt-4 text-sm font-medium text-primary-foreground/80">
                  Limited seats per cohort
                </p>
              </div>
            </div>
          </Container>
        </section>
      </main>

      {/* ---------- Minimal footer: legal + WhatsApp only ---------- */}
      <footer className="border-t border-border bg-panel/40 py-8">
        <Container className="flex flex-col items-center gap-4 text-center text-sm text-muted-foreground">
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {[
              { href: "/terms", label: "Terms & Conditions" },
              { href: "/privacy", label: "Privacy Policy" },
              { href: "/refund", label: "Refund & Cancellation" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="transition-colors hover:text-primary"
              >
                {l.label}
              </Link>
            ))}
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-medium text-foreground transition-colors hover:text-primary"
            >
              <WhatsappIcon className="size-4 text-[#25D366]" aria-hidden />
              WhatsApp {CONTACT.phone}
            </a>
          </nav>
          <p>
            © {year} NEDC, National Entrepreneurship Development Center. All
            rights reserved.
          </p>
        </Container>
      </footer>

      {/* Persistent secondary CTA — the site's floating WhatsApp chat button. */}
      <WhatsAppButton />
    </>
  );
}
