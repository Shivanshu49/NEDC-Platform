import { ShieldCheck } from "lucide-react";

import { Container } from "@/components/Container";
import { PricingPlans } from "@/components/PricingPlans";
import { SectionHeading } from "@/components/SectionHeading";

/**
 * S12 — Pricing / Registration.
 *
 * The single mentor-led EDP offering, the "Advance Certificate Course". Honest by
 * design: the price comes from the DB and real Razorpay checkout appears only once
 * a concrete open cohort is passed in — otherwise the card falls back to a truthful
 * "Opening Soon" button instead of inventing a number.
 */
export interface PricingRegistrationProps {
  basicPriceInr?: number;
  dateLabel?: string;
  timeLabel?: string;
  cohortId?: string;
  cohortName?: string;
  /** Pass-through to PricingPlans — see registrationClosed there. */
  registrationClosed?: boolean;
}

export function PricingRegistration({
  basicPriceInr,
  dateLabel,
  timeLabel,
  cohortId,
  cohortName,
  registrationClosed,
}: PricingRegistrationProps) {
  return (
    <section id="register" className="scroll-mt-24 bg-panel/50 py-16 sm:py-24">
      <Container>
        <SectionHeading
          center
          eyebrow="Registration"
          title="Reserve your seat"
          subtitle="One complete program, one price: the Advance Certificate Course. Live mentor-led sessions, personal 1-on-1 mentorship, and a Certificate of Completion by NEDC. Pay once for your cohort; no subscriptions."
        />

        <div className="mt-12">
          <PricingPlans
            basicPriceInr={basicPriceInr}
            dateLabel={dateLabel}
            timeLabel={timeLabel}
            cohortId={cohortId}
            cohortName={cohortName}
            registrationClosed={registrationClosed}
          />
        </div>

        {/* Trust line */}
        <p className="mt-8 flex items-start justify-center gap-2 text-center text-xs leading-relaxed text-muted-foreground">
          <ShieldCheck aria-hidden className="mt-0.5 size-4 flex-none text-success" />
          <span className="text-balance">
            Secure payment · UPI, cards &amp; net banking · Instant confirmation by
            email &amp; SMS.
          </span>
        </p>
      </Container>
    </section>
  );
}
