import { Check, Sparkles } from "lucide-react";

import { Button } from "@/components/Button";
import { EnrollButton } from "@/components/EnrollButton";
import { OffsetCard } from "@/components/OffsetCard";
import { Badge } from "@/components/ui/badge";
import { PLANS } from "@/lib/plans";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * The two EDP pricing tiers (Basic + Premium), side by side.
 *
 * Conversion intent: Premium is the steered choice — highlighted border, a
 * "most popular" badge, a "Everything in Basic, plus:" frame, a value nudge
 * ("only ₹X more"), and a FILLED primary CTA against Basic's quieter outline
 * CTA. Honest by design: prices come from the DB (never invented), and real
 * checkout only appears when a concrete open cohort is passed in; otherwise
 * every card falls back to an "Opening Soon" button.
 *
 * Premium is offered only when the cohort actually has a premium price
 * (`premiumPriceInr`); without one it shows as opening soon rather than charging.
 */
export interface PricingPlansProps {
  basicPriceInr?: number;
  premiumPriceInr?: number | null;
  dateLabel?: string;
  cohortId?: string;
  cohortName?: string;
  /** True once the featured cohort's enrollment is genuinely over (it started
   * or ended without `enroll_open`) — flips the fallback CTA from "opening
   * soon" to "closed". Derive via lib/queries → registrationState(). */
  registrationClosed?: boolean;
}

export function PricingPlans({
  basicPriceInr,
  premiumPriceInr,
  dateLabel,
  cohortId,
  cohortName,
  registrationClosed = false,
}: PricingPlansProps) {
  const registrationOpen = Boolean(cohortId && cohortName);
  const priceFor = (id: string) =>
    id === "premium" ? premiumPriceInr ?? null : basicPriceInr ?? null;

  // Value nudge on Premium: how much more than Basic it costs.
  const upgradeDiff =
    typeof basicPriceInr === "number" && typeof premiumPriceInr === "number"
      ? premiumPriceInr - basicPriceInr
      : null;

  return (
    <div className="mx-auto grid max-w-4xl items-stretch gap-6 sm:grid-cols-2 sm:gap-7">
      {PLANS.map((plan) => {
        const price = priceFor(plan.id);
        const canEnroll =
          registrationOpen && typeof price === "number" && price > 0;

        return (
          <OffsetCard
            key={plan.id}
            className="reveal h-full"
            innerClassName={cn(
              "flex h-full flex-col p-7 sm:p-8",
              plan.highlight
                ? "border-2 border-brand shadow-float"
                : "border border-border shadow-soft",
            )}
          >
            {/* Name + badge */}
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-display text-xl font-bold tracking-tight text-foreground">
                {plan.name}
              </h3>
              {plan.badge && (
                <Badge variant="brand" className="shrink-0">
                  <Sparkles className="size-3.5" aria-hidden />
                  {plan.badge}
                </Badge>
              )}
            </div>
            <p className="mt-1.5 text-pretty text-sm leading-relaxed text-muted-foreground">
              {plan.tagline}
            </p>

            {/* Price */}
            <div className="mt-5">
              <p className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                {typeof price === "number" ? formatINR(price) : "Announced at launch"}
                {typeof price === "number" && (
                  <span className="ml-1.5 align-baseline text-sm font-medium text-muted-foreground">
                    / participant
                  </span>
                )}
              </p>
              <p className="mt-2 text-sm font-medium text-muted-foreground">
                {dateLabel ?? "Starts ~15 June, dates to be announced"}
              </p>
              {plan.highlight && upgradeDiff !== null && upgradeDiff > 0 && (
                <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
                  Only {formatINR(upgradeDiff)} more than Basic
                </p>
              )}
            </div>

            {/* Inclusions */}
            {plan.inheritsLabel && (
              <p className="mt-6 text-sm font-semibold text-foreground">
                {plan.inheritsLabel}
              </p>
            )}
            <ul className={cn("space-y-3.5", plan.inheritsLabel ? "mt-3" : "mt-6")}>
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

            {/* CTA — pinned to the bottom so both cards align */}
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
        );
      })}
    </div>
  );
}
