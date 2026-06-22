import type { Metadata } from "next";
import {
  Building2,
  Check,
  Lightbulb,
  Rocket,
  Target,
  TrendingUp,
} from "lucide-react";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { OffsetCard } from "@/components/OffsetCard";
import { TeamCard } from "@/components/TeamCard";
import { EmptyState } from "@/components/EmptyState";
import { Organiser } from "@/components/sections/Organiser";
import { getTeamMembers } from "@/lib/queries";
import { MISSION, VISION_FULL, WELCOME_MESSAGE } from "@/lib/content";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "About",
  description:
    "About NEDC — our vision to build a strong entrepreneurial ecosystem, our mission, why entrepreneurship matters for national development, and the team behind it.",
};

const OBJECTIVES = [
  "Deliver quality Entrepreneurship Development Programs online and offline.",
  "Encourage innovation, startup culture, self-employment, and leadership.",
  "Spread awareness of government schemes, MSME support, and tech opportunities.",
  "Support founders with mentorship, networking, and incubation guidance.",
];

const WHY = [
  {
    icon: Rocket,
    title: "Employment generation",
    body: "Entrepreneurs don't just find jobs — they create them for their communities.",
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    body: "New ideas and ventures solve real problems and move the country forward.",
  },
  {
    icon: TrendingUp,
    title: "Economic growth",
    body: "A strong startup ecosystem drives sustainable, long-term economic growth.",
  },
  {
    icon: Building2,
    title: "Nation building",
    body: "Self-reliant, visionary founders are the foundation of a stronger India.",
  },
];

const NATIONAL_GOALS = [
  "Promote self-employment and reduce dependence on traditional jobs.",
  "Strengthen the Startup India and MSME ecosystems.",
  "Empower women and rural communities as entrepreneurs.",
  "Drive a self-reliant (Atmanirbhar) and innovation-led economy.",
];

export default async function AboutPage() {
  const team = await getTeamMembers();

  return (
    <>
      {/* Intro */}
      <section className="bg-panel/50 py-16 sm:py-24">
        <Container>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            About NEDC
          </p>
          <h1 className="font-display mt-3 max-w-3xl text-balance text-fluid-h1 font-extrabold tracking-tight text-foreground">
            Building India&apos;s entrepreneurial ecosystem
          </h1>
          <p className="mt-6 max-w-2xl leading-relaxed text-muted-foreground">
            The National Entrepreneurship Development Center (NEDC) empowers
            individuals with entrepreneurial knowledge, practical skills, startup
            guidance, and leadership development — turning aspiring founders into
            creators of opportunity.
          </p>
        </Container>
      </section>

      {/* Objectives */}
      <section className="py-16 sm:py-24">
        <Container>
          <SectionHeading eyebrow="Objectives" title="What we set out to do" />
          <div className="mt-12 grid gap-x-6 gap-y-8 sm:grid-cols-2">
            {OBJECTIVES.map((obj, i) => (
              <OffsetCard key={i}>
                <div className="flex gap-4 p-6">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand">
                    <Check className="size-5" />
                  </span>
                  <p className="pt-1.5 text-sm leading-relaxed text-foreground">
                    {obj}
                  </p>
                </div>
              </OffsetCard>
            ))}
          </div>
        </Container>
      </section>

      {/* Vision & Mission (verbatim) */}
      <section className="border-y border-border bg-panel/50 py-16 sm:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <Target className="size-3.5" />
                Vision
              </span>
              <h2 className="font-display mt-4 text-2xl font-bold text-foreground sm:text-3xl">
                Our vision
              </h2>
              <div className="mt-5 space-y-4">
                {VISION_FULL.map((para, i) => (
                  <p key={i} className="leading-relaxed text-muted-foreground">
                    {para}
                  </p>
                ))}
              </div>
            </div>
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-brand/15 px-3 py-1 text-xs font-semibold text-brand">
                <Rocket className="size-3.5" />
                Mission
              </span>
              <h2 className="font-display mt-4 text-2xl font-bold text-foreground sm:text-3xl">
                Our mission
              </h2>
              <ul className="mt-5 space-y-3">
                {MISSION.map((point, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Check className="size-3" />
                    </span>
                    <span className="text-sm leading-relaxed text-foreground">
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* Why Entrepreneurship */}
      <section className="py-16 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="Why entrepreneurship?"
            title="More than a career — a tool for nation building"
            center
          />
          <div className="mt-14 grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {WHY.map((w) => (
              <OffsetCard key={w.title}>
                <div className="p-6">
                  <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <w.icon className="size-6" />
                  </span>
                  <h3 className="mt-4 font-semibold text-foreground">{w.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {w.body}
                  </p>
                </div>
              </OffsetCard>
            ))}
          </div>
        </Container>
      </section>

      {/* National development goals */}
      <section className="border-y border-border bg-panel/50 py-16 sm:py-24">
        <Container className="max-w-3xl">
          <SectionHeading
            eyebrow="National development goals"
            title="Aligned with India's growth agenda"
            center
          />
          <ul className="mt-10 grid gap-4">
            {NATIONAL_GOALS.map((goal, i) => (
              <li
                key={i}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-sm text-foreground shadow-sm"
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand">
                  <Check className="size-4" />
                </span>
                {goal}
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Welcome message (verbatim) */}
      <section className="py-16 sm:py-24">
        <Container className="max-w-3xl">
          <SectionHeading eyebrow="Welcome" title="A message from NEDC" center />
          <div className="mt-10 space-y-5">
            {WELCOME_MESSAGE.map((para, i) => (
              <p
                key={i}
                className={
                  i === 0
                    ? "font-display text-xl font-semibold text-foreground"
                    : "leading-relaxed text-muted-foreground"
                }
              >
                {para}
              </p>
            ))}
          </div>
        </Container>
      </section>

      {/* Founder & Organiser spotlight */}
      <Organiser />

      {/* Leadership / advisory team */}
      <section className="border-t border-border bg-panel/50 py-16 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="Leadership & advisory"
            title="The team behind NEDC"
            subtitle="A team committed to mentoring the next generation of founders."
            center
          />
          {team.length > 0 ? (
            <div className="mt-14 grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
              {team.map((member) => (
                <TeamCard key={member.id} member={member} />
              ))}
            </div>
          ) : (
            <div className="mx-auto mt-12 max-w-2xl">
              <EmptyState message="Leadership & advisory team profiles will appear here. Add rows to the 'team_members' table in Supabase (or run supabase/seed.sql)." />
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
