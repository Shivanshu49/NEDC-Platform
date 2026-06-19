import { BadgeCheck, CircleSlash, GraduationCap, ShieldCheck } from "lucide-react";

import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { OffsetCard } from "@/components/OffsetCard";
import { Button } from "@/components/Button";
import { MISSION } from "@/lib/content";

/**
 * S14 — "About & Credibility": the trust anchor for the homepage.
 *
 * Credibility is the whole point of this section, so the copy is intentionally
 * honest and non-overclaiming:
 *  - the org's legal status is rendered as an OBVIOUS placeholder span
 *    (`[legal status — to be confirmed]`) until the real registered status is
 *    known — we never assert a specific one.
 *  - a "What we are / What we're not" pair makes the boundaries explicit: NEDC
 *    is an independent LEARNING platform, NOT a government body, and is
 *    independent of official bodies such as NEDB and NIESBUD.
 *
 * Server component — purely presentational, no client interactivity.
 */
export function AboutCredibility() {
  return (
    <section id="about" className="scroll-mt-24 bg-background py-16 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="About NEDC"
          title="About NEDC."
          center
        />

        {/* Lead body — verbatim, with the legal status held as a visible placeholder. */}
        <p className="mx-auto mt-6 max-w-3xl text-pretty text-center text-base leading-relaxed text-muted-foreground sm:text-lg">
          The National Entrepreneurship Development Center (NEDC) is a{" "}
          <span className="mx-0.5 inline-block rounded bg-brand/10 px-1.5 py-0.5 align-baseline text-sm font-medium text-brand">
            [legal status — to be confirmed]
          </span>{" "}
          organization helping individuals across India learn entrepreneurship,
          build businesses, and access opportunities. We help our learners
          understand and navigate national initiatives such as Startup India,
          MSME, and Skill India.
        </p>

        {/* Clarity block — explicit boundaries to keep affiliation language honest. */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:mt-14 sm:grid-cols-2">
          {/* What we are */}
          <OffsetCard className="reveal" innerClassName="flex flex-col p-7">
            <div className="flex items-center gap-3">
              <span
                aria-hidden
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground"
              >
                <BadgeCheck className="h-5 w-5" />
              </span>
              <h3 className="font-display text-lg font-bold tracking-tight text-foreground">
                What we are
              </h3>
            </div>
            <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
              An independent entrepreneurship{" "}
              <span className="font-semibold text-foreground">learning platform</span>{" "}
              — a mentor-led Entrepreneurship Development Program (EDP), delivered
              online &amp; hybrid, with a Certificate of Completion.
            </p>
            <ul className="mt-5 space-y-2.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2.5">
                <GraduationCap
                  aria-hidden
                  className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                />
                <span>Mentor-led EDP, online &amp; hybrid</span>
              </li>
              <li className="flex items-start gap-2.5">
                <ShieldCheck
                  aria-hidden
                  className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                />
                <span>Certificate of Completion on finishing the program</span>
              </li>
            </ul>
          </OffsetCard>

          {/* What we're not — the credibility guardrail. */}
          <OffsetCard className="reveal" innerClassName="flex flex-col p-7">
            <div className="flex items-center gap-3">
              <span
                aria-hidden
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand"
              >
                <CircleSlash className="h-5 w-5" />
              </span>
              <h3 className="font-display text-lg font-bold tracking-tight text-foreground">
                What we&apos;re not
              </h3>
            </div>
            <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
              NEDC is{" "}
              <span className="font-semibold text-foreground">not a government body</span>{" "}
              and is independent of official bodies such as{" "}
              <span className="font-semibold text-foreground">NEDB</span> and{" "}
              <span className="font-semibold text-foreground">NIESBUD</span>.
            </p>
            <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
              We help you understand and access government initiatives — we do
              not run them.
            </p>
          </OffsetCard>
        </div>

        {/* Compact mission strip — official wording, kept concise. */}
        <div className="mx-auto mt-12 max-w-4xl rounded-3xl bg-panel/50 p-7 sm:mt-14 sm:p-9">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">
            Our mission
          </h3>
          <ul className="mt-5 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
            {MISSION.map((point, i) => (
              <li key={i} className="flex items-start gap-3">
                <span
                  aria-hidden
                  className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-card text-xs font-bold text-primary shadow-soft"
                >
                  {i + 1}
                </span>
                <span className="text-pretty text-sm leading-relaxed text-muted-foreground">
                  {point}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA to the full About page. */}
        <div className="mt-10 text-center">
          <Button href="/about" variant="secondary">
            Read more about NEDC
          </Button>
        </div>
      </Container>
    </section>
  );
}
