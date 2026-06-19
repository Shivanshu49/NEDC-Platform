"use client";

import { useActionState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { submitInquiry, type ContactState } from "@/app/(marketing)/contact/actions";

const initialState: ContactState = { ok: false };

const inputClass =
  "w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring";

/** Public contact / inquiry form — submits to the submitInquiry server action. */
export function ContactForm() {
  const [state, formAction, pending] = useActionState(
    submitInquiry,
    initialState,
  );

  if (state.ok) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-success/30 bg-success/5 p-6">
        <CheckCircle2 className="mt-0.5 size-6 shrink-0 text-success" />
        <div>
          <p className="font-semibold text-foreground">Message sent</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Thanks for reaching out — our team will get back to you soon.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="text-sm font-medium text-foreground">
            Name
          </label>
          <input
            id="name"
            name="name"
            required
            autoComplete="name"
            placeholder="Your full name"
            className={`mt-1.5 ${inputClass}`}
          />
        </div>
        <div>
          <label htmlFor="email" className="text-sm font-medium text-foreground">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@email.com"
            className={`mt-1.5 ${inputClass}`}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="phone" className="text-sm font-medium text-foreground">
            Phone <span className="text-muted-foreground">(optional)</span>
          </label>
          <input
            id="phone"
            name="phone"
            autoComplete="tel"
            placeholder="+91 …"
            className={`mt-1.5 ${inputClass}`}
          />
        </div>
        <div>
          <label htmlFor="subject" className="text-sm font-medium text-foreground">
            Subject <span className="text-muted-foreground">(optional)</span>
          </label>
          <input
            id="subject"
            name="subject"
            placeholder="EDP enquiry"
            className={`mt-1.5 ${inputClass}`}
          />
        </div>
      </div>

      <div>
        <label htmlFor="message" className="text-sm font-medium text-foreground">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          placeholder="How can we help?"
          className={`mt-1.5 ${inputClass} resize-y`}
        />
      </div>

      {state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {pending ? "Sending…" : "Send message"}
        {!pending && <Send className="size-4" />}
      </button>
    </form>
  );
}
