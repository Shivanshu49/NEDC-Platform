-- =============================================================================
-- 0005_plans.sql — Two-tier pricing (Basic + Premium) for the EDP
-- =============================================================================
-- Idempotent & additive — safe to re-run (Supabase dashboard → SQL Editor → Run).
--
-- Model: a cohort keeps `price_inr` as the BASIC tier price. `price_premium_inr`
-- (nullable) is the optional higher tier — 1:1 mentorship, doubt-clearing,
-- career guidance, and an exclusive session with the Organiser. Premium is
-- offered for a cohort ONLY when this column is set (NULL = Basic only).
--
-- Security: both prices stay SERVER-AUTHORITATIVE. The browser sends a plan id
-- ('basic' | 'premium'), NEVER an amount. /api/checkout derives the price from
-- this table and records it on the `payments` row; the Razorpay webhook then
-- validates the captured amount against THAT recorded amount (see CLAUDE.md §5).
--
-- FULFILLMENT (read this): the in-app dashboard is PLAN-AGNOSTIC by design — the
-- access rule (CLAUDE.md §5) keys only on enrollments.status='active', so Basic
-- and Premium currently see the same sessions/recordings in software. The
-- Premium-only extras (1-on-1 mentorship, doubt-clearing, the "meet the
-- Organiser" session) are delivered MANUALLY by staff, who identify Premium
-- buyers by reading `enrollments.plan = 'premium'` in the Table Editor.
--   ⚠ If you ever add PREMIUM-ONLY in-app content (e.g. a premium session or a
--   "meet the organiser" Zoom link in the dashboard), you MUST gate it on
--   enrollments.plan = 'premium' (in the app AND/OR a plan-aware RLS helper) —
--   is_enrolled() alone will NOT separate the tiers.
-- =============================================================================

-- Premium tier price (paise). NULL = this cohort has no premium tier.
alter table public.cohorts
  add column if not exists price_premium_inr integer;

comment on column public.cohorts.price_premium_inr is
  'Premium tier price in paise (1:1 mentorship etc.). NULL = premium not offered for this cohort.';

-- Record which tier each payment / enrollment is for.
alter table public.payments
  add column if not exists plan text not null default 'basic';
alter table public.enrollments
  add column if not exists plan text not null default 'basic';

-- Constrain to the known plan ids (drop-then-add so re-runs don't error).
alter table public.payments    drop constraint if exists payments_plan_check;
alter table public.payments    add  constraint payments_plan_check    check (plan in ('basic','premium'));
alter table public.enrollments drop constraint if exists enrollments_plan_check;
alter table public.enrollments add  constraint enrollments_plan_check check (plan in ('basic','premium'));

-- -----------------------------------------------------------------------------
-- Set your real prices. EDIT the cohort id(s), then run:
--   update public.cohorts
--      set price_inr = 149900,          -- ₹1,499 (Basic)
--          price_premium_inr = 189900   -- ₹1,899 (Premium)
--    where id = '<your-cohort-id>';
-- (Money is integer paise: 149900 = ₹1,499.00.)
-- -----------------------------------------------------------------------------
