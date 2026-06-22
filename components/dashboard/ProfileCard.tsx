"use client";

import { useActionState, useState } from "react";
import {
  Building2,
  Check,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  X,
  type LucideIcon,
} from "lucide-react";
import { updateProfile, type ProfileState } from "@/app/dashboard/actions";
import { AvatarUploader } from "@/components/AvatarUploader";
import { PROFESSIONS, initials, profileCompleteness } from "@/lib/profile";

export type ProfileFields = {
  full_name: string | null;
  phone: string | null;
  profession: string | null;
  organization: string | null;
  city: string | null;
  bio: string | null;
  avatar_url: string | null;
};

const inputClass =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function Field({
  name,
  label,
  defaultValue,
  placeholder,
  className = "",
  ...rest
}: {
  name: string;
  label: string;
  defaultValue: string;
  placeholder?: string;
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={className}>
      <label htmlFor={name} className="mb-1.5 block text-xs font-semibold text-foreground">
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
    </div>
  );
}

function Detail({
  icon: Icon,
  label,
  value,
  empty,
}: {
  icon: LucideIcon;
  label: string;
  value: string | null;
  empty: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex size-9 flex-none items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </dt>
        <dd
          className={`truncate text-sm ${value ? "font-medium text-foreground" : "italic text-muted-foreground"}`}
        >
          {value || empty}
        </dd>
      </div>
    </div>
  );
}

export function ProfileCard({
  userId,
  email,
  profile,
}: {
  userId: string;
  email: string;
  profile: ProfileFields | null;
}) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState<ProfileState, FormData>(
    updateProfile,
    { ok: false },
  );

  // Close the editor after EACH successful save. We compare the action's
  // `savedAt` token (distinct every save) rather than the sticky `ok` boolean,
  // so a second consecutive success still collapses the form. Adjusting state
  // during render on the transition is the React-recommended pattern (no effect).
  const [lastSaved, setLastSaved] = useState(state.savedAt);
  if (state.ok && state.savedAt !== lastSaved) {
    setLastSaved(state.savedAt);
    setEditing(false);
  }

  const name = profile?.full_name?.trim() ?? "";
  const avatarUrl = profile?.avatar_url ?? null;

  // Profile completeness nudge (shared with the onboarding flow).
  const pct = profileCompleteness(profile);

  return (
    <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
      {/* Cover band (brand navy gradient) */}
      <div className="h-24" style={{ background: "var(--gradient-hero)" }} />

      <div className="px-6 pb-6 sm:px-8 sm:pb-8">
        {/* Identity row */}
        <div className="-mt-12 flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-end gap-4">
            <span className="font-display flex size-24 flex-none items-center justify-center overflow-hidden rounded-2xl bg-primary text-2xl font-extrabold text-primary-foreground shadow-lift ring-4 ring-card">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- small avatar; next/image optimization is unnecessary
                <img src={avatarUrl} alt="" className="size-full object-cover" />
              ) : (
                initials(name, email)
              )}
            </span>
            <div className="pb-1">
              <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
                {name || "Your name"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {profile?.profession || "Add your profession"}
              </p>
            </div>
          </div>
          {!editing && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Pencil className="size-4" />
              Edit profile
            </button>
          )}
        </div>

        {editing ? (
          <form action={formAction} className="mt-6 space-y-4">
            <h3 className="sr-only">Edit profile</h3>
            <div className="rounded-2xl border border-border bg-secondary/40 p-4">
              <AvatarUploader
                userId={userId}
                email={email}
                name={name}
                initialUrl={avatarUrl}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field name="full_name" label="Full name" defaultValue={name} placeholder="e.g. Aarav Sharma" autoComplete="name" maxLength={120} autoFocus />
              <Field name="phone" label="Phone" defaultValue={profile?.phone ?? ""} placeholder="e.g. +91 98765 43210" inputMode="tel" autoComplete="tel" maxLength={40} />
              <div>
                <label htmlFor="profession" className="mb-1.5 block text-xs font-semibold text-foreground">
                  Profession
                </label>
                <input
                  id="profession"
                  name="profession"
                  list="profession-options"
                  defaultValue={profile?.profession ?? ""}
                  placeholder="e.g. Student"
                  maxLength={80}
                  className={inputClass}
                />
                <datalist id="profession-options">
                  {PROFESSIONS.map((p) => (
                    <option key={p} value={p} />
                  ))}
                </datalist>
              </div>
              <Field name="city" label="City" defaultValue={profile?.city ?? ""} placeholder="e.g. Greater Noida" autoComplete="address-level2" maxLength={80} />
              <Field
                name="organization"
                label="Organization / college"
                defaultValue={profile?.organization ?? ""}
                placeholder="e.g. Galgotias College of Engineering & Technology"
                className="sm:col-span-2"
                autoComplete="organization"
                maxLength={120}
              />
            </div>
            <div>
              <label htmlFor="bio" className="mb-1.5 block text-xs font-semibold text-foreground">
                About
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={3}
                maxLength={500}
                defaultValue={profile?.bio ?? ""}
                placeholder="What do you want to build? A short line about your goals or interests."
                className={inputClass}
              />
            </div>

            <p className="text-xs text-muted-foreground">
              Your email is managed by your login, so it can&apos;t be changed here.
            </p>

            {state.error && (
              <p className="text-sm text-destructive" role="alert">
                {state.error}
              </p>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={pending}
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {pending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Check className="size-4" />
                    Save changes
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                disabled={pending}
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <X className="size-4" />
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            {/* Announce a successful save to assistive tech (visually hidden). */}
            {state.ok && (
              <p role="status" aria-live="polite" className="sr-only">
                Profile updated.
              </p>
            )}
            <dl className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2">
              <Detail icon={Mail} label="Email" value={email} empty="—" />
              <Detail icon={Phone} label="Phone" value={profile?.phone ?? null} empty="Add your phone number" />
              <Detail icon={MapPin} label="City" value={profile?.city ?? null} empty="Add your city" />
              <Detail icon={Building2} label="Organization / college" value={profile?.organization ?? null} empty="Add your organization" />
            </dl>

            <div className="mt-5">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                About
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-foreground">
                {profile?.bio || (
                  <span className="italic text-muted-foreground">
                    Add a short note about your goals or what you want to build.
                  </span>
                )}
              </p>
            </div>

            {pct < 100 && (
              <div className="mt-6 rounded-2xl bg-secondary/60 p-4">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-foreground">Complete your profile</span>
                  <span className="tabular-nums text-foreground">{pct}%</span>
                </div>
                <div
                  className="mt-2 h-1.5 overflow-hidden rounded-full bg-border"
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Profile completeness: ${pct} percent`}
                >
                  <div
                    aria-hidden
                    className="h-full rounded-full bg-brand transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
