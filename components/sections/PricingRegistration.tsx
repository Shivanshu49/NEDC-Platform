import { ShieldCheck } from "lucide-react";

import { Container } from "@/components/Container";
import { PricingPlans } from "@/components/PricingPlans";
import { SectionHeading } from "@/components/SectionHeading";

/**
 * S12 — Pricing / Registration.
 *
 * Two mentor-led EDP plans (Basic + Premium), with Premium steered as the value
 * pick. Honest by design: prices come from the DB and real Razorpay checkout
 * appears only once a concrete open cohort is passed in — otherwise the cards
 * fall back to truthful "Opening Soon" buttons instead of inventing a number.
 */
export interface PricingRegistrationProps {
  basicPriceInr?: number;
  premiumPriceInr?: number | null;
  dateLabel?: string;
  cohortId?: string;
  cohortName?: string;
  /** Pass-through to PricingPlans — see registrationClosed there. */
  registrationClosed?: boolean;
}

export function PricingRegistration({
  basicPriceInr,
  premiumPriceInr,
  dateLabel,
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
          title="Choose your plan."
          subtitle="Same mentor-led cohort, two ways to join. Start with Basic, or go Premium for 1-on-1 mentorship and a personal path from idea to a working business."
        />

        <div className="mt-12">
          <PricingPlans
            basicPriceInr={basicPriceInr}
            premiumPriceInr={premiumPriceInr}
            dateLabel={dateLabel}
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
