import { ArrowRight, Check } from "lucide-react";

import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { VideoEmbed } from "@/components/VideoEmbed";
import { EDP_INTRO, EDP_OBJECTIVES, EDP_VIDEO_ID } from "@/lib/content";

/**
 * "What is the EDP?" — the program intro: a plain-language explanation, the
 * programme objectives, and an intro video (click-to-play). This is the #program
 * anchor target; the day-by-day plan lives in the Curriculum section below.
 */
export function AboutProgram() {
  return (
    <section id="program" className="scroll-mt-24 bg-background py-16 sm:py-24">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: what it is + objectives */}
          <div>
            <SectionHeading eyebrow="The Program" title="What is the EDP?" />
            <p className="mt-5 text-pretty text-lg leading-relaxed text-muted-foreground">
              {EDP_INTRO}
            </p>

            <ul className="mt-7 space-y-3.5">
              {EDP_OBJECTIVES.map((objective) => (
                <li key={objective} className="flex items-start gap-3">
                  <span
                    aria-hidden
                    className="mt-0.5 flex size-5 flex-none items-center justify-center rounded-full bg-brand/10"
                  >
                    <Check className="size-3.5 text-brand" strokeWidth={3} />
                  </span>
                  <span className="text-pretty text-sm leading-relaxed text-foreground">
                    {objective}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="#curriculum" variant="primary" className="group">
                See the 5-day plan
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
              <Button href="#register" variant="secondary">
                Register
              </Button>
            </div>
          </div>

          {/* Right: intro video */}
          <div>
            <VideoEmbed videoId={EDP_VIDEO_ID} title="What is the NEDC EDP?" />
            <p className="mt-3 text-center text-sm text-muted-foreground">
              A quick introduction to the program
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
