import { z } from "zod";

/**
 * Zod schemas for validating untrusted input at route boundaries.
 *
 * This is defense-in-depth: DB access is already parameterized (no SQL
 * injection) and gated by RLS, but validating shape/format here means malformed
 * input is rejected early with a clear 400 instead of silently hitting the DB.
 *
 * NOTE: zod v4 — top-level format helpers (z.uuid()), not z.string().uuid().
 */

/** A Postgres uuid (cohort ids, recording ids, etc.). */
export const uuid = z.uuid();

/** POST /api/checkout body. `plan` selects the pricing tier (server derives the
 *  actual price from the DB — the client never sends an amount). */
export const checkoutBody = z.object({
  cohortId: z.uuid(),
  plan: z.enum(["basic", "premium"]).default("basic"),
});

/**
 * POST /api/verify-payment body — the response Razorpay Checkout hands back to
 * the browser on a successful payment. All three fields are required; a missing
 * one is rejected with a 400 before any signature work.
 */
export const verifyPaymentBody = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

/**
 * A profile photo URL. We only ever persist a URL that points at OUR OWN public
 * `avatars` Storage bucket — never an arbitrary client-supplied string (which
 * could be an off-site tracking pixel or a `javascript:`/`data:` payload). The
 * photo is uploaded client-side straight to Storage, so the hidden form field is
 * untrusted and must be checked here. Empty string = "no photo".
 */
export const avatarUrl = z
  .string()
  .trim()
  .max(2048)
  .refine((v) => {
    if (v === "") return true;
    // Normalize a stray trailing slash: supabase-js always emits single-slash
    // public URLs, so a trailing slash in the env would otherwise fail-close and
    // silently reject every legitimate avatar.
    const base = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/+$/, "");
    return (
      base !== "" &&
      v.startsWith(`${base}/storage/v1/object/public/avatars/`)
    );
  }, "That image link isn't valid.");

/**
 * The editable fields a signed-in student may change about themselves — shared
 * by the dashboard profile editor and the post-login onboarding wizard so both
 * validate identically. RLS + per-column GRANTs (migrations 0001/0006/0007) are
 * the real authority; this is the friendly, early shape check.
 */
export const profileFields = z.object({
  full_name: z.string().trim().max(120, "Name is too long (max 120 characters)."),
  phone: z.string().trim().max(40, "Phone is too long (max 40 characters)."),
  profession: z.string().trim().max(80, "Profession is too long (max 80 characters)."),
  organization: z.string().trim().max(120, "Organization is too long (max 120 characters)."),
  city: z.string().trim().max(80, "City is too long (max 80 characters)."),
  bio: z.string().trim().max(500, "About is too long (max 500 characters)."),
  avatar_url: avatarUrl,
});
