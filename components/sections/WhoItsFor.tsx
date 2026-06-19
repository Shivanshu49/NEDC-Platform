import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { OffsetCard } from "@/components/OffsetCard";
import {
  GraduationCap,
  Sparkles,
  Sprout,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

/**
 * Section S7 — "Who it's for".
 *
 * Four equal-height audience cards on a soft navy band. Uses the site's
 * signature OffsetCard with a subtle hover lift, an icon tile per card, and the
 * `reveal` scroll-in. Single maroon accent per card (the icon tile) keeps the
 * navy-dominant / maroon-as-spice proportion intact.
 *
 * Copy is intentionally honest and learning-first — these are the audiences the
 * EDP is built to teach, no overclaiming.
 */

type Audience = {
  icon: LucideIcon;
  title: string;
  copy: string;
};

const AUDIENCES: Audience[] = [
  {
    icon: GraduationCap,
    title: "Students & Youth",
    copy: "Start before you graduate.",
  },
  {
    icon: Sparkles,
    title: "Women Entrepreneurs",
    copy: "A supportive path to building your own business.",
  },
  {
    icon: Sprout,
    title: "Rural & Agri Entrepreneurs",
    copy: "Opportunities close to home (ODOP, agri-startups).",
  },
  {
    icon: TrendingUp,
    title: "Working Professionals",
    copy: "Turn experience into your own venture.",
  },
];

export function WhoItsFor() {
  return (
    <section
      id="who"
      className="relative scroll-mt-24 overflow-hidden bg-panel/50 py-16 sm:py-24"
    >
      {/* Faint navy dot grid, faded at the edges — decorative only. */}
      <div
        aria-hidden
        className="bg-dot-grid mask-fade-edges pointer-events-none absolute inset-0 opacity-60"
      />

      <Container className="relative">
        <SectionHeading
          eyebrow="Who it's for"
          title="Built for every kind of founder"
        />

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {AUDIENCES.map(({ icon: Icon, title, copy }) => (
            <OffsetCard
              key={title}
              className="reveal h-full transition-transform duration-200 hover:-translate-y-1"
              innerClassName="flex flex-col p-6 transition-shadow duration-200 group-hover:shadow-lift"
            >
              {/* Icon tile — the section's single maroon accent per card. */}
              <span
                aria-hidden
                className="inline-flex size-12 items-center justify-center rounded-xl bg-brand/10 text-brand"
              >
                <Icon className="size-6" />
              </span>

              <h3 className="font-display mt-5 text-lg font-bold leading-snug tracking-tight text-foreground">
                {title}
              </h3>
              <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">
                {copy}
              </p>
            </OffsetCard>
          ))}
        </div>
      </Container>
    </section>
  );
}
