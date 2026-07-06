import { Check, Clock } from "lucide-react";

import { Button } from "@/components/Button";
import { EnrollButton } from "@/components/EnrollButton";
import { OffsetCard } from "@/components/OffsetCard";
import { PLANS } from "@/lib/plans";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * The single EDP offering — the "Advance Certificate Course" — as one card.
 *
 * Honest by design: the price comes from the DB (never invented), and real
 * Razorpay checkout only appears when a concrete open cohort is passed in;
 * otherwise the card falls back to a truthful "Opening Soon" / "Closed" button.
 *
 * (NEDC previously sold two tiers; that was retired for this one plan. See
 * lib/plans.ts for how the historical 'premium' id is kept alive for the ledger.)
 */
export interface PricingPlansProps {
  /** The single course price, in paise, from `cohorts.price_inr`. */
  basicPriceInr?: number;
  dateLabel?: string;
  /** Daily session window, e.g. "6:30 PM to 8:30 PM" (from cohorts.daily_*_time). */
  timeLabel?: string;
  cohortId?: string;
  cohortName?: string;
  /** True once the featured cohort's enrollment is genuinely over (it started
   * or ended without `enroll_open`) — flips the fallback CTA from "opening
   * soon" to "closed". Derive via lib/queries → registrationState(). */
  registrationClosed?: boolean;
}

export function PricingPlans({
  basicPriceInr,
  dateLabel,
  timeLabel,
  cohortId,
  cohortName,
  registrationClosed = false,
}: PricingPlansProps) {
  const registrationOpen = Boolean(cohortId && cohortName);
  const plan = PLANS[0];
  const price = basicPriceInr ?? null;
  const canEnroll = registrationOpen && typeof price === "number" && price > 0;

  return (
    <div className="mx-auto max-w-md">
      <OffsetCard
        className="reveal h-full"
        innerClassName={cn(
          "flex h-full flex-col p-7 sm:p-8",
          plan.highlight
            ? "border-2 border-brand shadow-float"
            : "border border-border shadow-soft",
        )}
      >
        {/* Name */}
        <h3 className="font-display text-xl font-bold tracking-tight text-foreground">
          {plan.name}
        </h3>
        <p className="mt-1.5 text-pretty text-sm leading-relaxed text-muted-foreground">
          {plan.tagline}
        </p>

        {/* Price */}
        <div className="mt-5">
          <p className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {typeof price === "number" ? formatINR(price) : "Announced at launch"}
          </p>
          <p className="mt-2 text-sm font-medium text-muted-foreground">
            {dateLabel ?? "Dates to be announced"}
          </p>
          {timeLabel && (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock aria-hidden className="size-4 flex-none text-primary" />
              {timeLabel} IST daily
            </p>
          )}
        </div>

        {/* Inclusions */}
        <ul className="mt-6 space-y-3.5">
          {plan.features.map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span
                aria-hidden
                className={cn(
                  "mt-0.5 flex size-5 flex-none items-center justify-center rounded-full",
                  plan.highlight ? "bg-brand/10" : "bg-primary/10",
                )}
              >
                <Check
                  className={cn(
                    "size-3.5",
                    plan.highlight ? "text-brand" : "text-primary",
                  )}
                  strokeWidth={3}
                />
              </span>
              <span className="text-pretty text-sm leading-relaxed text-foreground">
                {item}
              </span>
            </li>
          ))}
        </ul>

        {plan.footnote && (
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            {plan.footnote}
          </p>
        )}

        {/* CTA — pinned to the bottom */}
        <div className="mt-auto pt-7">
          {canEnroll ? (
            <EnrollButton
              cohortId={cohortId!}
              cohortName={cohortName!}
              plan={plan.id}
              label={plan.ctaLabel}
              variant={plan.highlight ? "brand" : "secondary"}
              className="w-full"
            />
          ) : (
            <Button
              href="#register"
              variant={plan.highlight ? "brand" : "secondary"}
              size="lg"
              className="w-full"
            >
              {registrationClosed
                ? "Registrations closed"
                : "Registration opening soon"}
            </Button>
          )}
        </div>
      </OffsetCard>
    </div>
  );
}
