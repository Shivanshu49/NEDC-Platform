import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Container } from "@/components/Container";
import { Logo } from "@/components/Logo";
import { NewsletterForm } from "@/components/NewsletterForm";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  TelegramIcon,
  YoutubeIcon,
} from "@/components/BrandIcons";
import { CONTACT } from "@/lib/content";

const LINK_COLUMNS = [
  {
    title: "Program",
    links: [
      { href: "/#program", label: "EDP Program" },
      { href: "/#register", label: "Register Now" },
      { href: "/#mentors", label: "Mentors" },
      { href: "/#faq", label: "FAQ" },
    ],
  },
  {
    title: "About",
    links: [
      { href: "/#about", label: "About NEDC" },
      { href: "/#schemes", label: "Govt. schemes" },
      { href: "/team", label: "Our team" },
      { href: "/login", label: "Student login" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/terms", label: "Terms & Conditions" },
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/refund", label: "Refund & Cancellation" },
      { href: "/shipping", label: "Shipping & Delivery" },
    ],
  },
];

const SOCIALS = [
  { href: CONTACT.socials.facebook, label: "Facebook", icon: FacebookIcon },
  { href: CONTACT.socials.instagram, label: "Instagram", icon: InstagramIcon },
  { href: CONTACT.socials.linkedin, label: "LinkedIn", icon: LinkedinIcon },
  { href: CONTACT.socials.youtube, label: "YouTube", icon: YoutubeIcon },
  { href: CONTACT.socials.telegram, label: "Telegram", icon: TelegramIcon },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-24 overflow-hidden bg-panel">
      {/* subtle wavy background pattern */}
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full text-primary/5"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern id="footer-wave" width="240" height="120" patternUnits="userSpaceOnUse">
            <path d="M0 60 C 60 10, 180 110, 240 60" fill="none" stroke="currentColor" strokeWidth="2" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#footer-wave)" />
      </svg>

      <Container className="relative py-16">
        {/* Top: brand + newsletter */}
        <div className="grid gap-10 border-b border-border pb-12 lg:grid-cols-2">
          <div className="max-w-sm">
            <Logo className="h-14 w-auto" />
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              The National Entrepreneurship Development Center empowers youth,
              students, professionals, women, and rural communities to become
              innovators, startup founders, and job creators.
            </p>
            <div className="mt-5 flex gap-2">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex size-9 items-center justify-center rounded-full bg-card text-muted-foreground shadow-sm transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <s.icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="lg:justify-self-end lg:text-right">
            <h2 className="font-display text-2xl font-bold text-foreground">
              Stay updated on the next program
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Be first to hear when EDP registration opens. No spam.
            </p>
            <div className="mt-5 lg:ml-auto">
              <NewsletterForm source="footer" />
            </div>
          </div>
        </div>

        {/* Link columns + contact */}
        <div className="grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
          {LINK_COLUMNS.map((col) => (
            <nav key={col.title}>
              <p className="text-sm font-semibold text-foreground">{col.title}</p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
          <div>
            <p className="text-sm font-semibold text-foreground">Contact</p>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Phone className="size-4 shrink-0 text-primary" />
                <a href={`tel:${CONTACT.phone.replace(/\s/g, "")}`} className="hover:text-primary">
                  {CONTACT.phone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="size-4 shrink-0 text-primary" />
                <a href={`mailto:${CONTACT.email}`} className="hover:text-primary">
                  {CONTACT.email}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>{CONTACT.address}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-3 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} NEDC, National Entrepreneurship Development Center. All rights reserved.</p>
          <nav className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {[
              { href: "/terms", label: "Terms" },
              { href: "/privacy", label: "Privacy" },
              { href: "/refund", label: "Refunds" },
              { href: "/pricing", label: "Pricing" },
              { href: "/shipping", label: "Shipping" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="transition-colors hover:text-primary"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </Container>
    </footer>
  );
}
