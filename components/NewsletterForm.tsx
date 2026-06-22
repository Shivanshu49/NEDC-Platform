"use client";

import { useActionState } from "react";
import { CheckCircle2 } from "lucide-react";
import { subscribe, type NewsletterState } from "@/app/actions/newsletter";

const initial: NewsletterState = { ok: false };

/**
 * "Notify me on the next EDP" email capture. Submits to the subscribe server
 * action (saves to the `subscribers` table). `source` tags where it came from.
 *
 * `tone` adapts the colours: "light" for the navy footer panel, "onDark" for the
 * primary "Notify me" card on the program page.
 */
export function NewsletterForm({
  source,
  tone = "light",
  align = "left",
}: {
  source: string;
  tone?: "light" | "onDark";
  align?: "left" | "center";
}) {
  const [state, formAction, pending] = useActionState(subscribe, initial);

  if (state.ok) {
    return (
      <p
        className={`flex items-center gap-2 text-sm font-medium ${
          tone === "onDark" ? "text-primary-foreground" : "text-success"
        } ${align === "center" ? "justify-center" : ""}`}
      >
        <CheckCircle2 className="size-4" />
        You&apos;re on the list, and we&apos;ll be in touch.
      </p>
    );
  }

  const btnClass =
    tone === "onDark"
      ? "bg-card text-foreground hover:bg-card/90"
      : "bg-brand text-brand-foreground hover:bg-brand/90";

  return (
    <form action={formAction} className={align === "center" ? "mx-auto max-w-md" : "max-w-md"}>
      <input type="hidden" name="source" value={source} />
      <div className="flex gap-2">
        <input
          type="email"
          name="email"
          required
          aria-label="Email address"
          placeholder="Enter your email"
          className="min-w-0 flex-1 rounded-full border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
        />
        <button
          type="submit"
          disabled={pending}
          className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${btnClass}`}
        >
          {pending ? "…" : "Notify me"}
        </button>
      </div>
      {state.error && (
        <p
          className={`mt-2 text-sm ${
            tone === "onDark" ? "text-primary-foreground/90" : "text-destructive"
          } ${align === "center" ? "text-center" : ""}`}
        >
          {state.error}
        </p>
      )}
    </form>
  );
}
