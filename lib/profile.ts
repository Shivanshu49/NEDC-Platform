/**
 * Small profile helpers shared by the dashboard, the onboarding wizard, and the
 * avatar uploader. Pure data/functions only — safe to import from both server
 * and client components.
 */

/** Suggested professions for the "Profession" datalist (free text still allowed). */
export const PROFESSIONS = [
  "Student",
  "Aspiring entrepreneur",
  "Working professional",
  "Business owner",
  "Freelancer / Self-employed",
  "Homemaker",
  "Other",
];

/** Two initials from a name, falling back to the email local-part. */
export function initials(name: string, email: string): string {
  const src = name.trim() || email.replace(/@.*/, "");
  const parts = src.trim().split(/[\s._-]+/).filter(Boolean);
  const a = parts[0]?.[0] ?? "";
  const b = parts.length > 1 ? parts[parts.length - 1][0] : parts[0]?.[1] ?? "";
  return (a + b).toUpperCase() || "?";
}

/** The fields counted toward the "profile completeness" nudge. */
export type ProfileCompletenessFields = {
  full_name?: string | null;
  phone?: string | null;
  profession?: string | null;
  city?: string | null;
  organization?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
};

/** Percentage (0–100) of the profile fields a student has filled in. */
export function profileCompleteness(p: ProfileCompletenessFields | null): number {
  const checks = [
    p?.full_name,
    p?.phone,
    p?.profession,
    p?.city,
    p?.organization,
    p?.bio,
    p?.avatar_url,
  ];
  const filled = checks.filter((c) => c && String(c).trim()).length;
  return Math.round((filled / checks.length) * 100);
}
