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
  price_inr: number; // PAISE — divide by 100 for rupees (see lib/format.ts). The single course price.
  price_premium_inr: number | null; // PAISE — legacy of the retired premium tier; null now (kept for history).
  daily_start_time: string | null; // wall-clock "HH:MM[:SS]" in `timezone` (e.g. "18:30:00" = 6:30 PM IST); null = not published.
  daily_end_time: string | null; // wall-clock "HH:MM[:SS]" in `timezone` (e.g. "20:30:00" = 8:30 PM IST); null = not published.
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

/**
 * One /edp landing-page registration: the lead (name/email/phone/message) plus
 * its Razorpay order/payment state. Mirrors 0010_edp_registrations.sql.
 * Written only by server code (service role); staff read it in the Table Editor.
 */
export type EdpRegistration = {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string | null;
  cohort_id: string | null;
  amount_inr: number | null; // PAISE, server-set from cohorts.price_inr
  currency: string;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  payment_status: "pending" | "paid" | "failed";
  status: string;
  enquiry_email_sent_at: string | null;
  confirmation_email_sent_at: string | null;
  created_at: string;
  updated_at: string;
};
