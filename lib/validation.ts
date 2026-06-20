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

/** POST /api/checkout body. */
export const checkoutBody = z.object({
  cohortId: z.uuid(),
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
