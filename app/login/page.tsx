import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { LoginForm } from "@/components/LoginForm";

export const metadata: Metadata = {
  title: "Log in",
  description: "Sign in to your NEDC account.",
};

// In Next 16, searchParams is async.
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next = "/dashboard", error } = await searchParams;

  return (
    <Container className="flex min-h-screen max-w-md flex-col justify-center py-16">
      <Link
        href="/"
        className="mb-8 text-center text-xl font-extrabold tracking-tight"
      >
        NEDC
      </Link>
      <div className="rounded-2xl border border-foreground/10 p-8">
        <h1 className="text-2xl font-bold tracking-tight">Log in or sign up</h1>
        <p className="mt-2 text-sm text-foreground/70">
          Enrolled students sign in here. New? The same form creates your
          account — no password needed.
        </p>
        <LoginForm next={next} initialError={error} />
      </div>
      <p className="mt-6 text-center text-xs text-foreground/50">
        By continuing you agree to NEDC&apos;s terms.
      </p>
    </Container>
  );
}
