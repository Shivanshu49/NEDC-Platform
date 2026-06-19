import type { Metadata } from "next";
import { Check, ShieldCheck } from "lucide-react";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { OffsetCard } from "@/components/OffsetCard";
import { EnrollButton } from "@/components/EnrollButton";
import { EmptyState } from "@/components/EmptyState";
import { getFeaturedProgram } from "@/lib/queries";
import { formatDateRange, formatINR } from "@/lib/format";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Pricing & enroll",
  description: "Pick a cohort and enroll in the NEDC live online program.",
};

const INCLUDED = [
  "All live sessions on Zoom",
  "Every session recorded in your dashboard",
  "Live mentor Q&A",
  "Templates, worksheets & resources",
  "Certificate of completion",
];

export default async function PricingPage() {
  const featured = await getFeaturedProgram();
  const cohorts = featured?.cohorts ?? [];

  return (
    <section className="py-16 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="Pricing"
          title="One simple fee, everything included"
          subtitle="No subscriptions, no hidden charges. Pay once for your cohort."
          center
          as="h1"
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

                  <ul className="mt-6 flex-1 space-y-3 text-sm">
                    {INCLUDED.map((item) => (
                      <li key={item} className="flex gap-2.5">
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Check className="size-3" />
                        </span>
                        <span className="text-foreground/80">{item}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8">
                    {cohort.enroll_open ? (
                      <EnrollButton
                        cohortId={cohort.id}
                        cohortName={cohort.name}
                        className="w-full"
                      />
                    ) : (
                      <p className="text-center text-sm text-muted-foreground">
                        Enrollment for this cohort is closed.
                      </p>
                    )}
                  </div>
                </div>
              </OffsetCard>
            ))}
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
