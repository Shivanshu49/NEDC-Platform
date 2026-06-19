import {
  Brain,
  ClipboardList,
  Landmark,
  Lightbulb,
  type LucideIcon,
  Users,
} from "lucide-react";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";

/**
 * Section S6 — "The Founder Journey".
 *
 * A 5-step path showing the end-to-end support NEDC offers, not a one-off class.
 * Layout adapts:
 *   - lg+   → HORIZONTAL row of 5 steps joined by a single connector line, each
 *             with a numbered node (01–05) sitting on the line.
 *   - mobile → VERTICAL stack with a left rail/connector behind numbered nodes.
 *
 * Navy carries the design; maroon appears once — the final node (05) — to mark
 * the "you've arrived in the community" milestone. Steps get the `reveal` class
 * for a subtle scroll-in.
 */

type Step = {
  title: string;
  description: string;
  icon: LucideIcon;
};

const STEPS: Step[] = [
  {
    title: "Mindset & Awareness",
    description: "See yourself as a creator of opportunity.",
    icon: Brain,
  },
  {
    title: "Skills & Business Planning",
    description: "Learn how a business actually works.",
    icon: ClipboardList,
  },
  {
    title: "Idea to Venture",
    description: "Shape and test your business idea.",
    icon: Lightbulb,
  },
  {
    title: "Funding & Government Schemes",
    description: "Find the right scheme and apply.",
    icon: Landmark,
  },
  {
    title: "Mentorship & Community",
    description: "Keep going with mentors and fellow founders.",
    icon: Users,
  },
];

export function FounderJourney() {
  return (
    <section
      id="journey"
      className="scroll-mt-24 bg-background py-16 sm:py-24"
    >
      <Container>
        <SectionHeading
          eyebrow="Your path"
          title="The founder journey — end to end"
          subtitle="This isn't a one-off class. It's ongoing support that walks with you from a first spark of an idea to a venture and a community that keeps you going."
        />

        {/* ---------- Desktop: horizontal stepper (lg and up) ---------- */}
        <ol className="mt-16 hidden lg:grid lg:grid-cols-5">
          {STEPS.map((step, i) => {
            const isLast = i === STEPS.length - 1;
            const Icon = step.icon;
            return (
              <li key={step.title} className="reveal relative flex flex-col">
                {/* Connector line running through the node row. The segment
                    leading into the FINAL node carries the maroon accent. */}
                {!isLast && (
                  <span
                    aria-hidden
                    className={`absolute left-1/2 top-5 -z-0 h-px w-full ${
                      i === STEPS.length - 2 ? "bg-brand/60" : "bg-border"
                    }`}
                  />
                )}

                {/* Numbered node — navy, except the final milestone (maroon). */}
                <span
                  className={`relative z-10 flex size-10 items-center justify-center rounded-full text-sm font-semibold tabular-nums shadow-soft ${
                    isLast
                      ? "bg-brand text-brand-foreground"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* Step body */}
                <div className="mt-6 pr-6">
                  <span
                    aria-hidden
                    className={`flex size-12 items-center justify-center rounded-xl ${
                      isLast ? "bg-brand/10 text-brand" : "bg-primary/10 text-primary"
                    }`}
                  >
                    <Icon className="size-6" />
                  </span>
                  <h3 className="font-display mt-4 text-base font-bold leading-snug text-foreground text-balance">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
                    {step.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>

        {/* ---------- Mobile / tablet: vertical stepper (below lg) ---------- */}
        <ol className="mt-12 lg:hidden">
          {STEPS.map((step, i) => {
            const isLast = i === STEPS.length - 1;
            const Icon = step.icon;
            return (
              <li key={step.title} className="reveal relative flex gap-5 pb-10 last:pb-0">
                {/* Left rail/connector behind the node. The segment leading
                    into the FINAL node carries the maroon accent. */}
                {!isLast && (
                  <span
                    aria-hidden
                    className={`absolute left-5 top-10 -z-0 w-px ${
                      i === STEPS.length - 2 ? "bg-brand/60" : "bg-border"
                    }`}
                    style={{ bottom: 0 }}
                  />
                )}

                {/* Numbered node */}
                <span
                  className={`relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold tabular-nums shadow-soft ${
                    isLast
                      ? "bg-brand text-brand-foreground"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* Step body */}
                <div className="pt-0.5">
                  <div className="flex items-center gap-3">
                    <span
                      aria-hidden
                      className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${
                        isLast
                          ? "bg-brand/10 text-brand"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      <Icon className="size-5" />
                    </span>
                    <h3 className="font-display text-base font-bold leading-snug text-foreground text-balance">
                      {step.title}
                    </h3>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
                    {step.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </Container>
    </section>
  );
}
