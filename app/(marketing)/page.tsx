import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  CalendarDays,
  ClipboardList,
  Globe,
  GraduationCap,
  Landmark,
  Lightbulb,
  type LucideIcon,
  MapPin,
  Quote,
  Rocket,
  Sparkles,
  Sprout,
  Users,
  Wifi,
} from "lucide-react";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { Logo } from "@/components/Logo";
import { SectionHeading } from "@/components/SectionHeading";
import { SpeakerCard } from "@/components/SpeakerCard";
import { OffsetCard } from "@/components/OffsetCard";
import { Badge } from "@/components/ui/badge";
// Landing-page sections (blueprint order). Built as self-contained components.
import { WhyNedc } from "@/components/sections/WhyNedc";
import { AboutProgram } from "@/components/sections/AboutProgram";
import { Curriculum } from "@/components/sections/Curriculum";
import { FounderJourney } from "@/components/sections/FounderJourney";
import { WhoItsFor } from "@/components/sections/WhoItsFor";
import { SchemeHub } from "@/components/sections/SchemeHub";
import { Certification } from "@/components/sections/Certification";
import { PricingRegistration } from "@/components/sections/PricingRegistration";
import { AboutCredibility } from "@/components/sections/AboutCredibility";
import { Organiser } from "@/components/sections/Organiser";
import { FaqSection } from "@/components/sections/FaqSection";
import {
  getFeaturedProgram,
  getSpeakers,
  pickNextCohort,
} from "@/lib/queries";
import { formatDateRange } from "@/lib/format";
import { FOCUS_AREAS } from "@/lib/content";

// Re-fetch DB-backed content at most every 5 minutes (ISR). Static otherwise.
export const revalidate = 300;

// Map the focus-area icon names (from lib/content) to real lucide icons.
const FOCUS_ICONS: Record<string, LucideIcon> = {
  Rocket,
  ClipboardList,
  Lightbulb,
  Users,
  Landmark,
  Globe,
  Sprout,
  GraduationCap,
};

// Program-at-a-glance stats (the floating bar under the hero). Honest program
// facts only — no fabricated counts (see CLAUDE.md credibility rule).
const STATS: { figure: string; label: string; Icon: LucideIcon; accent?: boolean }[] = [
  { figure: "5 to 6", label: "Day immersive program", Icon: CalendarDays },
  { figure: "100%", label: "Online & hybrid delivery", Icon: Wifi },
  { figure: "Pan-India", label: "Open to every district", Icon: MapPin },
  { figure: "Certified", label: "Completion certificate by NEDC", Icon: BadgeCheck, accent: true },
];

