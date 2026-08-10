import Link from "next/link";
import { CalendarDays } from "lucide-react";

import { Container } from "@/components/Container";
import { Logo } from "@/components/Logo";
import { WhatsappIcon } from "@/components/BrandIcons";
import { CONTACT } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { getFeaturedProgram, pickNextCohort } from "@/lib/queries";

/**
 * Shared chrome for the /edp funnel (landing page + /edp/thank-you): a
 * deliberately MINIMAL header (logo + start date, nothing to leak paid traffic
 * to) and a legal-links footer. Lives outside the (marketing) route group so
 * none of the site nav appears here.
 */
export default async function EdpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const featured = await getFeaturedProgram();
  const nextCohort = featured ? pickNextCohort(featured.cohorts) : null;
  // The campaign promises 27 July; fall back to the campaign date if the DB is
  // unreachable so the page never contradicts the ad.
  const startLabel = nextCohort
    ? formatDate(nextCohort.start_date)
    : "27 July 2026";
  const year = new Date().getFullYear();

  const whatsappHref = `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(
    "Hi NEDC, I'd like to know more about the EDP program.",
  )}`;

  return (
    <>
      {/* ---------- Minimal header: logo → home, nothing else to leak to ---------- */}
      <header className="border-b border-border bg-background">
        <Container className="flex h-16 items-center justify-between">
          <Logo
            withWordmark
            href="/"
            className="h-9 w-auto"
            wordmarkClassName="text-lg"
          />
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground sm:text-sm">
            <CalendarDays className="size-4 text-primary" aria-hidden />
            Starts <span className="font-semibold text-primary">{startLabel}</span>
          </span>
        </Container>
      </header>

      {children}

      {/* ---------- Minimal footer: legal + WhatsApp only ---------- */}
      <footer className="border-t border-border bg-panel/40 py-8">
        <Container className="flex flex-col items-center gap-4 text-center text-sm text-muted-foreground">
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {[
              { href: "/terms", label: "Terms & Conditions" },
              { href: "/privacy", label: "Privacy Policy" },
              { href: "/refund", label: "Refund & Cancellation" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="transition-colors hover:text-primary"
              >
                {l.label}
              </Link>
            ))}
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-medium text-foreground transition-colors hover:text-primary"
            >
              <WhatsappIcon className="size-4 text-[#25D366]" aria-hidden />
              WhatsApp {CONTACT.phone}
            </a>
          </nav>
          <p>
            © {year} NEDC, National Entrepreneurship Development Center. All
            rights reserved.
          </p>
        </Container>
      </footer>
    </>
  );
}
