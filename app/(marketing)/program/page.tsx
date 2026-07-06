import type { Metadata } from "next";
import {
  ArrowRight,
  Award,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Globe,
  GraduationCap,
  Landmark,
  Lightbulb,
  type LucideIcon,
  MonitorPlay,
  Rocket,
  Sparkles,
  Sprout,
  Users,
} from "lucide-react";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { OffsetCard } from "@/components/OffsetCard";
import { PricingPlans } from "@/components/PricingPlans";
import { VideoEmbed } from "@/components/VideoEmbed";
import { Curriculum } from "@/components/sections/Curriculum";
import { NewsletterForm } from "@/components/NewsletterForm";
import { EmptyState } from "@/components/EmptyState";
import { getFeaturedProgram, pickNextCohort } from "@/lib/queries";
import { formatDateRange, formatTimeRange } from "@/lib/format";
import {
  EDP_INTRO,
  EDP_OBJECTIVES,
  EDP_VIDEO_ID,
  ELIGIBILITY,
  FOCUS_AREAS,
} from "@/lib/content";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "EDP Program: Register",
  description:
    "The NEDC Entrepreneurship Development Program (EDP): online & hybrid startup training. What it is, the 5-day curriculum, focus areas, eligibility, benefits, certification, and registration.",
};

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

const BENEFITS = [
  "Practical, startup-oriented training (not just theory)",
  "Mentorship and guidance from experienced entrepreneurs",
  "Awareness of government schemes, MSME & funding support",
  "Templates, worksheets, and resources you keep",
  "Certificate of Participation / Completion by NEDC",
  "Access to a motivated peer network and community",
];

export default async function ProgramPage() {
  const featured = await getFeaturedProgram();
  const cohorts = featured?.cohorts ?? [];
  const nextCohort = pickNextCohort(cohorts);
  const registrationOpen = Boolean(nextCohort?.enroll_open);
  const dateLabel = nextCohort
    ? formatDateRange(nextCohort.start_date, nextCohort.end_date)
    : undefined;
  const timeLabel = nextCohort
    ? formatTimeRange(nextCohort.daily_start_time, nextCohort.daily_end_time)
    : null;
  const otherBatches = cohorts.filter(
    (c) =>
      c.id !== nextCohort?.id &&
      c.status !== "completed" &&
      c.status !== "cancelled",
  );

  return (
    <>
      {/* Hero / intro + video */}
      <section className="bg-panel/50 py-16 sm:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-4 py-1.5 text-sm font-semibold text-brand">
                <span className="size-2 rounded-full bg-brand" />
                Registrations Opening Soon
              </span>
              <h1 className="font-display mt-5 max-w-3xl text-balance text-fluid-h1 font-extrabold tracking-tight text-foreground">
                Entrepreneurship Development Program (EDP)
              </h1>
              <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
                {EDP_INTRO}
              </p>

              <ul className="mt-7 space-y-3">
                {EDP_OBJECTIVES.map((objective) => (
                  <li key={objective} className="flex gap-3">
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" />
                    <span className="text-sm leading-relaxed text-foreground">
                      {objective}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Button href="#register" variant="accent" size="lg">
                  Register Now
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>

            {/* Intro video */}
            <div>
              <VideoEmbed videoId={EDP_VIDEO_ID} title="What is the NEDC EDP?" />
              <p className="mt-3 text-center text-sm text-muted-foreground">
                A quick introduction to the program
              </p>
            </div>
          </div>

          {/* Quick facts */}
          <dl className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: MonitorPlay, k: "Mode", v: "Online / Hybrid" },
              { icon: CalendarDays, k: "Duration", v: "5 days · 2 sessions/day" },
              { icon: Award, k: "Certification", v: "Certificate by NEDC" },
              { icon: Users, k: "Open to", v: "Students to rural founders" },
            ].map((f) => (
              <div
                key={f.k}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-sm"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <f.icon className="size-5" />
                </span>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {f.k}
                  </dt>
                  <dd className="text-sm font-semibold text-foreground">{f.v}</dd>
                </div>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      {/* Focus areas */}
      <section className="py-16 sm:py-24">
        <Container>
          <SectionHeading eyebrow="Focus areas" title="What you'll learn" />
          <div className="mt-12 grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {FOCUS_AREAS.map((area) => {
              const Icon = FOCUS_ICONS[area.icon] ?? Sparkles;
              return (
                <OffsetCard key={area.title}>
                  <div className="p-6">
                    <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-6" />
                    </span>
                    <h3 className="mt-4 font-semibold text-foreground">
                      {area.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {area.body}
                    </p>
                  </div>
                </OffsetCard>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Benefits + Eligibility */}
      <section className="border-y border-border bg-panel/50 py-16 sm:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
            <div>
              <SectionHeading eyebrow="Benefits" title="What you'll gain" />
              <ul className="mt-8 space-y-3">
                {BENEFITS.map((b) => (
                  <li key={b} className="flex gap-3">
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" />
                    <span className="text-sm leading-relaxed text-foreground">
                      {b}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <SectionHeading eyebrow="Eligibility" title="Who can join" />
              <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                The EDP is open to anyone with the ambition to build. No prior
                business experience required.
              </p>
              <div className="mt-6 flex flex-wrap gap-2.5">
                {ELIGIBILITY.map((who) => (
                  <span
                    key={who}
                    className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm"
                  >
                    {who}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Curriculum — the 5-day plan (from lib/content) */}
      <Curriculum />

      {/* Registration / payment */}
      <section id="register" className="scroll-mt-20 py-16 sm:py-24">
        <Container>
          <SectionHeading
            center
            eyebrow="Register"
            title="Reserve your seat"
            subtitle="One complete program: the Advance Certificate Course, with live mentor-led sessions and personal 1-on-1 mentorship. Secure payment via Razorpay (UPI, cards & netbanking). On success you'll get an instant receipt and email confirmation."
          />

          {nextCohort ? (
            <div className="mt-14">
              <PricingPlans
                basicPriceInr={nextCohort.price_inr}
                dateLabel={dateLabel}
                timeLabel={timeLabel ?? undefined}
                cohortId={registrationOpen ? nextCohort.id : undefined}
                cohortName={registrationOpen ? nextCohort.name : undefined}
              />

              {otherBatches.length > 0 && (
                <p className="mt-10 flex flex-wrap items-center justify-center gap-2 text-center text-sm text-muted-foreground">
                  <CalendarDays className="size-4 text-primary" aria-hidden />
                  Also upcoming:&nbsp;
                  {otherBatches
                    .map(
                      (c) =>
                        `${c.name} (${formatDateRange(c.start_date, c.end_date)})`,
                    )
                    .join(" · ")}
                </p>
              )}
            </div>
          ) : (
            <div className="mx-auto mt-12 max-w-2xl">
              <OffsetCard innerClassName="bg-primary text-primary-foreground">
                <div className="p-8 text-center sm:p-12">
                  <Award className="mx-auto size-10 text-primary-foreground/80" />
                  <h3 className="font-display mt-4 text-2xl font-bold">
                    Registrations opening soon
                  </h3>
                  <p className="mx-auto mt-3 max-w-md text-sm text-primary-foreground/80">
                    The next EDP batch starts soon. Leave your email and we&apos;ll
                    notify you the moment registration opens.
                  </p>
                  <div className="mt-6">
                    <NewsletterForm source="program" tone="onDark" align="center" />
                  </div>
                </div>
              </OffsetCard>
              <div className="mt-6">
                <EmptyState message="Once a cohort is added in Supabase (with a price and enroll_open = true), the secure Razorpay registration cards appear here automatically." />
              </div>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
