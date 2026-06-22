import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Zap, PlayCircle } from "lucide-react";
import { LoginForm } from "@/components/LoginForm";
import { OffsetCard } from "@/components/OffsetCard";

export const metadata: Metadata = {
  title: "Log in",
  description: "Sign in to your NEDC account.",
};

const PERKS = [
  { icon: Zap, text: "Join live cohort sessions on Zoom" },
  { icon: PlayCircle, text: "Rewatch every session recording" },
  { icon: ShieldCheck, text: "Secure, passwordless sign-in" },
];

// In Next 16, searchParams is async.
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next = "/dashboard", error } = await searchParams;

  return (
    <main className="relative min-h-screen overflow-hidden bg-secondary/40">
      {/* Soft brand wash in the background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60rem 40rem at 110% -10%, var(--panel), transparent 60%), radial-gradient(40rem 30rem at -10% 110%, var(--pale), transparent 60%)",
        }}
      />

      <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center gap-10 px-6 py-16 lg:flex-row lg:gap-16">
        {/* Left: brand + value props (hidden on small screens) */}
        <div className="hidden max-w-sm flex-1 lg:block">
          <Link
            href="/"
            className="font-display text-2xl font-bold tracking-tight text-foreground"
          >
            N<span className="text-primary">ED</span>C
          </Link>
          <h1 className="mt-6 font-display text-3xl font-bold leading-tight tracking-tight text-foreground">
            Welcome back to your founder journey.
          </h1>
          <p className="mt-3 text-muted-foreground">
            Sign in to access your live sessions, schedule, and recordings.
          </p>
          <ul className="mt-8 space-y-4">
            {PERKS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="size-4" />
                </span>
                <span className="text-sm font-medium text-foreground">
                  {text}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: the auth card */}
        <div className="w-full max-w-md flex-1">
          {/* Mobile-only logo */}
          <Link
            href="/"
            className="mb-6 block text-center font-display text-xl font-bold tracking-tight text-foreground lg:hidden"
          >
            N<span className="text-primary">ED</span>C
          </Link>
          <OffsetCard>
            <div className="p-8">
              <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
                Log in or sign up
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Enrolled students sign in here. New? The same form creates your
                account, no password needed.
              </p>
              <LoginForm next={next} initialError={error} />
            </div>
          </OffsetCard>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            By continuing you agree to NEDC&apos;s terms.
          </p>
        </div>
      </div>
    </main>
  );
}
