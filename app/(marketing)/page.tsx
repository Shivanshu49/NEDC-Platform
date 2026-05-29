import Link from "next/link";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { SpeakerCard } from "@/components/SpeakerCard";
import { FaqAccordion } from "@/components/FaqAccordion";
import {
  getFaqs,
  getFeaturedProgram,
  getSpeakers,
  pickNextCohort,
} from "@/lib/queries";
import { formatDateRange, formatINR } from "@/lib/format";

// Re-fetch DB-backed content at most every 5 minutes (ISR). Static otherwise.
export const revalidate = 300;

const VALUE_PROPS = [
  {
    title: "Live, cohort-based",
    body: "Learn in real time with a small cohort — not a lonely pre-recorded course.",
  },
  {
    title: "Mentor-led",
    body: "Daily live sessions with founders and experts who answer your questions.",
  },
  {
    title: "Recordings included",
    body: "Miss a day? Every session is recorded and waiting in your dashboard.",
  },
  {
    title: "Built for India",
    body: "Pay in ₹ via UPI, cards, or netbanking. Sessions scheduled in IST.",
  },
];

const STEPS = [
  {
    n: 1,
    title: "Enroll & pay securely",
    body: "Reserve your seat in a few taps with UPI, card, or netbanking.",
  },
  {
    n: 2,
    title: "Join live on Zoom",
    body: "Find your join links in your dashboard and show up each day.",
  },
  {
    n: 3,
    title: "Rewatch anytime",
    body: "Recordings appear after each session, so you never miss a thing.",
  },
];

export default async function HomePage() {
  // Fetch in parallel — these are independent reads.
  const [featured, speakers, faqs] = await Promise.all([
    getFeaturedProgram(),
    getSpeakers(),
    getFaqs(),
  ]);
  const nextCohort = featured ? pickNextCohort(featured.cohorts) : null;

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden">
        <Container className="py-20 text-center sm:py-28">
          <span className="inline-block rounded-full border border-brand/30 bg-brand/5 px-4 py-1 text-sm font-medium text-brand">
            Live online · 5–6 day programs
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-6xl">
            Turn your idea into a real venture
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-foreground/70">
            The National Entrepreneurship Development Center runs intensive, live
            online programs where you build your startup alongside mentors and a
            motivated cohort.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button href="/pricing">Enroll now</Button>
            <Button href="/program" variant="secondary">
              See the program
            </Button>
          </div>

          {/* Quick facts — pulls real dates/price if a cohort exists */}
          <dl className="mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-6 sm:grid-cols-4">
            <Fact label="Format" value="Live on Zoom" />
            <Fact label="Duration" value="5–6 days" />
            {nextCohort ? (
              <>
                <Fact
                  label="Next cohort"
                  value={formatDateRange(
                    nextCohort.start_date,
                    nextCohort.end_date,
                  )}
                />
                <Fact label="Fee" value={formatINR(nextCohort.price_inr)} />
              </>
            ) : (
              <>
                <Fact label="Mentors" value="Founders & experts" />
                <Fact label="Bonus" value="Lifetime recordings" />
              </>
            )}
          </dl>
        </Container>
      </section>

      {/* ---------- Value props ---------- */}
      <section className="py-16 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="Why NEDC"
            title="A program that actually moves you forward"
            center
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUE_PROPS.map((v) => (
              <div
                key={v.title}
                className="rounded-2xl border border-foreground/10 p-6"
              >
                <h3 className="font-semibold">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground/70">
                  {v.body}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ---------- Featured program preview (only if a course exists) ---------- */}
      {featured && (
        <section className="py-16 sm:py-24">
          <Container>
            <div className="rounded-3xl border border-foreground/10 bg-foreground/2 p-8 sm:p-12">
              <SectionHeading
                eyebrow="The program"
                title={featured.course.title}
                subtitle={featured.course.subtitle ?? undefined}
              />
              {featured.course.curriculum.length > 0 && (
                <ol className="mt-8 space-y-4">
                  {featured.course.curriculum.slice(0, 3).map((day) => (
                    <li key={day.day} className="flex gap-4">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-sm font-bold text-brand">
                        {day.day}
                      </span>
                      <div>
                        <p className="font-semibold">{day.title}</p>
                        {day.points.length > 0 && (
                          <p className="text-sm text-foreground/60">
                            {day.points.join(" · ")}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              )}
              <div className="mt-8">
                <Button href="/program" variant="secondary">
                  View full curriculum
                </Button>
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* ---------- How it works ---------- */}
      <section className="py-16 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="How it works"
            title="From sign-up to graduation"
            center
          />
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n}>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand font-bold text-brand-foreground">
                  {s.n}
                </span>
                <h3 className="mt-4 font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground/70">
                  {s.body}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ---------- Speakers preview (only if speakers exist) ---------- */}
      {speakers.length > 0 && (
        <section className="py-16 sm:py-24">
          <Container>
            <div className="flex items-end justify-between gap-4">
              <SectionHeading
                eyebrow="Speakers"
                title="Learn from people who've done it"
              />
              <Link
                href="/speakers"
                className="hidden shrink-0 text-sm font-semibold text-brand hover:underline sm:block"
              >
                Meet all speakers →
              </Link>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {speakers.slice(0, 3).map((sp) => (
                <SpeakerCard key={sp.id} speaker={sp} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ---------- FAQ preview (only if faqs exist) ---------- */}
      {faqs.length > 0 && (
        <section className="py-16 sm:py-24">
          <Container className="max-w-3xl">
            <SectionHeading eyebrow="FAQ" title="Questions, answered" center />
            <div className="mt-10">
              <FaqAccordion faqs={faqs.slice(0, 5)} />
            </div>
            <p className="mt-6 text-center text-sm text-foreground/60">
              <Link
                href="/faq"
                className="font-semibold text-brand hover:underline"
              >
                See all FAQs →
              </Link>
            </p>
          </Container>
        </section>
      )}

      {/* ---------- Final CTA ---------- */}
      <section className="py-16 sm:py-24">
        <Container>
          <div className="rounded-3xl bg-brand px-8 py-14 text-center text-brand-foreground sm:px-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to build your venture?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-brand-foreground/80">
              Join the next NEDC cohort and go from idea to launch in under a week.
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-full bg-background px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-background/90"
              >
                See dates & pricing
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

/** Small stat used in the hero. */
function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <dt className="text-xs uppercase tracking-wide text-foreground/60">
        {label}
      </dt>
      <dd className="mt-1 font-semibold">{value}</dd>
    </div>
  );
}
