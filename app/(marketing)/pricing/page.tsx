import type { Metadata } from "next";
import { CalendarDays, ShieldCheck } from "lucide-react";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { PricingPlans } from "@/components/PricingPlans";
import { EmptyState } from "@/components/EmptyState";
import { getFeaturedProgram, pickNextCohort } from "@/lib/queries";
import { formatDateRange } from "@/lib/format";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Pricing & enroll",
  description:
    "Two simple plans for the NEDC live online program — Basic, or Premium with 1-on-1 mentorship. Pay once for your cohort.",
};

export default async function PricingPage() {
  const featured = await getFeaturedProgram();
  const cohorts = featured?.cohorts ?? [];
  const nextCohort = pickNextCohort(cohorts);
  const registrationOpen = Boolean(nextCohort?.enroll_open);
  const dateLabel = nextCohort
    ? formatDateRange(nextCohort.start_date, nextCohort.end_date)
    : undefined;

  // Other open/upcoming batches a learner could pick instead of the next one.
  const otherBatches = cohorts.filter(
    (c) => c.id !== nextCohort?.id && c.status !== "completed" && c.status !== "cancelled",
  );

  return (
    <section className="py-16 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="Pricing"
          title="One program, two ways to join"
          subtitle="No subscriptions, no hidden charges. Pay once for your cohort — start with Basic, or go Premium for personal 1-on-1 mentorship."
          center
          as="h1"
        />

        {nextCohort ? (
          <div className="mt-14">
            {/* Keeps the heading outline h1 → h2 → h3 (the cards render h3 names). */}
            <h2 className="sr-only">Plans</h2>
            <PricingPlans
              basicPriceInr={nextCohort.price_inr}
              premiumPriceInr={nextCohort.price_premium_inr}
              dateLabel={dateLabel}
              cohortId={registrationOpen ? nextCohort.id : undefined}
              cohortName={registrationOpen ? nextCohort.name : undefined}
            />

            {otherBatches.length > 0 && (
              <p className="mt-10 flex flex-wrap items-center justify-center gap-2 text-center text-sm text-muted-foreground">
                <CalendarDays className="size-4 text-primary" aria-hidden />
                Also upcoming:&nbsp;
                {otherBatches
                  .map((c) => `${c.name} (${formatDateRange(c.start_date, c.end_date)})`)
                  .join(" · ")}
              </p>
            )}
          </div>
        ) : (
          <div className="mx-auto mt-12 max-w-2xl">
            <EmptyState message="No cohorts open right now. Add a cohort in Supabase (or run supabase/seed.sql for sample data)." />
          </div>
        )}

        <p className="mt-12 flex items-center justify-center gap-2 text-center text-sm text-muted-foreground">
          <ShieldCheck className="size-4 text-success" />
          Secure payment via Razorpay — UPI, cards &amp; netbanking. Prices in INR.
        </p>
      </Container>
    </section>
  );
}
