import type { Metadata } from "next";
import {
  ArrowRight,
  Award,
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
import { EnrollButton } from "@/components/EnrollButton";
import { NewsletterForm } from "@/components/NewsletterForm";
import { EmptyState } from "@/components/EmptyState";
import { getFeaturedProgram } from "@/lib/queries";
import { formatDateRange, formatINR } from "@/lib/format";
import { ELIGIBILITY, FOCUS_AREAS } from "@/lib/content";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "EDP Program — Register",
  description:
    "The NEDC Entrepreneurship Development Program (EDP): online & hybrid startup training. Focus areas, eligibility, benefits, certification, and registration. Registrations opening soon.",
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

  return (
    <>
      {/* Hero / intro */}
      <section className="bg-panel/50 py-16 sm:py-24">
        <Container>
          <span className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-4 py-1.5 text-sm font-semibold text-brand">
            <span className="size-2 rounded-full bg-brand" />
            Registrations Opening Soon
          </span>
          <h1 className="font-display mt-5 max-w-3xl text-balance text-fluid-h1 font-extrabold tracking-tight text-foreground">
            Entrepreneurship Development Program (EDP)
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            A focused, startup-oriented program that takes you from skill
            development to startup development — delivered online and hybrid, with
            a certificate by NEDC.
          </p>

          {/* Quick facts */}
          <dl className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: MonitorPlay, k: "Mode", v: "Online / Hybrid" },
              { icon: Sparkles, k: "Starts", v: "~15 June (TBA)" },
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

          <div className="mt-8">
            <Button href="#register" variant="accent" size="lg">
              Register Now
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </Container>
      </section>

      {/* Focus areas */}
      <section className="py-16 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="Focus areas"
            title="What you'll learn"
          />
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
                The EDP is open to anyone with the ambition to build — no prior
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

      {/* Curriculum (if a course is published) */}
      {featured && featured.course.curriculum.length > 0 && (
        <section className="py-16 sm:py-24">
          <Container>
            <SectionHeading
              eyebrow="Curriculum"
              title="What you'll cover, day by day"
            />
            <div className="mt-12 grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
              {featured.course.curriculum.map((day) => (
                <OffsetCard key={day.day}>
                  <div className="p-6">
                    <div className="flex items-center gap-3">
                      <span className="flex size-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                        {day.day}
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Day {day.day}
                      </span>
                    </div>
                    <h3 className="mt-4 font-semibold text-foreground">
                      {day.title}
                    </h3>
                    {day.points.length > 0 && (
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {day.points.join(" · ")}
                      </p>
                    )}
                  </div>
                </OffsetCard>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Registration / payment */}
      <section id="register" className="scroll-mt-20 py-16 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="Register"
            title="Reserve your seat"
            subtitle="Secure payment via Razorpay — UPI, Google Pay, PhonePe, Paytm, cards, netbanking & QR. Prices in INR. On success you'll get an instant receipt and email confirmation."
            center
          />

          {cohorts.length > 0 ? (
            <div className="mx-auto mt-14 grid max-w-4xl gap-x-6 gap-y-8 sm:grid-cols-2">
              {cohorts.map((cohort) => (
                <OffsetCard key={cohort.id} className="h-full">
                  <div className="flex h-full flex-col p-8">
                    <h3 className="text-lg font-semibold text-foreground">
                      {cohort.name}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatDateRange(cohort.start_date, cohort.end_date)}
                    </p>
                    <p className="font-display mt-6 text-4xl font-bold text-foreground">
                      {formatINR(cohort.price_inr)}
                    </p>
                    <p className="text-sm text-muted-foreground">per participant</p>
                    <div className="mt-8 flex-1" />
                    {cohort.enroll_open ? (
                      <EnrollButton
                        cohortId={cohort.id}
                        cohortName={cohort.name}
                        className="w-full"
                      />
                    ) : (
                      <p className="text-center text-sm text-muted-foreground">
                        Enrollment for this batch is closed.
                      </p>
                    )}
                  </div>
                </OffsetCard>
              ))}
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
                    The next EDP batch starts ~15 June. Leave your email and
                    we&apos;ll notify you the moment registration opens.
                  </p>
                  <div className="mt-6">
                    <NewsletterForm source="program" tone="onDark" align="center" />
                  </div>
                </div>
              </OffsetCard>
              <div className="mt-6">
                <EmptyState message="Once a cohort is added in Supabase (with a price and enroll_open = true), the secure Razorpay registration card appears here automatically." />
              </div>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
