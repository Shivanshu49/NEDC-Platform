import { Award, BadgeCheck, GraduationCap, Share2 } from "lucide-react";

import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { Logo } from "@/components/Logo";
import { Badge } from "@/components/ui/badge";

/**
 * Section S11 — "Certification".
 *
 * Two columns on lg: the LEFT explains, honestly, what NEDC's Certificate of
 * Completion represents (no accreditation / government-endorsement claims); the
 * RIGHT is a DESIGNED certificate-preview MOCKUP rendered entirely in markup
 * (no photo) — a tilted landscape card with a refined double-border, a faint
 * guilloché/seal feel built from token tints, the NEDC mark, sample recipient
 * copy and a maroon-ribboned seal badge. An honest "Sample" Badge sits on top.
 *
 * Navy stays dominant; maroon is the single accent (the seal ribbon).
 */

// What the certificate honestly represents — kept truthful (no accreditation).
const points = [
  {
    icon: GraduationCap,
    text: "Confirms you completed NEDC's mentor-led Entrepreneurship Development Program (EDP).",
  },
  {
    icon: BadgeCheck,
    text: "Reflects the core skills you practised: ideation, validation, and building a viable business plan.",
  },
  {
    icon: Share2,
    text: "Yours to share on LinkedIn or add to your CV as proof of your entrepreneurship training.",
  },
];

export function Certification() {
  return (
    <section
      id="certification"
      className="scroll-mt-24 bg-background py-16 sm:py-24"
    >
      <Container>
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* LEFT — copy */}
          <div>
            <SectionHeading
              eyebrow="Certification"
              title="Earn a Certificate of Completion from NEDC."
              subtitle="Proof of your entrepreneurship training, a Certificate of Completion issued by NEDC when you finish the program."
            />

            <ul className="mt-8 space-y-4">
              {points.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <p className="text-pretty text-base leading-relaxed text-foreground">
                    {text}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {/* RIGHT — designed certificate-preview mockup (markup, not a photo) */}
          <div className="relative">
            {/* Honest "Sample" flag so this preview is never mistaken for a real cert. */}
            <Badge
              variant="outline"
              className="absolute -top-3 right-4 z-10 bg-card shadow-soft"
            >
              Sample
            </Badge>

            {/* The certificate card: landscape ~1.4/1, tilted with a float shadow. */}
            <div className="relative aspect-[1.4/1] w-full rounded-2xl bg-card shadow-float transition-transform duration-300 lg:rotate-2 lg:hover:rotate-0">
              {/* Faint guilloché / seal texture from the dot-grid helper, masked at
                  the edges so the double-border reads cleanly. */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-2xl bg-dot-grid opacity-60 mask-fade-edges"
              />

              {/* Refined double-border: outer navy hairline + inner inset frame. */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-2xl border border-primary/30"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-3 rounded-xl border border-primary/15 sm:inset-4"
              />

              {/* Certificate contents. */}
              <div className="relative flex h-full flex-col items-center justify-center px-6 py-7 text-center sm:px-10 sm:py-9">
                {/* NEDC mark — full stacked lockup (emblem + "NEDC" wordmark) as
                    the certificate letterhead, with the organisation name beneath. */}
                <Logo
                  variant="default"
                  withWordmark
                  orientation="vertical"
                  linked={false}
                  className="h-11 w-auto sm:h-12"
                  wordmarkClassName="text-xl sm:text-2xl"
                />

                <p className="mt-2.5 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground sm:text-xs">
                  National Entrepreneurship Development Center
                </p>

                <h3 className="font-display mt-3 text-xl font-extrabold tracking-tight text-foreground sm:text-2xl">
                  Certificate of Completion
                </h3>

                <p className="mt-4 text-xs text-muted-foreground sm:text-sm">
                  This certifies that
                </p>

                {/* Clearly-sample recipient line. */}
                <p className="font-display mt-1 border-b border-dashed border-primary/30 px-6 pb-1 text-lg font-bold text-primary sm:text-xl">
                  [Participant Name]
                </p>

                <p className="mt-4 max-w-xs text-pretty text-xs leading-relaxed text-muted-foreground sm:text-sm">
                  has successfully completed the{" "}
                  <span className="font-semibold text-foreground">
                    Entrepreneurship Development Program (EDP)
                  </span>
                </p>

                {/* Footer: signature line + maroon-ribboned seal (the lone accent). */}
                <div className="mt-6 flex w-full items-end justify-between gap-4 sm:mt-7">
                  <div className="flex flex-col items-start">
                    <span className="h-px w-24 bg-primary/30 sm:w-28" aria-hidden />
                    <span className="mt-1.5 text-[0.6rem] uppercase tracking-wider text-muted-foreground sm:text-[0.7rem]">
                      Authorized Signature
                    </span>
                  </div>

                  {/* Seal badge — maroon ribbon = the single deliberate accent. */}
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 text-brand ring-2 ring-brand/20 sm:h-14 sm:w-14"
                    aria-hidden
                  >
                    <Award className="h-7 w-7 sm:h-8 sm:w-8" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
