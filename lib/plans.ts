/**
 * Pricing CONTENT (name, tagline, feature lines) for the single course offering,
 * the "Advance Certificate Course". The PRICE itself is NOT here — it lives in the
 * DB (`cohorts.price_inr`) so it stays server-authoritative and editable in the
 * Supabase Table Editor. This file only drives what the pricing card SAYS; the
 * amount charged always comes from the DB via /api/checkout.
 *
 * HISTORY: NEDC previously sold two tiers (Basic / Premium). That was retired for
 * one plan. The `PlanId` union and the DB `plan` column still allow 'premium' so
 * the historical payment/enrollment ledger (and the dashboard's legacy badge) keep
 * working — but only the single 'basic' plan below is ever offered or sent now.
 *
 * `id` matches the `plan` value stored on payments/enrollments and sent to
 * /api/checkout. The single live plan uses 'basic' (the default checkout rail,
 * priced from `cohorts.price_inr`).
 */

export type PlanId = "basic" | "premium";

export type Plan = {
  id: PlanId;
  name: string;
  /** One-line value promise under the name. */
  tagline: string;
  /** Optional pill on the card (e.g. the "most popular" nudge). */
  badge?: string;
  /** Visually emphasized card — the one we steer people toward. */
  highlight?: boolean;
  /** Enroll button label. */
  ctaLabel: string;
  /** Rendered above the feature list on upsell tiers ("Everything in Basic, plus:"). */
  inheritsLabel?: string;
  /** Check-listed inclusions. For Premium these are the EXTRAS over Basic. */
  features: string[];
  /** Small reassurance/scarcity line under the features. */
  footnote?: string;
};

export const PLANS: Plan[] = [
  {
    id: "basic",
    name: "Advance Certificate Course",
    tagline:
      "One complete program: live mentor-led sessions plus personal 1-on-1 mentorship to actually launch, not just learn.",
    highlight: true,
    ctaLabel: "Enroll now",
    features: [
      "All live mentor-led sessions",
      "Every session recorded in your dashboard",
      "1-on-1 mentorship sessions",
      "Personal doubt-clearing sessions",
      "Career & business guidance with mentors",
      "Templates, worksheets & resources",
      "Live group Q&A with mentors",
      "An exclusive session to meet the Organiser, Dr. Bipin Kumar Srivastava",
      "Priority support throughout the program",
      "Certificate of Completion by NEDC",
    ],
    footnote: "Limited 1-on-1 mentorship seats per cohort.",
  },
];

/** Plan content lookup by id. Only the single live plan ('basic') is present;
 *  keyed by string since the retired 'premium' content no longer exists here. */
export const PLAN_BY_ID: Record<string, Plan> = PLANS.reduce(
  (acc, p) => ({ ...acc, [p.id]: p }),
  {} as Record<string, Plan>,
);
