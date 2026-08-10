-- =============================================================================
-- ONE-TIME production data update — August 2026 cohort dates (2026-08-10)
-- =============================================================================
-- Run this ONCE in the Supabase SQL Editor (idempotent — a plain UPDATE to a
-- fixed id, safe to re-run).
--
-- WHY THIS EXISTS: the featured "July 2026 Batch" (27–31 July) has passed, and
-- the new ad campaign (poster: "6 DAYS ONLINE EDP · STARTS ON 24TH AUGUST
-- 2026 · 6:30 PM to 8:30 PM · ₹1899") announces the same Advance Certificate
-- Course run on new dates. This repurposes THAT SAME cohort row — so any
-- existing enrollments/payments stay attached to the run they bought — rather
-- than stranding them on a past cohort.
--
-- SCOPE: touches ONLY the former July cohort row
--   (id = '0c0a5e00-0000-4000-8000-000000000011').
--
--   name              July 2026 Batch  ->  August 2026 Batch
--   start_date        2026-07-27       ->  2026-08-24   (Monday)
--   end_date          2026-07-31       ->  2026-08-29   (Saturday — SIX days,
--                                          matching the poster's "6 DAYS")
--
-- Deliberately NOT in the SET clause (already correct, confirmed by poster):
--   price_inr 189900 (₹1,899) · daily 18:30–20:30 IST · enroll_open true
--   status 'open' · capacity 40
--
-- >>> ACTION for staff afterwards: the `sessions` rows for this cohort (the
--     Zoom layer) still carry July timestamps. Recreate/update them for
--     24–29 August before Day 1 — the marketing pages don't read `sessions`,
--     but the student dashboard and enrollment emails do. <<<
-- =============================================================================

update public.cohorts
   set name       = 'August 2026 Batch',
       start_date = '2026-08-24',
       end_date   = '2026-08-29'
 where id = '0c0a5e00-0000-4000-8000-000000000011';  -- former July 2026 Batch ONLY

-- Sanity check (optional — expect exactly one row):
--   select name, start_date, end_date, price_inr, daily_start_time,
--          daily_end_time, status, enroll_open
--     from public.cohorts
--    where id = '0c0a5e00-0000-4000-8000-000000000011';
-- Expect: August 2026 Batch | 2026-08-24 | 2026-08-29 | 189900 | 18:30:00 | 20:30:00 | open | true
