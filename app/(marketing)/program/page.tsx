import type { Metadata } from "next";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { SpeakerCard } from "@/components/SpeakerCard";
import { EnrollButton } from "@/components/EnrollButton";
import { EmptyState } from "@/components/EmptyState";
import { getFeaturedProgram, getSpeakers } from "@/lib/queries";
import { formatDateRange, formatINR } from "@/lib/format";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Program",
  description:
    "Curriculum, dates, and what you'll build in the NEDC live online program.",
};

export default async function ProgramPage() {
  const [featured, speakers] = await Promise.all([
    getFeaturedProgram(),
    getSpeakers(),
  ]);

  if (!featured) {
    return (
      <Container className="py-20">
        <SectionHeading eyebrow="Program" title="Program details coming soon" as="h1" />
        <div className="mt-8">
          <EmptyState message="No published program yet. Add a course in Supabase (or run supabase/seed.sql for sample data)." />
        </div>
      </Container>
    );
  }

  const { course, cohorts } = featured;

  return (
    <>
      {/* Intro */}
      <section className="py-16 sm:py-24">
        <Container>
          <p className="text-sm font-semibold uppercase tracking-wide text-brand">
            Program
          </p>
          <h1 className="mt-2 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">
            {course.title}
          </h1>
          {course.subtitle && (
            <p className="mt-4 max-w-2xl text-lg text-foreground/70">
              {course.subtitle}
            </p>
          )}
          {course.description && (
            <p className="mt-6 max-w-2xl leading-relaxed text-foreground/80">
              {course.description}
            </p>
          )}
          <div className="mt-8">
            <Button href="/pricing">See dates &amp; enroll</Button>
          </div>
        </Container>
      </section>

      {/* Curriculum */}
      <section className="py-16 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="Curriculum"
            title="What you'll cover, day by day"
          />
          {course.curriculum.length > 0 ? (
            <div className="mt-10 space-y-5">
              {course.curriculum.map((day) => (
                <div
                  key={day.day}
                  className="rounded-2xl border border-foreground/10 p-6"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/10 text-sm font-bold text-brand">
                      {day.day}
                    </span>
                    <h3 className="text-lg font-semibold">{day.title}</h3>
                  </div>
                  {day.points.length > 0 && (
                    <ul className="mt-4 grid gap-2 pl-12 sm:grid-cols-2">
                      {day.points.map((point, i) => (
                        <li
                          key={i}
                          className="flex gap-2 text-sm text-foreground/70"
                        >
                          <span className="text-brand">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-8">
              <EmptyState message="Curriculum will be published soon." />
            </div>
          )}
        </Container>
      </section>

      {/* Mentors */}
      {speakers.length > 0 && (
        <section className="py-12">
          <Container>
            <SectionHeading eyebrow="Mentors" title="Who you'll learn from" />
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {speakers.map((sp) => (
                <SpeakerCard key={sp.id} speaker={sp} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Upcoming batches */}
      <section className="py-16 sm:py-24">
        <Container>
          <SectionHeading eyebrow="Dates" title="Upcoming cohorts" />
          {cohorts.length > 0 ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              {cohorts.map((cohort) => (
                <div
                  key={cohort.id}
                  className="rounded-2xl border border-foreground/10 p-6"
                >
                  <h3 className="font-semibold">{cohort.name}</h3>
                  <p className="mt-1 text-sm text-foreground/70">
                    {formatDateRange(cohort.start_date, cohort.end_date)}
                  </p>
                  <p className="mt-4 text-2xl font-bold">
                    {formatINR(cohort.price_inr)}
                  </p>
                  <div className="mt-4">
                    {cohort.enroll_open ? (
                      <EnrollButton cohortId={cohort.id} cohortName={cohort.name} />
                    ) : (
                      <span className="text-sm text-foreground/70">
                        Enrollment closed
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-8">
              <EmptyState message="Dates will be announced soon." />
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
