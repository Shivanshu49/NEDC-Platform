/**
 * TypeScript types mirroring the Supabase tables in
 * supabase/migrations/0001_init.sql.
 *
 * These are hand-written to keep Phase 2 simple. Once your database is live you
 * can replace them with auto-generated types (see CLAUDE.md §5) for end-to-end
 * type-safety, but hand-written types are perfectly fine for reading public data.
 */

/** One day of a program, stored inside courses.curriculum (a JSON column). */
export type CurriculumDay = {
  day: number;
  title: string;
  points: string[];
};

export type Course = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  curriculum: CurriculumDay[];
  hero_image_url: string | null;
  is_published: boolean;
  created_at: string;
};

export type CohortStatus =
  | "upcoming"
  | "open"
  | "running"
  | "completed"
  | "cancelled";

export type Cohort = {
  id: string;
  course_id: string;
  name: string;
  start_date: string; // ISO date, e.g. "2026-07-14"
  end_date: string;
  timezone: string;
  price_inr: number; // PAISE — divide by 100 for rupees (see lib/format.ts). Basic tier.
  price_premium_inr: number | null; // PAISE — optional Premium tier; null = Basic only.
  capacity: number | null;
  status: CohortStatus;
  enroll_open: boolean;
};

export type Speaker = {
  id: string;
  name: string;
  title: string | null;
  bio: string | null;
  photo_url: string | null;
  sort_order: number;
  is_published: boolean;
};

export type TeamMember = {
  id: string;
  name: string;
  role: string | null;
  bio: string | null;
  photo_url: string | null;
  sort_order: number;
  is_published: boolean;
};

export type GalleryImage = {
  id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
  is_published: boolean;
};

export type Faq = {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  is_published: boolean;
};
