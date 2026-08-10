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

import { Container } from "@/components/Container";
import { PricingPlans } from "@/components/PricingPlans";
import { SectionHeading } from "@/components/SectionHeading";
import { EdpFloatingCtas } from "@/components/edp/EdpFloatingCtas";
import { EdpRegistrationForm } from "@/components/edp/EdpRegistrationForm";
import { ScrollToFormLink } from "@/components/edp/ScrollToFormLink";
import { Certification } from "@/components/sections/Certification";
import { FAQS } from "@/components/sections/FaqSection";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { EDP_CURRICULUM } from "@/lib/content";
import {
  formatDate,
  formatDateRange,
  formatINR,
  formatTimeRange,
} from "@/lib/format";
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
 *      footer WhatsApp link in app/edp/layout.tsx), and
 *   3. track checkout start inside EdpRegistrationForm's submit handler
 *      (e.g. Lead on /api/edp/register success + InitiateCheckout when the
 *      Razorpay modal opens), matching the event-naming convention the pixel
 *      setup uses elsewhere.
 */

/**
 * /edp — stripped-down landing page for PAID ad traffic (Meta "Sales"
 * campaign). One job: convert. Registration + payment is ONE continuous flow
 * that starts in the hero: a split layout with the pitch on the left and the
 * registration form on the right (form first on mobile). Submitting saves the
 * lead, emails the team, and opens Razorpay in place; success verifies the
 * signature server-side and lands on /edp/thank-you. No site nav, no scheme
 * widget, no outbound links, minimal footer (chrome lives in app/edp/layout).
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
    name: "S M Rounaque Mustafa",
    role: "Mentor",
    credential:
      "Startup coach, 25+ years. Set up 5 government Technology Business Incubators including IIM Lucknow and DTU, and incubated 1,000+ startups.",
    photo: "/speakers/s-m-rounaque-mustafa.jpg",
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
  const priceInr = nextCohort?.price_inr;
  const priceLabel =
    typeof priceInr === "number" && priceInr > 0 ? formatINR(priceInr) : undefined;
  const faqs = FAQS.filter((f) => FAQ_QUESTIONS.has(f.question));

  // The 3–4 short hero bullets: program, mode, certification, mentorship.
  const heroBenefits: { Icon: LucideIcon; accent?: boolean; title: string; body: string }[] = [
    {
      Icon: CalendarDays,
      title: "Advance Certificate Course",
      body: `5-day live EDP · ${dateLabel}`,
    },
    {
      Icon: Wifi,
      title: "100% online, hybrid-friendly",
      body: `Live sessions${timeLabel ? `, ${timeLabel} IST` : ""}, recorded to rewatch`,
    },
    {
      Icon: BadgeCheck,
      accent: true,
      title: "Certificate of Completion",
      body: "Issued by NEDC — share it on LinkedIn",
    },
    {
      Icon: Users,
      title: "1-on-1 mentorship",
      body: "Personal guidance and doubt-clearing sessions",
    },
  ];

  return (
    <>
      <main>
        {/* ============ 1. HERO — pitch left, registration form right ============
            The section itself is the #register anchor every enroll CTA (pricing
            card, final CTA, sticky button) smooth-scrolls back to. On mobile the
            order is: short heading → FORM → benefit bullets, so the form is
            reachable immediately without scrolling through the pitch. */}
        <section
          id="register"
          className="relative scroll-mt-4 overflow-hidden border-b border-border bg-background"
        >
          <div
            aria-hidden
            className="bg-dot-grid mask-fade-edges pointer-events-none absolute inset-0 opacity-60"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 -top-24 size-[26rem] rounded-full bg-panel blur-3xl"
          />

          <Container className="relative py-8 sm:py-12 lg:py-16">
            <div className="grid gap-x-12 gap-y-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,27rem)] xl:gap-x-16">
              {/* Headline block */}
              <div className="lg:col-start-1 lg:row-start-1 lg:pt-2">
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

                <h1 className="font-display mt-4 text-balance text-3xl font-extrabold leading-[1.08] tracking-tight text-primary sm:mt-6 sm:text-5xl xl:text-6xl">
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

                <p className="mt-3 max-w-xl text-pretty leading-relaxed text-muted-foreground sm:mt-5 sm:text-lg">
                  NEDC&apos;s 5-day Entrepreneurship Development Program: live,
                  mentor-led online sessions that take you from idea to a real
                  business plan.
                </p>
                <p className="mt-3 text-sm font-medium text-brand">
                  Starts {startLabel} · Limited seats per cohort
                </p>
              </div>

              {/* Registration form — the whole flow starts (and retries) here. */}
              <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
                <EdpRegistrationForm
                  cohortId={registrationOpen ? nextCohort!.id : undefined}
                  priceLabel={priceLabel}
                  startLabel={startLabel}
                  registrationOpen={registrationOpen}
                />
              </div>

              {/* Benefit bullets + mentor credibility (below the form on mobile) */}
              <div className="lg:col-start-1 lg:row-start-2 lg:self-end">
                <ul className="grid gap-3 sm:grid-cols-2">
                  {heroBenefits.map(({ Icon, accent, title, body }) => (
                    <li key={title} className="flex items-start gap-3">
                      <span
                        aria-hidden
                        className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
                          accent ? "bg-brand/10 text-brand" : "bg-primary/10 text-primary"
                        }`}
                      >
                        <Icon className="size-[18px]" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold leading-snug text-foreground">
                          {title}
                        </p>
                        <p className="mt-0.5 text-pretty text-xs leading-relaxed text-muted-foreground">
                          {body}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex items-center gap-3 border-t border-border pt-5">
                  <div className="flex -space-x-2" aria-hidden>
                    {MENTORS.map(({ name, photo }) => (
                      <Image
                        key={name}
                        src={photo}
                        alt=""
                        width={64}
                        height={64}
                        sizes="2.25rem"
                        className="size-9 rounded-full border-2 border-background object-cover object-top"
                      />
                    ))}
                  </div>
                  <p className="text-xs font-medium leading-snug text-muted-foreground">
                    Mentored by ex-bankers, incubation heads &amp; MSME
                    strategists
                  </p>
                </div>
              </div>
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
            <ul className="mx-auto mt-10 grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {MENTORS.map(({ name, role, credential, photo }) => (
                <li
                  key={name}
                  className="group flex gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft transition-all duration-300 ease-out hover:-translate-y-1 hover:border-primary/30 hover:shadow-float sm:flex-col"
                >
                  <div className="size-20 shrink-0 overflow-hidden rounded-2xl sm:size-28">
                    <Image
                      src={photo}
                      alt={name}
                      width={160}
                      height={160}
                      sizes="(min-width: 640px) 10rem, 5rem"
                      className="size-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-110 motion-reduce:transform-none"
                    />
                  </div>
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

        {/* ====== 5. PRICING — the CTA scrolls back UP to the hero form ====== */}
        <section id="pricing" className="scroll-mt-24 py-14 sm:py-20">
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
                enrollScrollTargetId="register"
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
                  <ScrollToFormLink
                    size="lg"
                    className="bg-card text-primary shadow-xl shadow-primary/25 hover:-translate-y-0.5 hover:bg-card/90"
                  >
                    Enroll now
                    <ArrowRight className="size-4" aria-hidden />
                  </ScrollToFormLink>
                </div>
                <p className="mt-4 text-sm font-medium text-primary-foreground/80">
                  Limited seats per cohort
                </p>
              </div>
            </div>
          </Container>
        </section>
      </main>

      {/* Floating CTAs: WhatsApp chat + the sticky "Enroll Now" that appears
          past the hero and scrolls back to the form (never overlapping). */}
      <EdpFloatingCtas priceLabel={priceLabel} targetId="register" />
    </>
  );
}
