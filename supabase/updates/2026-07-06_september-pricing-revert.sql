-- =============================================================================
-- ONE-TIME production data correction — revert September's pricing (2026-07-06)
-- =============================================================================
-- Run this ONCE in the Supabase SQL Editor, AFTER the pivot script
-- (2026-07-06_advance-certificate-pivot.sql) has already been applied.
--
-- WHY THIS EXISTS: the pivot script contained a SECOND update statement that
-- also aligned the September 2026 Batch to the single ₹1,899 plan and the
-- 18:30–20:30 session window. The client has since confirmed the "Advance
-- Certificate Course" pivot applies to the July 27–31 cohort ONLY. September
-- must return to the two-tier structure it had before the pivot.
--
-- This was NOT a missing WHERE clause and NOT a shared/global table: pricing and
-- session time are per-cohort COLUMNS on public.cohorts, and the September change
-- came from its own explicitly-scoped UPDATE. So the correction is likewise a
-- single, id-scoped UPDATE — nothing else can be affected.
--
-- SCOPE: touches ONLY the September 2026 Batch row
--   (id = '0c0a5e00-0000-4000-8000-000000000012').
-- September's DATES (2026-09-08 to 2026-09-13) are confirmed correct and are
-- deliberately NOT in the SET clause below — they are left untouched.
--
-- Restores September to its exact pre-pivot structure:
--   price_inr          189900  ->  149900    (₹1,499 — Basic tier restored)
--   price_premium_inr  NULL    ->  189900    (₹1,899 — Premium tier restored)
--   daily_start_time   18:30   ->  NULL      (see note below)
--   daily_end_time     20:30   ->  NULL
--
-- SESSION TIME IS SET TO NULL, NOT CARRIED OVER. "18:30–20:30" was new,
-- July-specific information; nothing confirms September runs the same hours.
-- NULL means "not published yet" — the marketing pages simply hide the time
-- line (formatTimeRange returns null) rather than showing a guessed value.
-- >>> ACTION: confirm September's real daily window with the client, then set
--     it per-cohort in the Supabase Table Editor (or a follow-up update). <<<
--
-- Safe to re-run (plain UPDATE to a fixed id).
-- =============================================================================

update public.cohorts
   set price_inr         = 149900,   -- ₹1,499  (Basic tier restored)
       price_premium_inr = 189900,   -- ₹1,899  (Premium tier restored)
       daily_start_time  = null,     -- NOT July's 18:30 — September's hours are unconfirmed
       daily_end_time    = null      -- NOT July's 20:30 — September's hours are unconfirmed
 where id = '0c0a5e00-0000-4000-8000-000000000012';   -- September 2026 Batch ONLY

-- Sanity check (optional — run to confirm exactly one row, with the right values):
--   select name, start_date, end_date, price_inr, price_premium_inr,
--          daily_start_time, daily_end_time
--     from public.cohorts
--    where id = '0c0a5e00-0000-4000-8000-000000000012';
-- Expect: September 2026 Batch | 2026-09-08 | 2026-09-13 | 149900 | 189900 | null | null
