import { Check, ShieldCheck } from "lucide-react";

import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { EnrollButton } from "@/components/EnrollButton";
import { OffsetCard } from "@/components/OffsetCard";
import { SectionHeading } from "@/components/SectionHeading";
import { Badge } from "@/components/ui/badge";

/**
 * S12 — Pricing / Registration.
 *
 * One recommended plan card for the mentor-led EDP. Honest by design: when no
 * real price/dates/cohort are passed in yet we fall back to truthful
 * placeholders and an "Opening Soon" button instead of inventing a number or
 * pretending checkout is live.
 *
 * Registration goes live only when BOTH `cohortId` and `cohortName` are
 * provided — then we render the real Razorpay-backed <EnrollButton>.
 */
export interface PricingRegistrationProps {
  priceLabel?: string;
  dateLabel?: string;
  cohortId?: string;
  cohortName?: string;
}

/** Honest, verifiable inclusions for an online/hybrid mentor-led EDP. */
const INCLUDED = [
  "Live mentor-led sessions",
  "Session recordings in your dashboard",
  "Templates & worksheets",
  "Live mentor Q&A",
  "Certificate of Completion by NEDC",
] as const;

export function PricingRegistration({
  priceLabel,
  dateLabel,
  cohortId,
  cohortName,
}: PricingRegistrationProps) {
  // Only open real checkout once a concrete cohort exists.
  const registrationOpen = Boolean(cohortId && cohortName);

  return (
    <section
      id="register"
      className="scroll-mt-24 bg-panel/50 py-16 sm:py-24"
    >
      <Container>
        <SectionHeading
          center
          eyebrow="Registration"
          title="Join the program."
          subtitle="One mentor-led cohort. Everything you need to go from idea to a working business plan — with the recordings, templates, and certificate to back it up."
        />

        {/* The single recommended plan, centered. */}
        <div className="reveal mx-auto mt-12 max-w-lg">
          <OffsetCard innerClassName="border-2 border-brand shadow-float transition-transform duration-200 hover:-translate-y-1">
            <div className="p-7 sm:p-8">
              {/* Recommended flag — the section's one deliberate maroon accent. */}
              <Badge variant="brand">⭐ Recommended</Badge>

              {/* Price + dates */}
              <div className="mt-5">
                <p className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                  {priceLabel ?? "Pricing announced at launch"}
                </p>
                <p className="mt-2 text-sm font-medium text-muted-foreground">
                  {dateLabel ?? "Starts ~15 June — dates to be announced"}
                </p>
              </div>

              {/* What's included */}
              <ul className="mt-7 space-y-3.5">
                {INCLUDED.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span
                      aria-hidden
                      className="mt-0.5 flex size-5 flex-none items-center justify-center rounded-full bg-brand/10"
                    >
                      <Check className="size-3.5 text-brand" strokeWidth={3} />
                    </span>
                    <span className="text-pretty text-sm leading-relaxed text-foreground">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Register action */}
              <div className="mt-8">
                {registrationOpen ? (
                  <EnrollButton
                    cohortId={cohortId!}
                    cohortName={cohortName!}
                    className="w-full"
                  />
                ) : (
                  <Button
                    href="#register"
                    variant="primary"
                    size="lg"
                    className="w-full"
                  >
                    Register — Opening Soon
                  </Button>
                )}
              </div>

              {/* Trust line */}
              <p className="mt-4 flex items-start justify-center gap-2 text-center text-xs leading-relaxed text-muted-foreground">
                <ShieldCheck
                  aria-hidden
                  className="mt-0.5 size-4 flex-none text-success"
                />
                <span className="text-balance">
                  Secure payment · UPI, cards &amp; net banking · Instant
                  confirmation by email &amp; SMS.
                </span>
              </p>
            </div>
          </OffsetCard>
        </div>
      </Container>
    </section>
  );
}
