"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * Passwordless login: a magic-link email (Supabase `signInWithOtp`) and Google
 * OAuth. The same form signs new users up — `shouldCreateUser: true`.
 *
 * `next` is where we send the user after they finish authenticating; it flows
 * through /auth/callback.
 */
export function LoginForm({
  next,
  initialError,
}: {
  next: string;
  initialError?: string;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    initialError ? "error" : "idle",
  );
  const [message, setMessage] = useState(
    initialError ? "Couldn't sign you in. Please try again." : "",
  );

  const supabase = createSupabaseBrowserClient();
  const redirectTo = () =>
    `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo(), shouldCreateUser: true },
    });
    if (error) {
      setStatus("error");
      setMessage(error.message);
    } else {
      setStatus("sent");
    }
  }

  async function continueWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectTo() },
    });
    if (error) {
      setStatus("error");
      setMessage(error.message);
    }
  }

  if (status === "sent") {
    return (
      <div className="mt-6 rounded-lg bg-brand/5 p-4 text-sm leading-relaxed">
        Check your inbox — we sent a magic link to <strong>{email}</strong>.
        Click it to finish signing in. You can close this tab.
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      <button
        type="button"
        onClick={continueWithGoogle}
        className="flex w-full items-center justify-center gap-2 rounded-full border border-foreground/15 px-5 py-3 text-sm font-semibold transition hover:bg-foreground/4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
      >
        Continue with Google
      </button>

      <div className="flex items-center gap-3 text-xs text-foreground/50">
        <span className="h-px flex-1 bg-foreground/10" />
        or
        <span className="h-px flex-1 bg-foreground/10" />
      </div>

      <form onSubmit={sendMagicLink} className="space-y-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          aria-label="Email address"
          className="w-full rounded-full border border-foreground/15 px-5 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        />
        <button
          type="submit"
          disabled={status === "sending"}
          className="w-full rounded-full bg-brand px-5 py-3 text-sm font-semibold text-brand-foreground transition hover:bg-brand/90 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        >
          {status === "sending" ? "Sending…" : "Email me a magic link"}
        </button>
      </form>

      {status === "error" && <p className="text-sm text-red-600">{message}</p>}
    </div>
  );
}
