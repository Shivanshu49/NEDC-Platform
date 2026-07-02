import { createClient } from "@supabase/supabase-js";
import type {
  Cohort,
  Course,
  Faq,
  GalleryImage,
  Speaker,
  TeamMember,
} from "@/lib/types";

/**
 * Read-only data access for the PUBLIC marketing pages.
 *
 * Marketing content is the same for every visitor, so we read it with a plain
 * anon client (no user cookies). Row Level Security still limits us to published
 * rows. If Supabase isn't configured yet (no env vars), each helper returns
 * empty so `npm run dev` / `npm run build` still works before setup.
 */
function publicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  // Not configured, or pointed at the local-dev placeholder host (which doesn't
  // exist) → skip the network call entirely so pages render instantly instead of
  // waiting ~7s for a connection to time out.
  if (!url || !key || url.includes("placeholder.supabase.co")) return null;
  return createClient(url, key, {
    auth: { persistSession: false },
    global: {
      // Resilience: never let a slow/unreachable Supabase hang a page render.
      // Cap every read at 4s; on timeout the query returns empty and the page
      // still renders (the helpers below already handle null/empty data).
      // `next.revalidate` puts these reads in Next's data cache at the same
      // 5-minute cadence as the pages' `revalidate = 300` — needed since the
      // root layout's generateMetadata now reads cohort state on EVERY route,
      // and this keeps that read cached instead of per-request.
      fetch: (input, init) =>
        fetch(input, {
          ...init,
          signal: AbortSignal.timeout(4000),
          next: { revalidate: 300 },
        }),
    },
  });
}

export type FeaturedProgram = { course: Course; cohorts: Cohort[] };

/** The first published course plus its cohorts (earliest start first). */
export async function getFeaturedProgram(): Promise<FeaturedProgram | null> {
  const supabase = publicClient();
  if (!supabase) return null;

  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!course) return null;

  const { data: cohorts } = await supabase
    .from("cohorts")
    .select("*")
    .eq("course_id", course.id)
    .order("start_date", { ascending: true });

  return { course: course as Course, cohorts: (cohorts as Cohort[]) ?? [] };
}

export async function getSpeakers(): Promise<Speaker[]> {
  const supabase = publicClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("speakers")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });
  return (data as Speaker[]) ?? [];
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  const supabase = publicClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("team_members")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });
  return (data as TeamMember[]) ?? [];
}

export async function getGalleryImages(): Promise<GalleryImage[]> {
  const supabase = publicClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("gallery_images")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });
  return (data as GalleryImage[]) ?? [];
}

export async function getFaqs(): Promise<Faq[]> {
  const supabase = publicClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("faqs")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });
  return (data as Faq[]) ?? [];
}

/** Pick the cohort to feature on CTAs: the first one still open for enrollment,
 *  otherwise the earliest upcoming one. Returns null if there are none. */
export function pickNextCohort(cohorts: Cohort[]): Cohort | null {
  if (cohorts.length === 0) return null;
  const open = cohorts.find((c) => c.enroll_open && c.status !== "completed");
  return open ?? cohorts[0];
}

/**
 * The SINGLE source of truth for "can you register right now?" copy, shared by
 * every page with a cohort CTA (home, /edp) so they can never disagree.
 *
 * - "open"          — `cohorts.enroll_open` is true. This is exactly the flag
 *                     /api/checkout enforces server-side, so the badge says
 *                     "open" iff checkout actually accepts payments.
 * - "opening_soon"  — no cohort yet, or the featured cohort hasn't started and
 *                     staff haven't flipped `enroll_open` on.
 * - "closed"        — the featured cohort already started (or ended) without
 *                     `enroll_open`, i.e. registration is genuinely over.
 */
export type RegistrationState = "open" | "opening_soon" | "closed";

export function registrationState(cohort: Cohort | null): RegistrationState {
  if (!cohort) return "opening_soon";
  if (cohort.enroll_open) return "open";
  // Parsed at local midnight like lib/format's date helpers.
  const started = new Date(`${cohort.start_date}T00:00:00`) <= new Date();
  return started ? "closed" : "opening_soon";
}

/** Badge copy per state (the pulsing-dot pill on home + /edp). */
export const REGISTRATION_BADGE: Record<RegistrationState, string> = {
  open: "Registrations open now",
  opening_soon: "Registrations opening soon",
  closed: "Registrations closed",
};

/** CTA-button copy per state (hero buttons, pricing-card fallbacks). */
export const REGISTRATION_CTA: Record<RegistrationState, string> = {
  open: "Register now",
  opening_soon: "Registration opening soon",
  closed: "Registrations closed",
};