// Fractal-noise grain (data-URI SVG) — a faint film over the dark bands so the
// navy reads as a rich, textured surface instead of flat fill.
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export default async function HomePage() {
  const [featured, speakers] = await Promise.all([
    getFeaturedProgram(),
    getSpeakers(),
  ]);
  const nextCohort = featured ? pickNextCohort(featured.cohorts) : null;
  const cohortDate = nextCohort
    ? formatDateRange(nextCohort.start_date, nextCohort.end_date)
    : "~15 June (dates TBA)";
  // Real checkout only opens when a cohort is actually accepting enrollments.
  const registrationOpen = Boolean(nextCohort?.enroll_open);

  return (
    <>
      {/* ================= HERO (S2) ================= */}
      <section className="relative overflow-hidden bg-background">
        {/* ===== Light, airy decoration — blends into the white sections + light navbar.
             All token-based; no dark gradient slab. ===== */}
        <div
          aria-hidden
          className="bg-dot-grid mask-fade-edges pointer-events-none absolute inset-0 opacity-60"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-24 size-[30rem] rounded-full bg-panel blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -left-28 size-80 rounded-full bg-pale blur-3xl"
        />
        {/* seamless fade into the white section below — no seam */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-linear-to-b from-transparent to-background"
        />

        <Container className="relative grid items-center gap-12 pb-16 pt-12 sm:pb-24 sm:pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:pb-28 lg:pt-20">
          {/* ---------- Left: editorial copy + CTAs ---------- */}
          <div className="relative z-10 max-w-xl">
            {/* NEDC brand lockup — emblem + "NEDC" wordmark (the official logo) */}
            <div className="mb-8">
              <Logo
                withWordmark
                subtitle
                priority
                className="h-12 w-auto"
                wordmarkClassName="text-2xl"
              />
            </div>

            <Badge
              variant="default"
              className="border border-primary/15 px-3 py-1 text-[13px] font-semibold"
            >
              <span className="relative flex size-2" aria-hidden>
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand opacity-70 motion-reduce:hidden" />
                <span className="relative inline-flex size-2 rounded-full bg-brand" />
              </span>
              {registrationOpen
                ? "Registrations open now"
                : "Registrations opening soon"}
            </Badge>

            <h1 className="font-display mt-6 text-balance text-hero font-extrabold leading-[1.0] tracking-tight text-primary">
              Learn to Build Your Own{" "}
              <span className="text-brand">Business</span>
            </h1>

            {/* Brand thesis + the page's signature gesture: the seeker → creator
                transformation, set in the display face so the page's whole reason
                for being is the most deliberate line in the hero (not a footnote). */}
            <p className="mt-5 flex flex-wrap items-center gap-x-2.5 gap-y-1 font-display text-xl font-semibold tracking-tight sm:text-2xl">
              <span className="text-muted-foreground">Job seeker</span>
              <ArrowRight className="size-5 shrink-0 text-brand" aria-hidden />
              <span className="relative inline-block text-primary">
                job creator
                {/* the one hand-drawn maroon underline — moved off the headline so
                    a single accent gesture punctuates the brand's payoff word */}
                <svg
                  aria-hidden
                  viewBox="0 0 200 14"
                  preserveAspectRatio="none"
                  className="absolute -bottom-1 left-0 h-[0.45em] w-full text-brand/45"
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
            </p>

            <p className="mt-5 text-pretty text-lg leading-relaxed text-muted-foreground">
              NEDC&apos;s Entrepreneurship Development Program gives India&apos;s youth,
              students, women, and aspiring founders the skills, mindset, and
              mentorship to turn ideas into real ventures, delivered online &amp; hybrid,
              with certification.
            </p>

            <div className="mt-8 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
              <Button
                href="#program"
                variant="primary"
                size="lg"
                className="group w-full shadow-soft hover:-translate-y-0.5 sm:w-auto"
              >
                Explore the Program
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
              <Button
                href="#register"
                variant="secondary"
                size="lg"
                className="w-full hover:-translate-y-0.5 sm:w-auto"
              >
                {registrationOpen ? "Register now" : "Registration opening soon"}
              </Button>
            </div>

            {/* Trust strip — inline, navy icons; one maroon accent kept off this row to hold the ratio */}
            <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-3 border-t border-border pt-6">
              {[
                { label: "100% Online / Hybrid", Icon: Wifi },
                { label: "Certificate on Completion", Icon: BadgeCheck },
                { label: "Mentor-Led", Icon: Users },
                { label: "Pan-India", Icon: MapPin },
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

          {/* ---------- Right: founder image in a clean white card with layered premium depth ---------- */}
          <div className="relative">
            {/* soft tinted glows behind the card */}
            <div
              aria-hidden
              className="pointer-events-none absolute -right-6 -top-6 size-40 rounded-full bg-panel blur-2xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-8 -left-8 size-44 rounded-full bg-pale blur-2xl"
            />

            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="relative rounded-4xl border border-border bg-card p-3 shadow-float sm:p-4">
                <Image
                  src="https://images.unsplash.com/photo-1573164574511-73c773193279?auto=format&fit=crop&w=900&q=80"
                  alt="A young Indian woman entrepreneur leading her small team as they brainstorm and plan their startup together"
                  width={900}
                  height={1100}
                  priority
                  sizes="(min-width: 1024px) 28rem, 90vw"
                  className="aspect-4/5 w-full rounded-3xl object-cover"
                />

                {/* crafted inset ring + gentle navy scrim so overlaid chips stay legible */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-3 rounded-3xl ring-1 ring-foreground/10 sm:inset-4"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-3 rounded-3xl bg-linear-to-t from-primary/15 via-transparent to-transparent sm:inset-4"
                />

                {/* Floating proof chip — Certificate (the ONE maroon accent chip) */}
                <div className="absolute -left-3 top-8 flex items-center gap-2.5 rounded-2xl border border-border bg-card p-3 shadow-lift sm:-left-5">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-brand/10 text-brand">
                    <Award className="size-5" aria-hidden />
                  </span>
                  <div className="pr-1">
                    <p className="text-sm font-semibold leading-tight text-foreground">
                      Certificate
                    </p>
                    <p className="text-[11px] leading-tight text-muted-foreground">
                      on completion, by NEDC
                    </p>
                  </div>
                </div>

                {/* Floating proof chip — Open to all (navy, balances the accent 1:1) */}
                <div className="absolute -right-3 bottom-8 flex items-center gap-2.5 rounded-2xl border border-border bg-card p-3 shadow-lift sm:-right-5">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <GraduationCap className="size-5" aria-hidden />
                  </span>
                  <div className="pr-1">
                    <p className="text-sm font-semibold leading-tight text-foreground">
                      Open to all
                    </p>
                    <p className="text-[11px] leading-tight text-muted-foreground">
                      Youth &middot; Women &middot; Rural
                    </p>
                  </div>
                </div>
              </div>

              {/* subtle start-date pill anchored under the card — date value stays NAVY (out of the maroon budget) */}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-soft">
                <CalendarDays className="-mt-px mr-1 inline size-3.5 text-primary" aria-hidden />
                Starts <span className="font-semibold text-primary">{cohortDate}</span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ================= STATS / TRUST STRIP (S3) — floating NAVY anchor band over the hero seam ================= */}
      <section className="relative z-20 -mt-14 sm:-mt-20 lg:-mt-24">
        <Container>
          <dl className="relative grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-white/10 shadow-float lg:grid-cols-4">
            {/* film grain so the navy reads as the same crafted surface as the EDP band */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-10 opacity-[0.18] mix-blend-soft-light"
              style={{ backgroundImage: GRAIN }}
            />
            {STATS.map(({ figure, label, Icon, accent }) => (
              <div
                key={label}
                className="relative flex items-center gap-3 bg-primary px-4 py-5 sm:gap-4 sm:px-6 sm:py-7"
              >
                <span
                  className={`flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/10 sm:size-11 ${
                    accent ? "text-brand-light" : "text-primary-foreground/90"
                  }`}
                >
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0">
                  <dt
                    className={`font-display text-2xl font-extrabold leading-none tracking-tight tabular-nums sm:text-3xl ${
                      accent ? "text-brand-light" : "text-primary-foreground"
                    }`}
                  >
                    {figure}
                  </dt>
                  <dd className="mt-1 text-xs font-medium leading-snug text-primary-foreground/75 sm:text-sm">
                    {label}
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      {/* ================= WHY NEDC — the mindset shift (S4) ================= */}
      <WhyNedc />

      {/* ================= WHAT IS THE EDP? — intro + objectives + video ================= */}
      <AboutProgram />

      {/* ================= THE PROGRAM (EDP) — focus areas (S5) ================= */}
      {/* The centerpiece grid. On deep navy with film grain, light glass cards
          and a maroon-glow hover read as a premium "feature wall". */}
      <section
        className="relative overflow-hidden bg-primary py-20 text-primary-foreground sm:py-28"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.22] mix-blend-soft-light"
          style={{ backgroundImage: GRAIN }}
        />
        <div
          aria-hidden
          className="bg-dot-grid-light mask-fade-edges pointer-events-none absolute inset-0 opacity-50"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-40 top-10 size-[28rem] rounded-full bg-navy-soft/40 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 bottom-0 size-[26rem] rounded-full bg-brand/25 blur-3xl"
        />
        <Container className="relative">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-3 inline-flex items-center justify-center gap-2.5 text-xs font-bold uppercase tracking-[0.16em] text-brand-light">
              <span aria-hidden className="h-px w-6 bg-brand-light/60" />
              Focus areas
            </p>
            <h2 className="font-display text-balance text-fluid-h2 font-bold tracking-tight">
              What you&apos;ll learn in the program
            </h2>
            <p className="mt-4 text-pretty leading-relaxed text-primary-foreground/75">
              A hands-on, mentor-led curriculum that builds the skills and
              entrepreneurial mindset to turn your ideas into a venture.
            </p>
          </div>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FOCUS_AREAS.map((area, i) => {
              const Icon = FOCUS_ICONS[area.icon] ?? Sparkles;
              return (
                <div
                  key={area.title}
                  className="group reveal relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] p-6 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:border-brand/50 hover:bg-white/[0.08]"
                >
                  {/* big index watermark — an authored numbering system, kept faint
                      but legible so the grid reads as a numbered curriculum */}
                  <span
                    aria-hidden
                    className="font-display pointer-events-none absolute right-4 top-3 text-6xl font-extrabold leading-none tabular-nums tracking-tight text-white/[0.09] transition-colors duration-300 group-hover:text-brand-light/30"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="relative flex size-12 items-center justify-center rounded-xl bg-white/10 text-brand-light transition-colors duration-300 delay-75 group-hover:bg-brand group-hover:text-white">
                    <Icon className="size-6" />
                  </span>
                  <h3 className="relative mt-5 text-lg font-bold">
                    {area.title}
                  </h3>
                  <p className="relative mt-2 text-sm leading-relaxed text-primary-foreground/70">
                    {area.body}
                  </p>
                  {/* maroon glow that blooms up on hover — lingers a beat behind the lift */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -bottom-16 left-1/2 size-40 -translate-x-1/2 rounded-full bg-brand/30 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
                  />
                </div>
              );
            })}
          </div>
          <p className="mt-12 text-center text-sm font-medium text-primary-foreground/70">
            Online &amp; hybrid &middot; Mentor-led sessions &middot; Certificate of
            Completion by NEDC
          </p>
        </Container>
      </section>

      {/* ================= CURRICULUM — the 5-day plan ================= */}
      <Curriculum />

      {/* ================= THE FOUNDER JOURNEY (S6) ================= */}
      <FounderJourney />

      {/* ================= WHO IT'S FOR (S7) ================= */}
      <WhoItsFor />

      {/* ================= GOVERNMENT SCHEME HUB (S8) ================= */}
      <SchemeHub />

      {/* ================= MENTORS (S9) ================= */}
      <section
        id="mentors"
        className="scroll-mt-24 border-y border-border bg-panel/40 py-16 sm:py-24"
      >
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading
              eyebrow="Mentors"
              title="Learn from people who've built businesses"
            />
            {speakers.length > 0 && (
              <Link
                href="/speakers"
                className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline sm:inline-flex"
              >
                Meet all mentors
                <ArrowRight className="size-4" />
              </Link>
            )}
          </div>
          {speakers.length > 0 ? (
            <div className="mt-12 grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
              {speakers.slice(0, 3).map((sp) => (
                <SpeakerCard key={sp.id} speaker={sp} />
              ))}
            </div>
          ) : (
            <p className="mt-8 max-w-2xl text-pretty leading-relaxed text-muted-foreground">
              Our mentor panel of founders and experts who&apos;ve built real
              businesses will be introduced here as the program lineup is
              confirmed. Real people only; no placeholders.
            </p>
          )}
        </Container>
      </section>

      {/* ================= SUCCESS STORIES (S10) ================= */}
      {/* Honest by design: we don't publish invented testimonials. This stays an
          intentional, on-brand placeholder until real, consented learner stories
          exist (mirrors the Mentors "real people only" stance above). */}
      <section
        id="stories"
        className="scroll-mt-24 border-y border-border bg-secondary/40 py-16 sm:py-24"
      >
        <Container>
          <SectionHeading
            eyebrow="Success stories"
            title="From our learners"
            subtitle="Our first cohorts are just getting started. Real graduate stories, with names, outcomes, and consent, will be published right here."
            center
          />
          <div className="reveal mx-auto mt-12 max-w-2xl">
            <OffsetCard>
              <div className="flex flex-col items-center p-8 text-center sm:p-10">
                <span
                  aria-hidden
                  className="flex size-12 items-center justify-center rounded-2xl bg-brand/10 text-brand"
                >
                  <Quote className="size-6" />
                </span>
                <p className="font-display mt-6 text-balance text-xl font-semibold leading-snug text-foreground sm:text-2xl">
                  Your story could be the first one we feature here.
                </p>
                <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
                  We believe proof should be real. As learners complete the
                  Entrepreneurship Development Program and start building, we&apos;ll
                  share their genuine journeys, never fabricated ones.
                </p>
                <div className="mt-7">
                  <Button href="#register" variant="primary">
                    Start your journey
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              </div>
            </OffsetCard>
          </div>
        </Container>
      </section>

      {/* ================= CERTIFICATION (S11) ================= */}
      <Certification />

      {/* ================= PRICING / REGISTRATION (S12) ================= */}
      <PricingRegistration
        basicPriceInr={nextCohort?.price_inr}
        premiumPriceInr={nextCohort?.price_premium_inr ?? null}
        dateLabel={nextCohort ? cohortDate : undefined}
        cohortId={registrationOpen ? nextCohort!.id : undefined}
        cohortName={registrationOpen ? nextCohort!.name : undefined}
      />

      {/* ================= ABOUT & CREDIBILITY (S14) ================= */}
      <AboutCredibility />

      {/* ================= THE ORGANISER (founder spotlight) ================= */}
      <Organiser />

      {/* ================= FAQ (S15) ================= */}
      <FaqSection />

      {/* ================= FINAL CALL-TO-ACTION BAND (S16) ================= */}
      <section className="py-16 sm:py-24">
        <Container>
          <div
            className="relative overflow-hidden rounded-4xl px-8 py-16 text-center text-primary-foreground shadow-float sm:px-12 sm:py-20"
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
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-24 left-1/2 size-96 -translate-x-1/2 rounded-full bg-brand/30 blur-3xl"
            />
            <div className="relative">
              <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-white/10 text-white ring-1 ring-white/20 backdrop-blur-sm">
                <Rocket className="size-7" />
              </span>
              <h2 className="font-display mt-6 text-balance text-fluid-h2 font-bold tracking-tight">
                Ready to become a job creator?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-pretty text-primary-foreground/80">
                Join NEDC&apos;s Entrepreneurship Development Program and learn the
                mindset and skills to launch your own business and grow from job
                seeker to job creator.
              </p>
              <div className="mt-8 flex justify-center">
                <Button
                  href="#register"
                  variant="primary"
                  size="lg"
                  className="bg-card text-primary shadow-xl shadow-primary/25 hover:-translate-y-0.5 hover:bg-card/90"
                >
                  Register Now
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
