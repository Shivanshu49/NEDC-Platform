-- =============================================================================
-- 0009_cohort_session_time.sql — daily live-session time window on cohorts
-- =============================================================================
-- Idempotent & additive — safe to re-run (Supabase dashboard → SQL Editor → Run).
--
-- Adds the DAILY live-session window (e.g. 6:30 PM to 8:30 PM) as structured
-- fields on the cohort — the public "what students buy" layer — so the homepage,
-- /edp, /program, and /pricing can render it from the DB instead of hardcoding a
-- string. (The enrolled-only `sessions` table already carries exact per-day
-- timestamps for the dashboard; these two columns are the cohort-level marketing
-- summary of that window.)
--
-- Stored TZ-naive (`time`) and interpreted as WALL-CLOCK in the cohort's
-- `timezone` (default Asia/Kolkata / IST). e.g. 18:30 = 6:30 PM IST. NULL = the
-- daily time has not been published for this cohort yet.
--
-- NOTE: this migration only ADDS the columns. Set the values per-cohort in the
-- Supabase Table Editor (or via the one-time update in
-- supabase/updates/2026-07-06_advance-certificate-pivot.sql). Migrations re-run
-- on every deploy, so putting a per-cohort UPDATE here would clobber later staff
-- edits — that data change is deliberately kept OUT of the migration.
-- =============================================================================

alter table public.cohorts
  add column if not exists daily_start_time time;
alter table public.cohorts
  add column if not exists daily_end_time time;

comment on column public.cohorts.daily_start_time is
  'Daily live-session start, wall-clock in cohorts.timezone (e.g. 18:30 = 6:30 PM IST). NULL = not published.';
comment on column public.cohorts.daily_end_time is
  'Daily live-session end, wall-clock in cohorts.timezone (e.g. 20:30 = 8:30 PM IST). NULL = not published.';
