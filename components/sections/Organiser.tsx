import Image from "next/image";
import {
  Award,
  Building2,
  Crown,
  GraduationCap,
  Globe,
  type LucideIcon,
  Mic2,
} from "lucide-react";
import { Container } from "@/components/Container";
import { YoutubeIcon } from "@/components/BrandIcons";

/**
 * Section — "The Organiser".
 *
 * The founder spotlight: Dr. Bipin Kumar Srivastava conceived, organises, and
 * owns NEDC and its Entrepreneurship Development Program. Given that weight, the
 * section gets the same premium NAVY treatment as the Program band (grain +
 * dot-grid + soft glows), with the portrait in a glass card and a single maroon
 * accent (the "Founder & Organiser" chip + brand-light eyebrow). Server
 * component — purely presentational.
 */

// Fractal-noise grain (data-URI SVG) — the same faint film used on the other
// navy bands so this surface reads as a rich, textured navy, not flat fill.
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const HIGHLIGHTS: { icon: LucideIcon; text: string }[] = [
  { icon: GraduationCap, text: "Ph.D. & M.Sc. in Analytical Chemistry" },
  {
    icon: Building2,
    text: "Professor & Dean, Students' Welfare, Galgotias College of Engineering & Technology",
  },
  { icon: Award, text: "Mentor, NITTTR-AICTE training program" },
  { icon: Mic2, text: "Host of a YouTube podcast on technology & innovation" },
];

export function Organiser() {
  return (
    <section
      id="organiser"
      className="relative scroll-mt-24 overflow-hidden bg-primary py-20 text-primary-foreground sm:py-28"
    >
      {/* textured navy surface */}
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
        className="pointer-events-none absolute -left-40 top-0 size-[28rem] rounded-full bg-navy-soft/40 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 bottom-0 size-[26rem] rounded-full bg-brand/25 blur-3xl"
      />

      <Container className="relative grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        {/* ---------- Left: portrait in a glass card ---------- */}
        <div className="reveal relative mx-auto w-full max-w-sm lg:max-w-none">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-6 -top-6 size-40 rounded-full bg-brand/25 blur-2xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-8 -left-8 size-44 rounded-full bg-white/5 blur-2xl"
          />

          <div className="relative rounded-4xl border border-white/15 bg-white/[0.06] p-3 shadow-float backdrop-blur-sm sm:p-4">
            <Image
              src="/organiser/bipin-kumar-srivastava.jpg"
              alt="Dr. Bipin Kumar Srivastava, Founder & Organiser of NEDC, recording his YouTube podcast"
              width={1100}
              height={1650}
              sizes="(min-width: 1024px) 40rem, 90vw"
              className="aspect-[4/5] w-full rounded-3xl object-cover object-top"
            />

            {/* crafted inset ring so the photo sits in the card, not floating */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-3 rounded-3xl ring-1 ring-white/10 sm:inset-4"
            />

            {/* Floating chip — Founder & Organiser (the ONE maroon accent) */}
            <div className="absolute -left-3 bottom-8 flex items-center gap-2.5 rounded-2xl border border-border bg-card p-3 shadow-lift sm:-left-5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <Crown className="size-5" aria-hidden />
              </span>
              <div className="pr-1">
                <p className="text-sm font-semibold leading-tight text-foreground">
                  Founder &amp; Organiser
                </p>
                <p className="text-[11px] leading-tight text-muted-foreground">
                  of NEDC &amp; the EDP
                </p>
              </div>
            </div>

            {/* Floating chip — academic standing (navy, balances the accent 1:1) */}
            <div className="absolute -right-3 top-8 flex items-center gap-2.5 rounded-2xl border border-border bg-card p-3 shadow-lift sm:-right-5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <GraduationCap className="size-5" aria-hidden />
              </span>
              <div className="pr-1">
                <p className="text-sm font-semibold leading-tight text-foreground">
                  25+ years
                </p>
                <p className="text-[11px] leading-tight text-muted-foreground">
                  R&amp;D · teaching · admin
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ---------- Right: bio + credentials + CTAs ---------- */}
        <div className="relative">
          <p className="mb-3 inline-flex items-center gap-2.5 text-xs font-bold uppercase tracking-[0.16em] text-brand-light">
            <span aria-hidden className="h-px w-6 bg-brand-light/60" />
            The Organiser
          </p>

          <h2 className="font-display text-balance text-fluid-h2 font-bold tracking-tight">
            Dr. Bipin Kumar Srivastava
          </h2>

          <p className="mt-3 text-lg font-semibold text-brand-light">
            Founder &amp; Organiser, NEDC
          </p>
          <p className="mt-1 text-pretty text-sm font-medium text-primary-foreground/80">
            Professor &amp; Dean, Students&apos; Welfare, Galgotias College of
            Engineering &amp; Technology, Greater Noida
          </p>

          <div className="mt-6 space-y-4 text-pretty leading-relaxed text-primary-foreground/80">
            <p>
              Dr. Bipin Kumar Srivastava conceived, organises, and owns NEDC and
              its Entrepreneurship Development Program. A Ph.D. and M.Sc. in
              Analytical Chemistry, he brings 25 years across research &amp;
              development, innovation, teaching, and administration to the
              mission of turning India&apos;s youth into job creators.
            </p>
            <p>
              A self-motivated academic leader with keen analytical abilities and
              deep subject expertise, he has extensive experience mentoring,
              training, and developing people, and is a Mentor of the
              NITTTR-AICTE training program. He has delivered numerous talks on
              new technologies and emerging challenges, and carries that mission
              to a wider audience through his YouTube podcast.
            </p>
          </div>

          {/* Credential highlights — glass chips on navy */}
          <ul className="mt-8 grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3"
              >
                <span
                  aria-hidden
                  className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-brand-light"
                >
                  <Icon className="size-4" />
                </span>
                <span className="text-sm leading-snug text-primary-foreground/85">
                  {text}
                </span>
              </li>
            ))}
          </ul>

          {/* CTAs — portfolio + YouTube (open in a new tab) */}
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href="https://drbipin.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-card px-5 py-2.5 text-sm font-semibold text-primary shadow-lift transition hover:-translate-y-0.5 hover:bg-card/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
            >
              <Globe className="size-4" aria-hidden />
              Visit drbipin.in
            </a>
            <a
              href="https://www.youtube.com/@drbipinkumarsrivastava"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:-translate-y-0.5 hover:border-white/50 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
            >
              <YoutubeIcon className="size-4" />
              Watch the podcast
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}
