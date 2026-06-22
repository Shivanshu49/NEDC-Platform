"use client"; // needs client state for the mobile menu + auth status

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/Button";
import { Logo } from "@/components/Logo";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

// Single-page landing nav — anchors into the home sections. The leading "/"
// means these also work from deeper pages (navigate home, then scroll). The
// sticky-header offset is handled by each section's `scroll-mt-24`.
const NAV_LINKS = [
  { href: "/#program", label: "Program" },
  { href: "/#journey", label: "Journey" },
  { href: "/#schemes", label: "Schemes" },
  { href: "/#mentors", label: "Mentors" },
  { href: "/#about", label: "About" },
  { href: "/#organiser", label: "Organiser" },
  { href: "/#faq", label: "FAQ" },
];

const linkClass =
  "rounded-md text-sm font-medium text-foreground/80 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const mobileLinkClass =
  "rounded-md px-2 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-secondary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/** NEDC brand mark (icon only) — links to the homepage. */
function Wordmark({ onClick }: { onClick?: () => void }) {
  return (
    <span onClick={onClick}>
      <Logo className="h-11 w-auto sm:h-12" priority />
    </span>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  // null = still checking; avoids a login/dashboard flash on first paint.
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    // Skip the auth check when Supabase isn't really configured (e.g. the local
    // placeholder host), so the nav doesn't hang waiting for a dead endpoint.
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!url || url.includes("placeholder.supabase.co")) {
      // Defer the state update out of the effect body to avoid a sync setState.
      const id = setTimeout(() => setAuthed(false), 0);
      return () => clearTimeout(id);
    }
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => setAuthed(!!data.user));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) =>
      setAuthed(!!session?.user),
    );
    return () => subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <nav className="mx-auto flex max-w-[100rem] items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        <Wordmark onClick={() => setOpen(false)} />

        {/* Center nav links */}
        <div className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={linkClass}>
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right: auth + primary CTA */}
        <div className="hidden items-center gap-5 lg:flex">
          {authed === true && (
            <>
              <Link href="/dashboard" className={linkClass}>
                Dashboard
              </Link>
              <form action="/auth/signout" method="post">
                <button type="submit" className={linkClass}>
                  Sign out
                </button>
              </form>
            </>
          )}
          {authed === false && (
            <Link href="/login" className={linkClass}>
              Sign in
            </Link>
          )}
          <Button href="/#register" variant="accent" size="sm">
            Register Now
          </Button>
        </div>

        {/* Mobile hamburger / close */}
        <button
          type="button"
          className="rounded-md p-1 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 lg:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? (
            <X className="size-6" aria-hidden="true" />
          ) : (
            <Menu className="size-6" aria-hidden="true" />
          )}
        </button>
      </nav>

      {/* Mobile dropdown */}
      {open && (
        <div id="mobile-menu" className="border-t border-border lg:hidden">
          <div className="mx-auto flex max-w-[100rem] flex-col gap-1 px-4 py-4 sm:px-6 lg:px-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={mobileLinkClass}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            <div className="my-2 h-px bg-border" />

            {authed === true && (
              <>
                <Link
                  href="/dashboard"
                  className={mobileLinkClass}
                  onClick={() => setOpen(false)}
                >
                  Dashboard
                </Link>
                <form action="/auth/signout" method="post" className="px-2 py-2">
                  <button
                    type="submit"
                    className="text-sm font-medium text-foreground/80 hover:text-primary"
                  >
                    Sign out
                  </button>
                </form>
              </>
            )}
            {authed === false && (
              <Link
                href="/login"
                className={mobileLinkClass}
                onClick={() => setOpen(false)}
              >
                Sign in
              </Link>
            )}

            <Button href="/#register" variant="accent" className="mt-2">
              Register Now
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
