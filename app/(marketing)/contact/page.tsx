import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { OffsetCard } from "@/components/OffsetCard";
import { ContactForm } from "@/components/ContactForm";
import {
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  TelegramIcon,
  WhatsappIcon,
  YoutubeIcon,
} from "@/components/BrandIcons";
import { CONTACT } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with NEDC. Call, email, or message us, or send an inquiry about the Entrepreneurship Development Program (EDP).",
};

const SOCIALS = [
  { label: "Facebook", href: CONTACT.socials.facebook, icon: FacebookIcon },
  { label: "Instagram", href: CONTACT.socials.instagram, icon: InstagramIcon },
  { label: "LinkedIn", href: CONTACT.socials.linkedin, icon: LinkedinIcon },
  { label: "YouTube", href: CONTACT.socials.youtube, icon: YoutubeIcon },
  { label: "Telegram", href: CONTACT.socials.telegram, icon: TelegramIcon },
];

export default function ContactPage() {
  const details = [
    { icon: Phone, label: "Phone", value: CONTACT.phone, href: `tel:${CONTACT.phone.replace(/\s/g, "")}` },
    { icon: Mail, label: "Email", value: CONTACT.email, href: `mailto:${CONTACT.email}` },
    {
      icon: WhatsappIcon,
      label: "WhatsApp",
      value: "Chat with us",
      href: `https://wa.me/${CONTACT.whatsapp}`,
    },
    { icon: MapPin, label: "Office", value: CONTACT.address },
  ];

  return (
    <section className="py-16 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="Contact"
          title="Get in touch with NEDC"
          subtitle="Questions about the EDP program, registration, or partnerships? We're here to help."
          as="h1"
        />

        <div className="mt-14 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          {/* Details + socials */}
          <div className="space-y-4">
            {details.map((d) => {
              const inner = (
                <div className="flex items-center gap-4 p-5">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <d.icon className="size-5" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {d.label}
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {d.value}
                    </p>
                  </div>
                </div>
              );
              return (
                <OffsetCard key={d.label}>
                  {d.href ? (
                    <a
                      href={d.href}
                      target={d.href.startsWith("http") ? "_blank" : undefined}
                      rel={d.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {inner}
                    </a>
                  ) : (
                    inner
                  )}
                </OffsetCard>
              );
            })}

            <div className="pt-2">
              <p className="text-sm font-semibold text-foreground">Follow us</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {SOCIALS.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="flex size-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <s.icon className="size-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Inquiry form */}
          <OffsetCard>
            <div className="p-6 sm:p-8">
              <h2 className="font-display text-xl font-bold text-foreground">
                Send us a message
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Fill in the form and our team will get back to you.
              </p>
              <div className="mt-6">
                <ContactForm />
              </div>
            </div>
          </OffsetCard>
        </div>
      </Container>
    </section>
  );
}
