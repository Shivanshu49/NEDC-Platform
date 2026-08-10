import { Clock } from "lucide-react";

import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { OffsetCard } from "@/components/OffsetCard";
import { EDP_CURRICULUM, EDP_SCHEDULE_NOTE } from "@/lib/content";

/**
 * The 6-day EDP curriculum, from the official
 * Schedule_of_EDP_Training_2026. Content lives in lib/content.ts (EDP_CURRICULUM)
 * so the home landing and the /program page render the same source of truth.
 */
export function Curriculum() {
  return (
    <section
      id="curriculum"
      className="scroll-mt-24 border-y border-border bg-panel/40 py-16 sm:py-24"
    >
      <Container>
        <SectionHeading
          center
          eyebrow="Curriculum"
          title="Your 6-day plan, session by session"
          subtitle="Two focused live sessions each day, from the entrepreneurial mindset to a finished, fundable project report."
        />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {EDP_CURRICULUM.map((day) => (
            <OffsetCard key={day.day} className="h-full">
              <div className="flex h-full flex-col p-6">
                <div className="flex items-center gap-3">
                  <span className="font-display flex size-11 flex-none items-center justify-center rounded-xl bg-primary text-lg font-extrabold tabular-nums text-primary-foreground">
                    {day.day}
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Day {day.day}
                    </p>
                    <h3 className="font-display text-lg font-bold tracking-tight text-foreground">
                      {day.theme}
                    </h3>
                  </div>
                </div>

                <ol className="mt-5 space-y-3.5">
                  {day.sessions.map((session, i) => (
                    <li key={session} className="flex items-start gap-3">
                      <span
                        aria-hidden
                        className="mt-0.5 flex size-5 flex-none items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold tabular-nums text-primary"
                      >
                        {i + 1}
                      </span>
                      <span className="text-pretty text-sm leading-relaxed text-muted-foreground">
                        {session}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </OffsetCard>
          ))}
        </div>

        <p className="mt-8 flex items-center justify-center gap-2 text-center text-sm text-muted-foreground">
          <Clock aria-hidden className="size-4 flex-none text-primary" />
          {EDP_SCHEDULE_NOTE}
        </p>
      </Container>
    </section>
  );
}
