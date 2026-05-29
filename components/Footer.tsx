import Link from "next/link";
import { Container } from "@/components/Container";

const FOOTER_LINKS = [
  { href: "/program", label: "Program" },
  { href: "/speakers", label: "Speakers" },
  { href: "/team", label: "Team" },
  { href: "/gallery", label: "Gallery" },
  { href: "/faq", label: "FAQ" },
  { href: "/pricing", label: "Pricing" },
];

export function Footer() {
  // Server component — `new Date()` runs at build/request time, which is fine here.
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-foreground/10">
      <Container className="py-12">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <p className="text-lg font-extrabold tracking-tight">NEDC</p>
            <p className="mt-2 text-sm text-foreground/60">
              National Entrepreneurship Development Center — live 5–6 day online
              programs that turn ideas into ventures.
            </p>
          </div>

          <nav className="flex flex-col gap-2">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-foreground/70 hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-foreground/10 pt-6 text-sm text-foreground/70 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} NEDC. All rights reserved.</p>
          <a href="mailto:hello@nedc.example" className="hover:text-foreground">
            hello@nedc.example
          </a>
        </div>
      </Container>
    </footer>
  );
}
