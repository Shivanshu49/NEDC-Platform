-- =============================================================================
-- ONE-TIME production data change — Advance Certificate Course pivot (2026-07-06)
-- =============================================================================
-- Run this ONCE in the Supabase SQL Editor, AFTER migration 0009 has been applied
-- (it adds the daily_start_time / daily_end_time columns this update sets).
--
-- WHY THIS IS NOT A MIGRATION: migrations re-run on every deploy/preview. A
-- per-cohort UPDATE in a migration would silently overwrite any later date/price
-- edits staff make in the Table Editor. So this is a deliberate, run-once script.
--
-- WHAT IT DOES (matches supabase/seed.sql, for the ALREADY-SEEDED rows that the
-- re-runnable seed's `on conflict do nothing` will not update):
--   * Retire the two-tier model → single "Advance Certificate Course" at ₹1,899.
--     price_inr = 189900 (₹1,899), price_premium_inr = NULL (no premium tier).
--   * July 2026 Batch dates → 27 to 31 July 2026 (was 14–19 July).
--   * Daily live-session window → 6:30 PM to 8:30 PM IST (18:30–20:30 wall-clock).
--
-- Safe to re-run (it is a plain UPDATE to fixed ids).
-- =============================================================================

-- July 2026 Batch — new dates + single-plan price + daily session time.
update public.cohorts
   set start_date        = '2026-07-27',
       end_date          = '2026-07-31',
       price_inr         = 189900,     -- ₹1,899 (single offering)
       price_premium_inr = null,       -- retired premium tier
       daily_start_time  = '18:30',    -- 6:30 PM IST
       daily_end_time    = '20:30'     -- 8:30 PM IST
 where id = '0c0a5e00-0000-4000-8000-000000000011';

-- September 2026 Batch — keep its dates; align price + daily time to the single plan.
update public.cohorts
   set price_inr         = 189900,
       price_premium_inr = null,
       daily_start_time  = '18:30',
       daily_end_time    = '20:30'
 where id = '0c0a5e00-0000-4000-8000-000000000012';

-- If enrolled students are already loaded for the July batch, also update the
-- per-day `sessions` rows (the enrolled-only dashboard reads exact times there):
--   update public.sessions set starts_at = ..., ends_at = ... where cohort_id = '...';
-- Those rows are managed by staff in the Table Editor and are not seeded here.
