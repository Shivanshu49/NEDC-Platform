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
