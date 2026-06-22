"use client";

import { useState } from "react";
import {
  Award,
  Building2,
  Banknote,
  HandCoins,
  Sparkles,
  MapPin,
  ExternalLink,
  Info,
  ArrowRight,
  RotateCcw,
  type LucideIcon,
} from "lucide-react";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { OffsetCard } from "@/components/OffsetCard";
import { Badge } from "@/components/ui/badge";

/* ------------------------------------------------------------------------- *
 * Scheme catalogue — the single source of truth for both the cards grid AND
 * the recommendation navigator. Each `key` is referenced by the heuristic in
 * PART B so the two parts can never drift apart.
 * ------------------------------------------------------------------------- */
type SchemeKey =
  | "startup-india"
  | "msme"
  | "mudra"
  | "stand-up"
  | "pmegp"
  | "odop";

type Scheme = {
  key: SchemeKey;
  name: string;
  description: string;
  /** One-line "why this fits" shown in the navigator result. */
  why: string;
  href: string;
  Icon: LucideIcon;
};

const SCHEMES: Record<SchemeKey, Scheme> = {
  "startup-india": {
    key: "startup-india",
    name: "Startup India",
    description: "Recognition, funding & tax benefits.",
    why: "Best for recognising your startup and unlocking tax benefits as you grow.",
    href: "https://www.startupindia.gov.in",
    Icon: Award,
  },
  msme: {
    key: "msme",
    name: "MSME / Udyam",
    description: "Register your enterprise.",
    why: "The free Udyam registration that formally puts your enterprise on record.",
    href: "https://udyamregistration.gov.in",
    Icon: Building2,
  },
  mudra: {
    key: "mudra",
    name: "Mudra Loan",
    description: "Collateral-free loans up to Rs 20 lakh.",
    why: "A collateral-free loan to fund an early-stage small business.",
    href: "https://www.mudra.org.in",
    Icon: Banknote,
  },
  "stand-up": {
    key: "stand-up",
    name: "Stand-Up India",
    description: "Loans for women & SC/ST entrepreneurs.",
    why: "Dedicated bank loans for women and SC/ST entrepreneurs.",
    href: "https://www.standupmitra.in",
    Icon: HandCoins,
  },
  pmegp: {
    key: "pmegp",
    name: "PMEGP",
    description: "Funding for new micro-enterprises.",
    why: "Credit-linked subsidy support for setting up a new micro-enterprise.",
    href: "https://www.kviconline.gov.in/pmegpeportal/",
    Icon: Sparkles,
  },
  odop: {
    key: "odop",
    name: "ODOP (One District One Product)",
    description: "One-district-one-product opportunities.",
    why: "Taps district-level product opportunities, ideal for rural & agri ideas.",
    href: "https://www.startupindia.gov.in",
    Icon: MapPin,
  },
};

/** Stable display order for the cards grid. */
const SCHEME_ORDER: SchemeKey[] = [
  "startup-india",
  "msme",
  "mudra",
  "stand-up",
  "pmegp",
  "odop",
];

/* ------------------------------------------------------------------------- *
 * PART B navigator — the 3 questions and their answer options. Answers are
 * stored by their `value` and fed to a small, transparent heuristic.
 * ------------------------------------------------------------------------- */
type WhoValue = "student" | "woman" | "sc-st" | "rural" | "owner";
type NeedValue = "recognition" | "loan" | "register" | "district";
type StageValue = "idea" | "running";

const WHO_OPTIONS: { value: WhoValue; label: string }[] = [
  { value: "student", label: "Student / Youth" },
  { value: "woman", label: "Woman entrepreneur" },
  { value: "sc-st", label: "SC / ST entrepreneur" },
  { value: "rural", label: "Rural / Agri" },
  { value: "owner", label: "MSME / business owner" },
];

const NEED_OPTIONS: { value: NeedValue; label: string }[] = [
  { value: "recognition", label: "Recognition & tax benefits" },
  { value: "loan", label: "A small business loan" },
  { value: "register", label: "Register my enterprise" },
  { value: "district", label: "District product opportunity" },
];

