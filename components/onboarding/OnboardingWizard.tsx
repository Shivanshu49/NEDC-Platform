"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { Logo } from "@/components/Logo";
import { AvatarUploader } from "@/components/AvatarUploader";
import { PROFESSIONS } from "@/lib/profile";
import {
  completeOnboarding,
  skipOnboarding,
  type OnboardingState,
} from "@/app/welcome/actions";

type InitialProfile = {
  full_name: string;
  phone: string;
  profession: string;
  organization: string;
  city: string;
  bio: string;
  avatar_url: string | null;
};

const STEPS = [
  { label: "About you", heading: "Let's set up your profile" },
  { label: "Background", heading: "Tell us a bit about your work" },
  { label: "Photo", heading: "Add a profile photo" },
];

const inputClass =
  "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function Field({
  name,
  label,
  defaultValue,
  placeholder,
  hint,
  className = "",
  ...rest
}: {
  name: string;
  label: string;
  defaultValue: string;
  placeholder?: string;
  hint?: string;
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={className}>
      <label htmlFor={name} className="mb-1.5 block text-sm font-semibold text-foreground">
        {label}
      </label>
      <input
        id={name}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className={inputClass}
        {...rest}
      />
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function OnboardingWizard({
  userId,
  email,
  initial,
}: {
  userId: string;
  email: string;
  initial: InitialProfile;
}) {
  const [step, setStep] = useState(0);
  const [state, formAction, pending] = useActionState<OnboardingState, FormData>(
    completeOnboarding,
    { ok: false },
  );
  const last = STEPS.length - 1;
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Move focus to the first field of each step as the user advances.
  useEffect(() => {
    const panel = panelRefs.current[step];
    panel
      ?.querySelector<HTMLElement>("input:not([type=hidden]), textarea")
      ?.focus();
  }, [step]);

  const firstName =
    initial.full_name.trim().split(/\s+/)[0] || email.split("@")[0] || "there";
  const progress = Math.round(((step + 1) / STEPS.length) * 100);

  const goNext = () => setStep((s) => Math.min(s + 1, last));
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <div className="flex min-h-screen flex-col bg-secondary/40">
      {/* Top bar: brand + skip (its own form, so it never nests in the wizard form) */}
      <header className="flex items-center justify-between px-5 py-4 sm:px-8">
        <Logo withWordmark priority className="h-8 w-auto" wordmarkClassName="text-lg" />
        <form action={skipOnboarding}>
          <button
            type="submit"
            className="rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Skip for now
          </button>
        </form>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 pb-12 pt-2">
        <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-border bg-card shadow-lift">
          {/* Branded header band */}
          <div className="px-6 pb-6 pt-7 text-primary-foreground sm:px-9" style={{ background: "var(--gradient-hero)" }}>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/80">
              Step {step + 1} of {STEPS.length}
            </p>
            <h1 className="font-display mt-1.5 text-2xl font-bold tracking-tight">
              {step === 0 ? `Welcome, ${firstName}.` : STEPS[step].heading}
            </h1>
            <p className="mt-1 text-sm text-primary-foreground/85">
              {step === 0
                ? "Let's finish setting up your account. It takes under a minute."
                : "A few details so mentors and your cohort can get to know you."}
            </p>

            {/* Progress bar */}
            <div className="mt-5 flex items-center gap-3" aria-hidden>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-primary-foreground/25">
                <div
                  className="h-full rounded-full bg-primary-foreground transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs font-medium tabular-nums text-primary-foreground/85">
                {progress}%
              </span>
            </div>
          </div>

          {/* Steps — all mounted; only the active one is shown, so the single
              <form> submits every field (and the uploaded photo) at once. */}
          <form
            action={formAction}
            className="px-6 py-7 sm:px-9"
            onKeyDown={(e) => {
              // Enter advances steps instead of submitting early; the real
              // submit only happens via the Finish button on the last step.
              const t = e.target as HTMLElement;
              if (
                e.key === "Enter" &&
                step !== last &&
                t.tagName !== "TEXTAREA" &&
                t.tagName !== "BUTTON"
              ) {
                e.preventDefault();
                goNext();
              }
            }}
          >
            {/* Step 1 — about you */}
            <div
              ref={(el) => { panelRefs.current[0] = el; }}
              hidden={step !== 0}
              aria-hidden={step !== 0}
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  name="full_name"
                  label="Full name"
                  defaultValue={initial.full_name}
                  placeholder="e.g. Aarav Sharma"
                  autoComplete="name"
                  maxLength={120}
                  className="sm:col-span-2"
                />
                <Field
                  name="phone"
                  label="Phone"
                  defaultValue={initial.phone}
                  placeholder="e.g. +91 98765 43210"
                  hint="So we can share your Zoom join link and reminders."
                  inputMode="tel"
                  autoComplete="tel"
                  maxLength={40}
                />
                <Field
                  name="city"
                  label="City"
                  defaultValue={initial.city}
                  placeholder="e.g. Greater Noida"
                  autoComplete="address-level2"
                  maxLength={80}
                />
              </div>
            </div>

            {/* Step 2 — background */}
            <div
              ref={(el) => { panelRefs.current[1] = el; }}
              hidden={step !== 1}
              aria-hidden={step !== 1}
            >
              <div className="grid gap-5">
                <div>
                  <label htmlFor="profession" className="mb-1.5 block text-sm font-semibold text-foreground">
                    What best describes you?
                  </label>
                  <input
                    id="profession"
                    name="profession"
                    list="onboarding-professions"
                    defaultValue={initial.profession}
                    placeholder="e.g. Student"
                    maxLength={80}
                    className={inputClass}
                  />
                  <datalist id="onboarding-professions">
                    {PROFESSIONS.map((p) => (
                      <option key={p} value={p} />
                    ))}
                  </datalist>
                </div>
                <Field
                  name="organization"
                  label="Organization / college"
                  defaultValue={initial.organization}
                  placeholder="e.g. Galgotias College of Engineering & Technology"
                  autoComplete="organization"
                  maxLength={120}
                />
                <div>
                  <label htmlFor="bio" className="mb-1.5 block text-sm font-semibold text-foreground">
                    What do you want to build or learn?
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={3}
                    maxLength={500}
                    defaultValue={initial.bio}
                    placeholder="A short line about your goals or the idea you're working on."
                    className={inputClass}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">Optional, but it helps us tailor the sessions.</p>
                </div>
              </div>
            </div>

            {/* Step 3 — photo (optional) */}
            <div
              ref={(el) => { panelRefs.current[2] = el; }}
              hidden={step !== 2}
              aria-hidden={step !== 2}
            >
              <p className="mb-5 text-sm text-muted-foreground">
                A friendly face makes the cohort feel more personal. This is
                completely optional, you can add or change it anytime from your
                dashboard.
              </p>
              <AvatarUploader
                userId={userId}
                email={email}
                name={initial.full_name}
                initialUrl={initial.avatar_url}
              />
            </div>

            {state.error && (
              <p className="mt-5 text-sm text-destructive" role="alert">
                {state.error}
              </p>
            )}

            {/* Footer nav */}
            <div className="mt-8 flex items-center justify-between gap-3">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={goBack}
                  disabled={pending}
                  className="inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <ArrowLeft className="size-4" />
                  Back
                </button>
              ) : (
                <span />
              )}

              {step < last ? (
                // Distinct `key` from the submit button below: forces React to
                // unmount this node instead of reusing it as the submit button,
                // which would let this in-flight click auto-submit the form.
                <button
                  key="continue"
                  type="button"
                  onClick={goNext}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  Continue
                  <ArrowRight className="size-4" />
                </button>
              ) : (
                <button
                  key="finish"
                  type="submit"
                  disabled={pending}
                  className="inline-flex items-center justify-center gap-1.5 rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand-dark disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {pending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Finishing…
                    </>
                  ) : (
                    <>
                      <Check className="size-4" />
                      Finish and go to dashboard
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
