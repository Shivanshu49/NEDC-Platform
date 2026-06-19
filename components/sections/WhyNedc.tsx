import Image from "next/image";
import { Compass, MessageSquareHeart, Wrench } from "lucide-react";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";

/**
 * Section S4 — "Why NEDC: the mindset shift".
 *
 * Editorial two-column band (copy + founder-energy imagery) that frames NEDC as
 * a learning experience, not just a course. Learning-first message is dominant;
 * "create a job, don't look for one" stays a supporting line, never a headline.
 *
 * Brand proportion: navy carries the copy + two of the three icon tiles; a
 * single maroon icon tile (the mentorship point) is the one deliberate accent
 * so we stay within the ~20% maroon budget for the section.
 */

// The three supporting points. Honest, concrete sentences — no invented stats,
// no overclaiming. Each pairs with an icon tile; `accent` flags the lone maroon.
const POINTS = [
  {
    Icon: Compass,
    accent: false,
    title: "Think like a founder",
    body: "Shift from looking for a job to spotting opportunities — learn to validate an idea, weigh risk, and make decisions like an owner.",
  },
  {
    Icon: Wrench,
    accent: false,
    title: "Build real business skills",
    body: "Practical training in planning, finance basics, marketing, and the government schemes you can tap — skills you apply to your own venture.",
  },
  {
    Icon: MessageSquareHeart,
    accent: true,
    title: "Get guidance, not just lectures",
    body: "Real mentorship and a step-by-step path, so you move forward with people who answer your questions — not only watch sessions alone.",
  },
] as const;

export function WhyNedc() {
  return (
    <section id="why" className="scroll-mt-24 bg-background py-16 sm:py-24">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* ---------- Left: editorial copy + supporting points ---------- */}
          <div className="max-w-xl">
            <SectionHeading
              eyebrow="Why NEDC"
              title="More than a course — a mindset shift."
            />

            <p className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground">
              Most people are taught to look for a job. NEDC teaches you to
              create one. Through practical training, real mentorship, and a
              step-by-step path, you&apos;ll learn to think and build like an
              entrepreneur — and turn your idea into a venture.
            </p>

            <ul className="mt-10 space-y-6">
              {POINTS.map(({ Icon, accent, title, body }) => (
                <li key={title} className="reveal flex gap-4">
                  {/* Icon tile — navy by default; one maroon accent (mentorship). */}
                  <span
                    aria-hidden
                    className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${
                      accent
                        ? "bg-brand/10 text-brand"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    <Icon className="size-6" />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-bold leading-snug text-foreground">
                      {title}
                    </h3>
                    <p className="mt-1.5 text-pretty leading-relaxed text-muted-foreground">
                      {body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* ---------- Right: founder-energy image in a premium framed card ---------- */}
          {/* Mirrors the home hero's image-card treatment: soft tinted glows behind
              a white rounded-3xl card, inset ring + gentle navy scrim, one floating
              proof chip. */}
          <div className="relative">
            {/* soft tinted glows behind the card (navy + a touch of maroon) */}
            <div
              aria-hidden
              className="pointer-events-none absolute -left-8 -top-8 size-44 rounded-full bg-panel blur-2xl"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-10 -right-6 size-40 rounded-full bg-pale blur-2xl"
            />

            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="relative rounded-3xl border border-border bg-card p-3 shadow-float sm:p-4">
                <Image
                  src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1000&q=80"
                  alt="A small, diverse team of young Indian founders gathered around a laptop, brainstorming and sketching out their startup idea together"
                  width={1000}
                  height={800}
                  sizes="(min-width: 1024px) 32rem, 90vw"
                  className="aspect-4/3 w-full rounded-2xl object-cover"
                />

                {/* crafted inset ring + gentle navy scrim so the floating chip stays legible */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-3 rounded-2xl ring-1 ring-foreground/10 sm:inset-4"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-3 rounded-2xl bg-linear-to-t from-primary/15 via-transparent to-transparent sm:inset-4"
                />

                {/* Floating proof chip — the learning promise (navy, holds the ratio) */}
                <div className="absolute -bottom-4 left-6 flex items-center gap-2.5 rounded-2xl border border-border bg-card p-3 shadow-lift sm:-left-5">
                  <span
                    aria-hidden
                    className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary"
                  >
                    <Compass className="size-5" />
                  </span>
                  <div className="pr-1">
                    <p className="text-sm font-semibold leading-tight text-foreground">
                      Learn by building
                    </p>
                    <p className="text-[11px] leading-tight text-muted-foreground">
                      mentor-led, step-by-step
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