const STAGE_OPTIONS: { value: StageValue; label: string }[] = [
  { value: "idea", label: "Just an idea" },
  { value: "running", label: "Already running" },
];

type Answers = {
  who?: WhoValue;
  need?: NeedValue;
  stage?: StageValue;
};

/**
 * Maps a complete set of answers to exactly ONE scheme. The logic is kept
 * simple and explainable on purpose — this is a friendly pointer, not advice.
 * Order matters: more specific (identity / district) rules win first.
 */
function recommend(answers: Required<Answers>): SchemeKey {
  const { who, need, stage } = answers;

  // Identity-based programmes take priority — they exist precisely for these groups.
  if (who === "woman" || who === "sc-st") return "stand-up";

  // Rural / agri or anyone explicitly after a district product opportunity.
  if (who === "rural" || need === "district") return "odop";

  // Explicit needs.
  if (need === "recognition") return "startup-india";
  if (need === "register") return "msme";
  if (need === "loan") {
    // A brand-new venture setting up from scratch leans on the PMEGP subsidy;
    // an already-running business gets a quick collateral-free Mudra loan.
    return stage === "idea" ? "pmegp" : "mudra";
  }

  // Fallback (no specific need chosen): early-stage founders get the PMEGP
  // micro-enterprise route, established ones go for Startup India recognition.
  return stage === "idea" ? "pmegp" : "startup-india";
}

/* ------------------------------------------------------------------------- *
 * Small presentational helper for one answer option button inside the navy
 * navigator panel. Kept local so the panel reads top-to-bottom.
 * ------------------------------------------------------------------------- */
