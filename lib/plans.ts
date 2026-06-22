/**
 * Pricing-tier CONTENT (names, taglines, feature lines). The PRICE itself is
 * NOT here — it lives in the DB (`cohorts.price_inr` for Basic,
 * `cohorts.price_premium_inr` for Premium) so it stays server-authoritative and
 * editable in the Supabase Table Editor. This file only drives what the pricing
 * cards SAY; the amount charged always comes from the DB via /api/checkout.
 *
 * `id` matches the `plan` value stored on payments/enrollments and sent to
 * /api/checkout ('basic' | 'premium').
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
    name: "Basic",
    tagline: "Everything you need to learn the program and get certified.",
    ctaLabel: "Enroll in Basic",
    features: [
      "All live mentor-led sessions",
      "Every session recorded in your dashboard",
      "Templates, worksheets & resources",
      "Live group Q&A with mentors",
      "Certificate of Completion by NEDC",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    tagline: "Personal mentorship to actually launch, not just learn.",
    badge: "Most popular",
    highlight: true,
    ctaLabel: "Enroll in Premium",
    inheritsLabel: "Everything in Basic, plus:",
    features: [
      "1-on-1 mentorship sessions",
      "Personal doubt-clearing sessions",
      "Career & business guidance with mentors",
      "An exclusive session to meet the Organiser, Dr. Bipin Kumar Srivastava",
      "Priority support throughout the program",
    ],
    footnote: "Limited 1-on-1 mentorship seats per cohort.",
  },
];

/** Plan content lookup by id. */
export const PLAN_BY_ID: Record<PlanId, Plan> = PLANS.reduce(
  (acc, p) => ({ ...acc, [p.id]: p }),
  {} as Record<PlanId, Plan>,
);
