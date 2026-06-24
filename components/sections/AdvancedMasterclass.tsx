import {
  ArrowRight,
  Banknote,
  Check,
  Globe,
  LineChart,
  type LucideIcon,
  Workflow,
} from "lucide-react";

import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { MASTERCLASS } from "@/lib/content";

/**
 * The EDP Advanced Masterclass — a premium navy band that pitches the advanced
 * course program for existing business owners. Sits between the foundation EDP
 * curriculum (light) and the Founder Journey (light) so the deep navy reads as a
 * deliberate "next level" beat. Copy comes from `MASTERCLASS` in lib/content.
 */

// Map the content's icon names to real lucide icons (content stays framework-light).
const PILLAR_ICONS: Record<string, LucideIcon> = {
  Workflow,
  Banknote,
  Globe,
  LineChart,
};

// Fractal-noise grain (matches the other navy bands) so the navy reads as a
// rich, textured surface instead of flat fill.
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export function AdvancedMasterclass() {
  return (
    <section
      id="masterclass"
      className="relative scroll-mt-24 overflow-hidden bg-primary py-20 text-primary-foreground sm:py-28"
    >
      {/* Decoration — same crafted surface as the Focus Areas band. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.22] mix-blend-soft-light"
        style={{ backgroundImage: GRAIN }}
      />
      <div
        aria-hidden
        className="bg-dot-grid-light mask-fade-edges pointer-events-none absolute inset-0 opacity-50"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-10 size-[28rem] rounded-full bg-navy-soft/40 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 bottom-0 size-[26rem] rounded-full bg-brand/25 blur-3xl"
      />

      <Container className="relative">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 inline-flex items-center justify-center gap-2.5 text-xs font-bold uppercase tracking-[0.16em] text-brand-light">
            <span aria-hidden className="h-px w-6 bg-brand-light/60" />
            {MASTERCLASS.eyebrow}
          </p>
          <h2 className="font-display text-balance text-fluid-h2 font-bold tracking-tight">
            {MASTERCLASS.title}
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-primary-foreground/75">
            {MASTERCLASS.intro}
          </p>
        </div>

        {/* Value pillars — glass cards with a maroon icon tile + hover glow. */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {MASTERCLASS.pillars.map((pillar) => {
            const Icon = PILLAR_ICONS[pillar.icon] ?? Workflow;
            return (
              <div
                key={pillar.title}
                className="group reveal relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] p-6 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:border-brand/50 hover:bg-white/[0.08]"
              >
                <span className="relative flex size-12 items-center justify-center rounded-xl bg-white/10 text-brand-light transition-colors duration-300 group-hover:bg-brand group-hover:text-white">
                  <Icon className="size-6" />
                </span>
                <h3 className="relative mt-5 text-lg font-bold">{pillar.title}</h3>
                <p className="relative mt-2 text-sm leading-relaxed text-primary-foreground/70">
                  {pillar.body}
                </p>
                <div
                  aria-hidden
                  className="pointer-events-none absolute -bottom-16 left-1/2 size-40 -translate-x-1/2 rounded-full bg-brand/30 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
                />
              </div>
            );
          })}
        </div>

        {/* Supporting proof line. */}
        <ul className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2.5 text-sm font-medium text-primary-foreground/80">
          {MASTERCLASS.highlights.map((highlight) => (
            <li key={highlight} className="inline-flex items-center gap-2">
              <Check className="size-4 shrink-0 text-brand-light" strokeWidth={3} />
              {highlight}
            </li>
          ))}
        </ul>

        {/* CTA — light button for contrast on navy; points to #register. */}
        <div className="mt-12 flex flex-col items-center">
          <Button
            href="#register"
            variant="primary"
            size="lg"
            className="group bg-card text-primary shadow-xl shadow-primary/25 hover:-translate-y-0.5 hover:bg-card/90"
          >
            {MASTERCLASS.ctaLabel}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
          <p className="mt-5 max-w-md text-center text-sm text-primary-foreground/65">
            {MASTERCLASS.footnote}
          </p>
        </div>
      </Container>
    </section>
  );
}