function OptionButton({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={[
        "rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light",
        selected
          ? "border-brand-light bg-brand-light/15 text-primary-foreground"
          : "border-white/15 bg-white/5 text-primary-foreground/85 hover:border-white/30 hover:bg-white/10",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

/**
 * Section S8 — Government Scheme Hub.
 *
 * PART A: a grid of official scheme cards (each links out to the real portal).
 * PART B: a transparent 3-question navigator that recommends ONE scheme.
 *
 * Credibility guardrail: a visible disclaimer makes clear NEDC is independent
 * (not a government body) and only helps people understand & access these
 * official initiatives.
 */
export function SchemeHub() {
  const [answers, setAnswers] = useState<Answers>({});

  const complete =
    answers.who !== undefined &&
    answers.need !== undefined &&
    answers.stage !== undefined;

  const result = complete
    ? SCHEMES[recommend(answers as Required<Answers>)]
    : null;

  const reset = () => setAnswers({});

  return (
    <section id="schemes" className="scroll-mt-24 bg-background py-16 sm:py-24">
      <Container>
        <SectionHeading
          center
          eyebrow="Government schemes"
          title="Find the right government scheme for your idea."
          subtitle="India backs new founders with real programmes, from recognition and registration to collateral-free loans. Explore the official initiatives, then use the quick navigator to see which one fits you."
        />

        {/* ---------------------------------------------------------------- *
         * PART A — scheme cards grid
         * ---------------------------------------------------------------- */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SCHEME_ORDER.map((key) => {
            const scheme = SCHEMES[key];
            const { Icon } = scheme;
            return (
              <OffsetCard key={key} className="reveal h-full">
                <div className="flex h-full flex-col p-6">
                  <span
                    aria-hidden
                    className="inline-flex size-12 items-center justify-center rounded-2xl bg-panel text-primary"
                  >
                    <Icon className="size-6" />
                  </span>
                  <h3 className="mt-5 font-display text-lg font-bold leading-tight text-foreground">
                    {scheme.name}
                  </h3>
                  <p className="mt-2 flex-1 text-pretty text-sm leading-relaxed text-muted-foreground">
                    {scheme.description}
                  </p>
                  <a
                    href={scheme.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-navy-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                  >
                    Learn more
                    <ExternalLink className="size-4" aria-hidden />
                    <span className="sr-only"> (opens official portal in a new tab)</span>
                  </a>
                </div>
              </OffsetCard>
            );
          })}
        </div>

        {/* ---------------------------------------------------------------- *
         * PART B — "Which scheme fits you?" navigator (premium navy panel)
         * ---------------------------------------------------------------- */}
        <div className="relative mt-14 overflow-hidden rounded-3xl bg-primary px-6 py-10 text-primary-foreground shadow-float sm:px-10 sm:py-12">
          {/* Decorative dot grid for the premium feel. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-dot-grid-light opacity-60 mask-fade-edges"
          />

          <div className="relative">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-wider text-brand-light">
                Not sure which fits? Answer 3 questions
                <ArrowRight className="ml-1 inline size-4 align-[-2px]" aria-hidden />
              </p>
              <h3 className="mt-3 font-display text-fluid-h2 font-extrabold leading-tight tracking-tight">
                Which scheme fits you?
              </h3>
              <p className="mt-3 text-pretty leading-relaxed text-primary-foreground/80">
                Three quick questions and we&apos;ll point you to one official
                initiative to explore. No sign-up, nothing stored.
              </p>
            </div>

            {/* Questions */}
            <div className="mt-9 space-y-8">
              {/* Q1 — Who are you? */}
              <fieldset>
                <legend className="text-sm font-semibold text-primary-foreground/90">
                  1. Who are you?
                </legend>
                <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  {WHO_OPTIONS.map((opt) => (
                    <OptionButton
                      key={opt.value}
                      label={opt.label}
                      selected={answers.who === opt.value}
                      onClick={() =>
                        setAnswers((a) => ({ ...a, who: opt.value }))
                      }
                    />
                  ))}
                </div>
              </fieldset>

              {/* Q2 — What do you need most? */}
              <fieldset>
                <legend className="text-sm font-semibold text-primary-foreground/90">
                  2. What do you need most?
                </legend>
                <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {NEED_OPTIONS.map((opt) => (
                    <OptionButton
                      key={opt.value}
                      label={opt.label}
                      selected={answers.need === opt.value}
                      onClick={() =>
                        setAnswers((a) => ({ ...a, need: opt.value }))
                      }
                    />
                  ))}
                </div>
              </fieldset>

              {/* Q3 — Stage? */}
              <fieldset>
                <legend className="text-sm font-semibold text-primary-foreground/90">
                  3. What stage are you at?
                </legend>
                <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {STAGE_OPTIONS.map((opt) => (
                    <OptionButton
                      key={opt.value}
                      label={opt.label}
                      selected={answers.stage === opt.value}
                      onClick={() =>
                        setAnswers((a) => ({ ...a, stage: opt.value }))
                      }
                    />
                  ))}
                </div>
              </fieldset>
            </div>

            {/* Recommendation — appears once all 3 are answered. */}
            {result && (
              <div className="mt-9 rounded-2xl border border-white/15 bg-white/5 p-6 sm:p-7">
                <Badge
                  variant="brand"
                  className="bg-brand text-brand-foreground"
                >
                  <result.Icon className="size-3.5" aria-hidden />
                  Suggested for you
                </Badge>
                <h4 className="mt-3 font-display text-xl font-bold leading-tight text-brand-light">
                  {result.name}
                </h4>
                <p className="mt-2 max-w-2xl text-pretty leading-relaxed text-primary-foreground/85">
                  {result.why}
                </p>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <a
                    href={result.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
                  >
                    Visit official portal
                    <ExternalLink className="size-4" aria-hidden />
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                  <button
                    type="button"
                    onClick={reset}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-5 py-2.5 text-sm font-semibold text-primary-foreground/90 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-light focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
                  >
                    <RotateCcw className="size-4" aria-hidden />
                    Start over
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ---------------------------------------------------------------- *
         * CREDIBILITY — independence disclaimer (always visible)
         * ---------------------------------------------------------------- */}
        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-border bg-card p-5 text-sm leading-relaxed text-muted-foreground">
          <Info className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
          <p className="text-pretty">
            NEDC is an{" "}
            <span className="font-semibold text-foreground">
              independent organization and not a government body
            </span>
            . We only help you understand and access these official initiatives.
            We do not provide, approve, or guarantee any scheme or its benefits.
            Eligibility and scheme details may change; always confirm the latest
            information on the official government portal before applying.
          </p>
        </div>
      </Container>
    </section>
  );
}
