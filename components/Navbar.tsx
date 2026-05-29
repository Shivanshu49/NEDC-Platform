"use client"; // needs client state for the mobile menu + auth status

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const NAV_LINKS = [
  { href: "/program", label: "Program" },
  { href: "/speakers", label: "Speakers" },
  { href: "/team", label: "Team" },
  { href: "/gallery", label: "Gallery" },
  { href: "/faq", label: "FAQ" },
  { href: "/pricing", label: "Pricing" },
];

const linkClass =
  "rounded text-sm font-medium text-foreground/70 transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2";

export function Navbar() {
  const [open, setOpen] = useState(false);
  // null = still checking; avoids a login/dashboard flash on first paint.
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
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
    <header className="sticky top-0 z-50 border-b border-foreground/10 bg-background/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="text-lg font-extrabold tracking-tight"
          onClick={() => setOpen(false)}
        >
          NEDC
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={linkClass}>
              {link.label}
            </Link>
          ))}

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
              Log in
            </Link>
          )}

          <Button href="/pricing" className="px-5 py-2">
            Enroll
          </Button>
        </div>

        {/* Mobile hamburger / close button */}
        <button
          type="button"
          className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 md:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
            focusable="false"
          >
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile dropdown */}
      {open && (
        <div id="mobile-menu" className="border-t border-foreground/10 md:hidden">
          <div className="flex flex-col gap-1 px-6 py-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-2 py-2 text-sm font-medium text-foreground/80 hover:bg-foreground/4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {authed === true && (
              <>
                <Link
                  href="/dashboard"
                  className="rounded-lg px-2 py-2 text-sm font-medium text-foreground/80 hover:bg-foreground/4"
                  onClick={() => setOpen(false)}
                >
                  Dashboard
                </Link>
                <form action="/auth/signout" method="post" className="px-2 py-2">
                  <button
                    type="submit"
                    className="text-sm font-medium text-foreground/80 hover:text-foreground"
                  >
                    Sign out
                  </button>
                </form>
              </>
            )}
            {authed === false && (
              <Link
                href="/login"
                className="rounded-lg px-2 py-2 text-sm font-medium text-foreground/80 hover:bg-foreground/4"
                onClick={() => setOpen(false)}
              >
                Log in
              </Link>
            )}

            <Button href="/pricing" className="mt-2">
              Enroll
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
