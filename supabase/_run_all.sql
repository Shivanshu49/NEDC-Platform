-- ============================================================
-- NEDC Platform — ALL migrations + seed, in order.
-- Paste this ENTIRE file into the Supabase SQL Editor and Run.
-- Safe to re-run (every statement is idempotent).
--
-- Bundles migrations 0001–0009 + seed.sql. Regenerate this file whenever
-- a new migration is added (it is a concatenation, not the source of truth).
-- NOTE: seed_mentors.sql is applied SEPARATELY (run it on its own in the SQL
-- Editor); it is intentionally not bundled here.
-- ============================================================


-- ====================== supabase/migrations/0001_init.sql ======================

-- =============================================================================
-- NEDC Platform — Supabase schema (Phase 1)
-- Paste this whole file into the Supabase SQL editor and run it.
-- It is IDEMPOTENT: safe to run again; it won't error or duplicate anything.
--
-- THE ACCESS MODEL IN ONE SENTENCE:
--   A user can see a cohort's live sessions + recordings IF AND ONLY IF they
--   have a row in `enrollments` for that cohort with status = 'active'.
--   That row is written ONLY by the Razorpay webhook (service-role key) or by
--   you in the Table Editor. To REVOKE access, set that row's status to
--   'cancelled' or 'refunded'. There is no admin screen — admin = editing rows
--   in the Supabase Table Editor, which uses the service role and bypasses RLS.
--
-- CONVENTIONS:
--   * Primary keys are uuid default gen_random_uuid(), except profiles.id which
--     equals auth.users.id (1:1 mirror).
--   * Money is stored as INTEGER PAISE. 499900 = ₹4,999.00. This matches
--     Razorpay's native "amount" unit and avoids floating-point bugs.
--   * Timestamps are timestamptz (stored in UTC); render in IST in the app.
--   * RLS is ON for every table with DEFAULT-DENY. The ONLY client write allowed
--     is a logged-in user editing their OWN profile's full_name/phone. Every
--     other write (payments, enrollments, all content) goes through the service
--     role (webhook / Table Editor). Do NOT add a permissive write policy later —
--     that would break the security model.
-- =============================================================================

create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- ENUMS (guarded so re-running doesn't error)
-- -----------------------------------------------------------------------------
do $$ begin
  create type cohort_status as enum ('upcoming','open','running','completed','cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type enrollment_status as enum ('active','cancelled','refunded');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_status as enum ('created','paid','failed','refunded');
exception when duplicate_object then null; end $$;

do $$ begin
  -- Phase 5 lifecycle for recordings.
  create type recording_status as enum ('pending','processing','ready','failed');
exception when duplicate_object then null; end $$;

-- -----------------------------------------------------------------------------
-- updated_at helper (shared trigger function)
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

-- =============================================================================
-- TABLE: profiles  (mirrors auth.users 1:1)
-- =============================================================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  full_name   text,
  phone       text,
  -- NOTE: is_admin does NOT grant any access on its own in Phases 1–4. Admin
  -- actions happen in the Supabase Table Editor (service role). This flag is
  -- only here for future server code; never treat it as a working access gate.
  is_admin    boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create a profile row whenever a new auth user signs up (email OR Google).
-- SECURITY DEFINER so it can insert into public.profiles regardless of RLS.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name')
  )
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================================
-- TABLE: courses  (the marketing "program" / product)
-- =============================================================================
create table if not exists public.courses (
  id             uuid primary key default gen_random_uuid(),
  slug           text unique not null,
  title          text not null,
  subtitle       text,
  description    text,
  curriculum     jsonb not null default '[]'::jsonb,  -- [{day, title, points:[]}]
  hero_image_url text,
  is_published   boolean not null default false,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create trigger courses_set_updated_at
  before update on public.courses
  for each row execute function public.set_updated_at();

-- =============================================================================
-- TABLE: cohorts  (a dated run of a course — the thing a student BUYS)
-- =============================================================================
create table if not exists public.cohorts (
  id          uuid primary key default gen_random_uuid(),
  course_id   uuid not null references public.courses(id) on delete cascade,
  name        text not null,                       -- e.g. "June 2026 Batch"
  start_date  date not null,
  end_date    date not null,
  timezone    text not null default 'Asia/Kolkata',
  price_inr   integer not null,                    -- paise (e.g. 499900 = ₹4,999)
  capacity    integer,                             -- optional; not enforced yet
  status      cohort_status not null default 'upcoming',
  enroll_open boolean not null default true,       -- show/hide the Enroll button
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists cohorts_course_id_idx on public.cohorts(course_id);

create trigger cohorts_set_updated_at
  before update on public.cohorts
  for each row execute function public.set_updated_at();

-- =============================================================================
-- TABLE: sessions  (one live day inside a cohort; holds the Zoom link)
-- =============================================================================
create table if not exists public.sessions (
  id              uuid primary key default gen_random_uuid(),
  cohort_id       uuid not null references public.cohorts(id) on delete cascade,
  title           text not null,
  day_number      integer,
  starts_at       timestamptz not null,
  ends_at         timestamptz,
  zoom_join_url   text,        -- SENSITIVE: enrolled-only (see RLS below)
  zoom_meeting_id text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists sessions_cohort_id_idx on public.sessions(cohort_id);

create trigger sessions_set_updated_at
  before update on public.sessions
  for each row execute function public.set_updated_at();

-- =============================================================================
-- TABLE: enrollments  (THE ACCESS GRANT — see header note)
-- =============================================================================
create table if not exists public.enrollments (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  cohort_id   uuid not null references public.cohorts(id) on delete cascade,
  status      enrollment_status not null default 'active',
  -- payment_id is NULL only for admin-granted (comp) enrollments created by hand
  -- in the Table Editor. Webhook-created enrollments always set it.
  payment_id  uuid,
  -- Stamped by the webhook AFTER the receipt + Zoom-link email is sent. Lets you
  -- catch paid students who never got their link:
  --   select * from enrollments where status='active' and welcome_email_sent_at is null;
  welcome_email_sent_at timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  -- One enrollment per (user, cohort). Makes the payment webhook IDEMPOTENT:
  -- a retried webhook can't create a second enrollment.
  unique (user_id, cohort_id)
);
create index if not exists enrollments_user_id_idx   on public.enrollments(user_id);
create index if not exists enrollments_cohort_id_idx on public.enrollments(cohort_id);

create trigger enrollments_set_updated_at
  before update on public.enrollments
  for each row execute function public.set_updated_at();

-- =============================================================================
-- TABLE: payments  (Razorpay ledger + idempotency anchor)
-- =============================================================================
create table if not exists public.payments (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  cohort_id           uuid not null references public.cohorts(id) on delete cascade,
  razorpay_order_id   text unique not null,  -- unique => webhook idempotency
  razorpay_payment_id text unique,
  razorpay_signature  text,
  amount_inr          integer not null,      -- paise
  currency            text not null default 'INR',
  status              payment_status not null default 'created',
  method              text,                  -- upi / card / netbanking
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index if not exists payments_user_id_idx on public.payments(user_id);

create trigger payments_set_updated_at
  before update on public.payments
  for each row execute function public.set_updated_at();

-- Link enrollments.payment_id -> payments.id now that payments exists.
do $$ begin
  alter table public.enrollments
    add constraint enrollments_payment_id_fkey
    foreign key (payment_id) references public.payments(id) on delete set null;
exception when duplicate_object then null; end $$;

-- =============================================================================
-- TABLE: recordings  (Phase 5 — created now, populated later)
-- =============================================================================
create table if not exists public.recordings (
  id                 uuid primary key default gen_random_uuid(),
  session_id         uuid not null references public.sessions(id) on delete cascade,
  zoom_recording_url text,
  mux_asset_id       text,
  mux_playback_id    text,
  duration_seconds   integer,
  status             recording_status not null default 'pending',
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index if not exists recordings_session_id_idx on public.recordings(session_id);

create trigger recordings_set_updated_at
  before update on public.recordings
  for each row execute function public.set_updated_at();

-- =============================================================================
-- MARKETING TABLES (edit these by hand in the Supabase Table Editor)
-- =============================================================================
create table if not exists public.speakers (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  title        text,
  bio          text,
  photo_url    text,
  sort_order   integer not null default 0,
  is_published boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create trigger speakers_set_updated_at
  before update on public.speakers
  for each row execute function public.set_updated_at();

-- Join table: which speakers appear on which course (with per-course order).
create table if not exists public.course_speakers (
  course_id  uuid not null references public.courses(id) on delete cascade,
  speaker_id uuid not null references public.speakers(id) on delete cascade,
  sort_order integer not null default 0,
  primary key (course_id, speaker_id)
);

create table if not exists public.team_members (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  role         text,
  bio          text,
  photo_url    text,
  sort_order   integer not null default 0,
  is_published boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create trigger team_members_set_updated_at
  before update on public.team_members
  for each row execute function public.set_updated_at();

create table if not exists public.gallery_images (
  id           uuid primary key default gen_random_uuid(),
  image_url    text not null,
  caption      text,
  sort_order   integer not null default 0,
  is_published boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create trigger gallery_images_set_updated_at
  before update on public.gallery_images
  for each row execute function public.set_updated_at();

create table if not exists public.faqs (
  id           uuid primary key default gen_random_uuid(),
  question     text not null,
  answer       text not null,
  sort_order   integer not null default 0,
  is_published boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create trigger faqs_set_updated_at
  before update on public.faqs
  for each row execute function public.set_updated_at();

-- =============================================================================
-- ACCESS HELPER: is_enrolled(cohort)
-- SECURITY DEFINER so the function can read `enrollments` WITHOUT the caller
-- needing direct access to it — this avoids a recursive RLS policy on
-- enrollments. Both `sessions` and `recordings` reuse this one rule.
-- =============================================================================
create or replace function public.is_enrolled(p_cohort_id uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.enrollments e
    where e.cohort_id = p_cohort_id
      and e.user_id = auth.uid()
      and e.status = 'active'
  );
$$;

-- Defense in depth: anon never needs this helper (auth.uid() is null for them),
-- so only authenticated users may execute it.
revoke execute on function public.is_enrolled(uuid) from anon;
grant  execute on function public.is_enrolled(uuid) to authenticated;

-- =============================================================================
-- ROW LEVEL SECURITY — enable on every table, then add SELECT-only policies.
-- (No write policies anywhere => browser clients cannot write. Intentional.)
-- =============================================================================
alter table public.profiles        enable row level security;
alter table public.courses         enable row level security;
alter table public.cohorts         enable row level security;
alter table public.sessions        enable row level security;
alter table public.enrollments     enable row level security;
alter table public.payments        enable row level security;
alter table public.recordings      enable row level security;
alter table public.speakers        enable row level security;
alter table public.course_speakers enable row level security;
alter table public.team_members    enable row level security;
alter table public.gallery_images  enable row level security;
alter table public.faqs            enable row level security;

-- profiles: a user can read + update only their OWN row ----------------------
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select to authenticated using (id = auth.uid());
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- COLUMN-LEVEL PROTECTION (important!): an RLS WITH CHECK clause restricts which
-- ROWS a user may update, NOT which COLUMNS. Without the two lines below, a
-- logged-in user could run
--   update profiles set is_admin = true where id = auth.uid();
-- and the policy above would happily pass. So we revoke UPDATE on the whole
-- table and grant it back ONLY on the columns a user is allowed to change.
-- (The set_updated_at trigger can still touch updated_at — trigger writes are
-- not subject to the user's column privileges.)
revoke update on public.profiles from anon, authenticated;
grant  update (full_name, phone) on public.profiles to authenticated;

-- courses: anyone can read PUBLISHED courses ---------------------------------
drop policy if exists courses_select_published on public.courses;
create policy courses_select_published on public.courses
  for select to anon, authenticated using (is_published = true);

-- cohorts: readable when their parent course is published --------------------
drop policy if exists cohorts_select_published on public.cohorts;
create policy cohorts_select_published on public.cohorts
  for select to anon, authenticated using (
    exists (select 1 from public.courses c
            where c.id = cohorts.course_id and c.is_published = true)
  );

-- sessions: ENROLLED-ONLY (they hold the live Zoom join links) ---------------
drop policy if exists sessions_select_enrolled on public.sessions;
create policy sessions_select_enrolled on public.sessions
  for select to authenticated using (public.is_enrolled(cohort_id));

-- enrollments: read-OWN-only (no client writes) -----------------------------
drop policy if exists enrollments_select_own on public.enrollments;
create policy enrollments_select_own on public.enrollments
  for select to authenticated using (user_id = auth.uid());

-- payments: read-OWN-only so students see their own receipts -----------------
drop policy if exists payments_select_own on public.payments;
create policy payments_select_own on public.payments
  for select to authenticated using (user_id = auth.uid());

-- recordings: enrolled-only, derived from the parent session's cohort --------
-- (is_enrolled(NULL) returns false, so this fails CLOSED if a session is gone.)
drop policy if exists recordings_select_enrolled on public.recordings;
create policy recordings_select_enrolled on public.recordings
  for select to authenticated using (
    exists (select 1 from public.sessions s
            where s.id = recordings.session_id
              and public.is_enrolled(s.cohort_id))
  );

-- marketing tables: public read of PUBLISHED rows ---------------------------
drop policy if exists speakers_select_published on public.speakers;
create policy speakers_select_published on public.speakers
  for select to anon, authenticated using (is_published = true);

-- course_speakers: readable only when the parent course is published
-- (so a draft course's speaker lineup isn't leaked via the join table)
drop policy if exists course_speakers_select_published on public.course_speakers;
create policy course_speakers_select_published on public.course_speakers
  for select to anon, authenticated using (
    exists (select 1 from public.courses c
            where c.id = course_speakers.course_id and c.is_published = true)
  );

drop policy if exists team_members_select_published on public.team_members;
create policy team_members_select_published on public.team_members
  for select to anon, authenticated using (is_published = true);

drop policy if exists gallery_images_select_published on public.gallery_images;
create policy gallery_images_select_published on public.gallery_images
  for select to anon, authenticated using (is_published = true);

drop policy if exists faqs_select_published on public.faqs;
create policy faqs_select_published on public.faqs
  for select to anon, authenticated using (is_published = true);

-- =============================================================================
-- DONE. Quick sanity checks you can run as the ANON role (SQL editor → "Run as"
-- → anon, or from the app before logging in):
--   select * from sessions;     -- expect 0 rows (enrolled-only)
--   select * from enrollments;  -- expect 0 rows (own-only)
--   select * from courses;      -- expect only rows where is_published = true
-- =============================================================================


-- ====================== supabase/migrations/0002_recordings.sql ======================

-- =============================================================================
-- NEDC Platform — Phase 5 schema additions (recordings pipeline)
-- Run AFTER 0001_init.sql, in the Supabase SQL editor. Idempotent / re-runnable.
--
-- The `recordings` table and `recording_status` enum already exist from
-- 0001_init.sql. Phase 5 only needs two small things:
--   1. A way to find the session a Zoom recording belongs to. Zoom's webhook
--      identifies the meeting by its numeric id, which we already store on
--      sessions.zoom_meeting_id — so we just make sure it's indexed.
--   2. Idempotency for the recordings pipeline: at most one recording row per
--      session, so a re-delivered Zoom webhook / re-run Inngest job can upsert
--      instead of inserting duplicates.
-- =============================================================================

-- Find the session for an incoming Zoom recording.completed event by meeting id.
create index if not exists sessions_zoom_meeting_id_idx
  on public.sessions(zoom_meeting_id);

-- One recording per session → lets the pipeline upsert idempotently.
-- (Guard on the constraint name so re-running this file is safe.)
do $$ begin
  if not exists (
    select 1 from pg_constraint where conname = 'recordings_session_id_key'
  ) then
    alter table public.recordings
      add constraint recordings_session_id_key unique (session_id);
  end if;
end $$;

-- =============================================================================
-- DONE. RLS on `recordings` is already enabled in 0001_init.sql and gates rows
-- to enrolled students (recordings_select_enrolled). The actual video bytes are
-- additionally protected by short-lived SIGNED Mux playback tokens minted
-- server-side per request (see app/api/recordings/[id]/token), so a leaked
-- mux_playback_id alone is useless.
-- =============================================================================


-- ====================== supabase/migrations/0003_inquiries.sql ======================

-- =============================================================================
-- NEDC Platform — Phase A: contact inquiries
-- Run AFTER the earlier migrations, in the Supabase SQL editor. Idempotent.
--
-- Stores messages submitted through the public Contact form. Writes happen via
-- a server action using the SERVICE-ROLE key (bypasses RLS), so the table is
-- default-deny to clients: anon/authenticated can neither read nor write it.
-- Staff read submissions in the Supabase Table Editor.
-- =============================================================================

create table if not exists public.inquiries (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  phone       text,
  subject     text,
  message     text not null,
  -- Where it came from / lifecycle, editable by staff in the Table Editor.
  status      text not null default 'new',  -- new | read | responded | spam
  created_at  timestamptz not null default now()
);

create index if not exists inquiries_created_at_idx
  on public.inquiries(created_at desc);

-- RLS on, with NO policies → clients can't read or write. Only the service role
-- (the contact server action) and the Table Editor can touch this table.
alter table public.inquiries enable row level security;

-- =============================================================================
-- DONE. To read submissions: Supabase → Table Editor → inquiries.
-- =============================================================================


-- ====================== supabase/migrations/0004_subscribers.sql ======================

-- =============================================================================
-- NEDC Platform — Phase A: newsletter subscribers ("notify me on the next EDP")
-- Run AFTER the earlier migrations, in the Supabase SQL editor. Idempotent.
--
-- Captured from the footer + program "Notify me" forms via a server action using
-- the SERVICE-ROLE key. Default-deny to clients (RLS on, no policies). Staff
-- read/export in the Table Editor.
-- =============================================================================

create table if not exists public.subscribers (
  id          uuid primary key default gen_random_uuid(),
  -- Stored lowercased by the server action, so a plain UNIQUE gives
  -- case-insensitive dedup AND a real constraint PostgREST upsert can target.
  email       text not null unique,
  source      text,                        -- e.g. 'footer' | 'program'
  created_at  timestamptz not null default now()
);

create index if not exists subscribers_created_at_idx
  on public.subscribers(created_at desc);

alter table public.subscribers enable row level security;

-- =============================================================================
-- DONE. The server action lowercases email before insert, so UNIQUE(email)
-- dedupes case-insensitively and lets the upsert ignore duplicates so a repeat
-- signup never errors.
-- =============================================================================


-- ====================== supabase/migrations/0005_plans.sql ======================

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


-- ====================== supabase/migrations/0006_profile_fields.sql ======================

-- =============================================================================
-- 0006_profile_fields.sql — richer student profile fields
-- =============================================================================
-- Idempotent & additive — safe to re-run (Supabase dashboard → SQL Editor → Run).
--
-- Adds the fields the dashboard profile shows/edits. A user may edit ONLY their
-- own row, and ONLY these columns: the table-level UPDATE is revoked in 0001 and
-- granted back per-column here (so a user still can't flip is_admin, etc.). The
-- existing profiles_update_own RLS policy already restricts WHICH row.
-- =============================================================================

alter table public.profiles add column if not exists profession   text;
alter table public.profiles add column if not exists organization text;  -- company / college
alter table public.profiles add column if not exists city         text;
alter table public.profiles add column if not exists bio          text;

-- Extend the column-level UPDATE grant to the new editable fields
-- (full_name + phone were already granted in 0001).
grant update (full_name, phone, profession, organization, city, bio)
  on public.profiles to authenticated;


-- ====================== supabase/migrations/0007_avatars.sql ======================

-- =============================================================================
-- 0007_avatars.sql — profile photos + a one-time onboarding flag
-- =============================================================================
-- Idempotent & additive — safe to re-run (Supabase dashboard → SQL Editor → Run).
--
-- Adds two columns and the Storage plumbing the post-login "Complete your
-- profile" flow needs:
--   * profiles.avatar_url  — public URL of the student's uploaded photo (optional)
--   * profiles.onboarded_at — when the user finished (or skipped) onboarding.
--     NULL means "has never seen onboarding" → /dashboard routes them to /welcome
--     once. Both "Finish" and "Skip for now" stamp it, so it only shows once.
--
-- As in 0006, table-level UPDATE on profiles is revoked (0001) and granted back
-- ONLY per-column, so a user still can't flip is_admin. We re-grant the FULL
-- editable column set here (GRANT is additive) to keep this the single source of
-- truth for what a student may change.
-- =============================================================================

alter table public.profiles add column if not exists avatar_url   text;
alter table public.profiles add column if not exists onboarded_at timestamptz;

grant update (full_name, phone, profession, organization, city, bio, avatar_url, onboarded_at)
  on public.profiles to authenticated;

-- =============================================================================
-- Storage: the "avatars" bucket
-- =============================================================================
-- PUBLIC bucket (avatars aren't secret; this is the standard Supabase pattern and
-- lets <img>/next/image load them with no signed URL). Writes are still locked
-- down by the RLS policies below: a user may only touch objects inside a folder
-- named with their own user id (avatars/<uid>/...). Server-side limits cap the
-- size (3 MB) and mime types as a backstop to the client-side checks.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  3145728, -- 3 MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
  set public            = excluded.public,
      file_size_limit   = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Anyone can READ avatars (the bucket is public).
drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'avatars');

-- A user may WRITE only inside their own folder: avatars/<their-uid>/...
-- storage.foldername(name) -> {'<uid>', 'file.png'}; [1] is the first segment.
drop policy if exists "avatars_user_insert" on storage.objects;
create policy "avatars_user_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars_user_update" on storage.objects;
create policy "avatars_user_update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars_user_delete" on storage.objects;
create policy "avatars_user_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );


-- ====================== supabase/migrations/0008_security_lints.sql ======================

-- =============================================================================
-- 0008_security_lints.sql — resolve Supabase Security Advisor WARN findings
-- =============================================================================
-- Idempotent & additive — safe to re-run (Supabase dashboard → SQL Editor → Run).
-- Addresses the 9 WARN-level lints from the Security Advisor (2026-06-29):
--
--   0011 function_search_path_mutable  → pin search_path on set_updated_at
--   0028/0029 SECURITY DEFINER exposed → remove the RPC reach of the trigger /
--       event-trigger functions (handle_new_user, rls_auto_enable), and MOVE
--       is_enrolled into a non-API schema (it must REMAIN security definer AND
--       callable by RLS, so it can't simply have EXECUTE revoked).
--   0025 public_bucket_allows_listing  → drop the unused broad SELECT policy on
--       the public avatars bucket.
--
-- NOT fixable in SQL (dashboard toggle): auth_leaked_password_protection — enable
-- it under Authentication → Sign In / Providers. Currently moot (this app is
-- passwordless: magic-link + Google), but harmless to turn on for the future.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1) set_updated_at — pin search_path (lint 0011)
-- -----------------------------------------------------------------------------
-- A SECURITY INVOKER trigger function that only calls now() (in pg_catalog, which
-- is always implicitly in scope), so an empty search_path is safe and clears the
-- "role mutable search_path" flag.
alter function public.set_updated_at() set search_path = '';


-- -----------------------------------------------------------------------------
-- 2) handle_new_user — remove RPC exposure (lints 0028 + 0029)
-- -----------------------------------------------------------------------------
-- AFTER INSERT trigger on auth.users. Trigger functions are invoked by the
-- trigger mechanism regardless of the caller's EXECUTE privilege, so revoking
-- EXECUTE does NOT affect signup — it only removes the pointless and
-- unintended /rest/v1/rpc/handle_new_user endpoint.
revoke execute on function public.handle_new_user() from public, anon, authenticated;


-- -----------------------------------------------------------------------------
-- 3) rls_auto_enable — capture in version control + remove RPC exposure (0028+0029)
-- -----------------------------------------------------------------------------
-- This event-trigger function (wired to the `ensure_rls` event trigger) was
-- created directly in the dashboard during an earlier hardening pass and was
-- NEVER in this repo. It is recorded here so a restore recreates it. Like all
-- trigger functions it runs via the event-trigger mechanism, so revoking EXECUTE
-- is safe and only removes the /rest/v1/rpc/rls_auto_enable endpoint.
create or replace function public.rls_auto_enable()
  returns event_trigger language plpgsql security definer set search_path = 'pg_catalog'
as $$
declare cmd record;
begin
  for cmd in
    select * from pg_event_trigger_ddl_commands()
    where command_tag in ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      and object_type in ('table', 'partitioned table')
  loop
    if cmd.schema_name is not null and cmd.schema_name in ('public') then
      begin
        execute format('alter table if exists %s enable row level security', cmd.object_identity);
        raise log 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      exception when others then
        raise log 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      end;
    end if;
  end loop;
end; $$;

revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

-- Recreate the event trigger only if it is missing (it already exists in prod).
do $$ begin
  if not exists (select 1 from pg_event_trigger where evtname = 'ensure_rls') then
    create event trigger ensure_rls on ddl_command_end
      execute function public.rls_auto_enable();
  end if;
end $$;


-- -----------------------------------------------------------------------------
-- 4) is_enrolled — keep SECURITY DEFINER, relocate out of the API schema (0028+0029)
-- -----------------------------------------------------------------------------
-- is_enrolled MUST stay SECURITY DEFINER (it reads enrollments while bypassing
-- that table's RLS, avoiding a recursive policy) and MUST stay callable by the
-- `authenticated` role, because the sessions/recordings RLS policies invoke it.
-- Revoking EXECUTE would break the student dashboard. Per Supabase guidance for
-- SECURITY DEFINER helpers, the fix is to move it to a schema PostgREST does NOT
-- expose, so there is no /rest/v1/rpc/is_enrolled endpoint while RLS can still
-- call it.
create schema if not exists private;
revoke all on schema private from anon, authenticated;
grant usage on schema private to authenticated; -- lets RLS policies resolve the fn

create or replace function private.is_enrolled(p_cohort_id uuid)
  returns boolean language sql security definer stable set search_path = public
as $$
  select exists (
    select 1 from public.enrollments e
    where e.cohort_id = p_cohort_id
      and e.user_id = auth.uid()
      and e.status = 'active'
  );
$$;
revoke execute on function private.is_enrolled(uuid) from public, anon;
grant  execute on function private.is_enrolled(uuid) to authenticated;

-- Repoint the two policies that reference it, then drop the public copy.
-- (No CASCADE: if any unknown object still depends on it the DROP fails loudly
--  rather than silently removing access.)
drop policy if exists sessions_select_enrolled on public.sessions;
create policy sessions_select_enrolled on public.sessions
  for select to authenticated using (private.is_enrolled(cohort_id));

drop policy if exists recordings_select_enrolled on public.recordings;
create policy recordings_select_enrolled on public.recordings
  for select to authenticated using (
    exists (select 1 from public.sessions s
            where s.id = recordings.session_id
              and private.is_enrolled(s.cohort_id))
  );

drop function if exists public.is_enrolled(uuid);


-- -----------------------------------------------------------------------------
-- 5) avatars bucket — drop the unused broad public-listing policy (lint 0025)
-- -----------------------------------------------------------------------------
-- The avatars bucket is PUBLIC, so images load via getPublicUrl() with no SELECT
-- policy needed. The app never lists or downloads avatars through the RLS-checked
-- client APIs (it only uploads, removes, and renders public URLs), so this broad
-- SELECT — which lets anyone enumerate every file (and thus every user id) in the
-- bucket — is unnecessary. Removing it stops directory listing; display keeps
-- working via the public object URL. Writes remain locked to own-folder by the
-- avatars_user_insert/update/delete policies (unchanged).
drop policy if exists "avatars_public_read" on storage.objects;


-- ====================== supabase/migrations/0009_cohort_session_time.sql ======================

-- Daily live-session window (e.g. 6:30 PM to 8:30 PM) as structured cohort fields
-- so the marketing pages render it from the DB. Stored TZ-naive (`time`) and read
-- as wall-clock in the cohort's `timezone` (Asia/Kolkata / IST). NULL = not published.
alter table public.cohorts
  add column if not exists daily_start_time time;
alter table public.cohorts
  add column if not exists daily_end_time time;

comment on column public.cohorts.daily_start_time is
  'Daily live-session start, wall-clock in cohorts.timezone (e.g. 18:30 = 6:30 PM IST). NULL = not published.';
comment on column public.cohorts.daily_end_time is
  'Daily live-session end, wall-clock in cohorts.timezone (e.g. 20:30 = 8:30 PM IST). NULL = not published.';


-- ====================== supabase/seed.sql ======================

-- =============================================================================
-- NEDC Platform — SAMPLE DATA (Phase 2)
--
-- Run this AFTER supabase/migrations/0001_init.sql, in the Supabase SQL editor,
-- to populate the marketing site with realistic placeholder content.
--
-- SAFE TO RE-RUN: every row uses a fixed id with "on conflict (id) do nothing",
-- so running it twice won't create duplicates.
--
-- TO REMOVE THE SAMPLE DATA later, delete these rows in the Table Editor (or
-- run: delete from courses where id = '0c0a5e00-0000-4000-8000-000000000001';
-- the cohorts/sessions cascade automatically).
--
-- Replace the text, prices, dates, and image URLs with your real content — the
-- pages read straight from these tables, so no code changes are needed.
-- =============================================================================

-- ---------- Course (the program) ----------
insert into public.courses (id, slug, title, subtitle, description, curriculum, hero_image_url, is_published)
values (
  '0c0a5e00-0000-4000-8000-000000000001',
  'startup-launch-program',
  'NEDC Startup Launch Program',
  'Go from idea to a launch-ready startup in 6 intensive live days.',
  'A hands-on, cohort-based program for first-time founders. Each day blends a live workshop, a working session on YOUR idea, and mentor Q&A — so you leave with a validated idea, a working MVP plan, and a 90-day action plan.',
  '[
    {"day":1,"title":"Idea & Opportunity","points":["Find a real problem worth solving","Validate the pain with quick research","Define your ideal customer","Frame your opportunity clearly"]},
    {"day":2,"title":"Customer & Market","points":["Run effective customer interviews","Size your market honestly","Map the competition","Sharpen your positioning"]},
    {"day":3,"title":"Product & MVP","points":["Scope a lean MVP","Build with no-code / low-code tools","Pricing fundamentals","Ship something people can use"]},
    {"day":4,"title":"Business Model & Finance","points":["Unit economics made simple","Choose a revenue model","Build a one-page financial plan","Funding options in India"]},
    {"day":5,"title":"Go-to-Market","points":["Pick your acquisition channels","Content & community basics","Sales for founders","Land your first 10 customers"]},
    {"day":6,"title":"Pitch & Next Steps","points":["Craft your story & deck","Deliver a demo-day pitch","Investor & incubator landscape","Your 90-day action plan"]}
  ]'::jsonb,
  'https://picsum.photos/seed/nedc-hero/1200/600',
  true
)
on conflict (id) do nothing;

-- ---------- Cohorts (dated runs — what students buy). Prices are in PAISE. ----------
-- The two cohorts now have DIFFERENT pricing (the pivot was July-only):
--   * July 2026 Batch — the single "Advance Certificate Course": price_inr = 189900
--     (₹1,899), price_premium_inr NULL (no premium tier), daily session window
--     18:30–20:30 (6:30–8:30 PM IST).
--   * September 2026 Batch — UNCHANGED two-tier model: price_inr 149900 (₹1,499
--     Basic) + price_premium_inr 189900 (₹1,899 Premium); daily times NULL (its
--     real hours are not confirmed yet).
insert into public.cohorts (id, course_id, name, start_date, end_date, timezone, price_inr, price_premium_inr, daily_start_time, daily_end_time, capacity, status, enroll_open)
values
  ('0c0a5e00-0000-4000-8000-000000000011','0c0a5e00-0000-4000-8000-000000000001','July 2026 Batch','2026-07-27','2026-07-31','Asia/Kolkata',189900,null,'18:30','20:30',40,'open',true),
  ('0c0a5e00-0000-4000-8000-000000000012','0c0a5e00-0000-4000-8000-000000000001','September 2026 Batch','2026-09-08','2026-09-13','Asia/Kolkata',149900,189900,null,null,40,'upcoming',true)
on conflict (id) do nothing;

-- ---------- Speakers / mentors ----------
insert into public.speakers (id, name, title, bio, photo_url, sort_order, is_published)
values
  ('0c0a5e00-0000-4000-8000-000000000021','Aarav Mehta','Founder & CEO, LaunchPad','Two-time founder who scaled a SaaS startup to 50,000 users before its acquisition.','https://i.pravatar.cc/400?img=12',1,true),
  ('0c0a5e00-0000-4000-8000-000000000022','Priya Nair','Partner, Seed Ventures','Early-stage investor who has backed 30+ Indian startups across fintech and SaaS.','https://i.pravatar.cc/400?img=5',2,true),
  ('0c0a5e00-0000-4000-8000-000000000023','Rohan Gupta','Head of Growth, ScaleKart','Growth operator specializing in zero-to-one customer acquisition for D2C brands.','https://i.pravatar.cc/400?img=33',3,true),
  ('0c0a5e00-0000-4000-8000-000000000024','Sneha Iyer','Product Lead, BuildLabs','Product leader who has shipped consumer apps used by millions across India.','https://i.pravatar.cc/400?img=20',4,true),
  ('0c0a5e00-0000-4000-8000-000000000025','Vikram Singh','Startup Lawyer, FoundersLegal','Advises early-stage founders on incorporation, fundraising, and compliance.','https://i.pravatar.cc/400?img=51',5,true),
  ('0c0a5e00-0000-4000-8000-000000000026','Ananya Rao','Founder, Craftly (exited)','Bootstrapped a marketplace to profitability and a successful exit in 4 years.','https://i.pravatar.cc/400?img=9',6,true)
on conflict (id) do nothing;

-- Link speakers to the course (which mentors appear on this program).
insert into public.course_speakers (course_id, speaker_id, sort_order)
values
  ('0c0a5e00-0000-4000-8000-000000000001','0c0a5e00-0000-4000-8000-000000000021',1),
  ('0c0a5e00-0000-4000-8000-000000000001','0c0a5e00-0000-4000-8000-000000000022',2),
  ('0c0a5e00-0000-4000-8000-000000000001','0c0a5e00-0000-4000-8000-000000000023',3),
  ('0c0a5e00-0000-4000-8000-000000000001','0c0a5e00-0000-4000-8000-000000000024',4),
  ('0c0a5e00-0000-4000-8000-000000000001','0c0a5e00-0000-4000-8000-000000000025',5),
  ('0c0a5e00-0000-4000-8000-000000000001','0c0a5e00-0000-4000-8000-000000000026',6)
on conflict (course_id, speaker_id) do nothing;

-- ---------- Team ----------
insert into public.team_members (id, name, role, bio, photo_url, sort_order, is_published)
values
  ('0c0a5e00-0000-4000-8000-000000000031','Dr. Kavita Sharma','Program Director','Leads NEDC programs with 15 years in entrepreneurship education.','https://i.pravatar.cc/400?img=45',1,true),
  ('0c0a5e00-0000-4000-8000-000000000032','Arjun Verma','Head of Cohorts','Runs day-to-day operations and keeps every cohort on track.','https://i.pravatar.cc/400?img=14',2,true),
  ('0c0a5e00-0000-4000-8000-000000000033','Meera Joshi','Community & Mentors','Connects founders with the right mentors and alumni.','https://i.pravatar.cc/400?img=32',3,true),
  ('0c0a5e00-0000-4000-8000-000000000034','Sahil Khan','Curriculum Lead','Designs the hands-on workshops and resources.','https://i.pravatar.cc/400?img=60',4,true)
on conflict (id) do nothing;

-- ---------- Gallery (placeholder photos; varied sizes for the masonry layout) ----------
insert into public.gallery_images (id, image_url, caption, sort_order, is_published)
values
  ('0c0a5e00-0000-4000-8000-000000000041','https://picsum.photos/seed/nedc-g1/800/600','Demo day, March 2026',1,true),
  ('0c0a5e00-0000-4000-8000-000000000042','https://picsum.photos/seed/nedc-g2/800/1000','A live working session',2,true),
  ('0c0a5e00-0000-4000-8000-000000000043','https://picsum.photos/seed/nedc-g3/800/700','Mentor Q&A',3,true),
  ('0c0a5e00-0000-4000-8000-000000000044','https://picsum.photos/seed/nedc-g4/800/600','Cohort kickoff',4,true),
  ('0c0a5e00-0000-4000-8000-000000000045','https://picsum.photos/seed/nedc-g5/800/900','Founders networking',5,true),
  ('0c0a5e00-0000-4000-8000-000000000046','https://picsum.photos/seed/nedc-g6/800/600','Pitch practice',6,true),
  ('0c0a5e00-0000-4000-8000-000000000047','https://picsum.photos/seed/nedc-g7/800/800','Team brainstorming',7,true),
  ('0c0a5e00-0000-4000-8000-000000000048','https://picsum.photos/seed/nedc-g8/800/650','Graduation',8,true)
on conflict (id) do nothing;

-- ---------- FAQs ----------
insert into public.faqs (id, question, answer, sort_order, is_published)
values
  ('0c0a5e00-0000-4000-8000-000000000051','Who is this program for?','First-time founders, students, and professionals with a startup idea (or the itch to find one). No prior experience is required — just commitment for the week.',1,true),
  ('0c0a5e00-0000-4000-8000-000000000052','How are the sessions delivered?','Live on Zoom, scheduled in IST. You join from your dashboard each day. There is no pre-recorded course to binge — it is real-time and interactive.',2,true),
  ('0c0a5e00-0000-4000-8000-000000000053','What if I miss a session?','Every session is recorded and added to your dashboard, so you can catch up. Live attendance is recommended to get the most out of mentor Q&A.',3,true),
  ('0c0a5e00-0000-4000-8000-000000000054','How much time should I set aside each day?','Plan for roughly 3–4 hours per day: the live workshop plus a working session on your own idea.',4,true),
  ('0c0a5e00-0000-4000-8000-000000000055','How do I pay?','Securely via Razorpay — UPI, debit/credit cards, or netbanking. All prices are in INR.',5,true),
  ('0c0a5e00-0000-4000-8000-000000000056','Do I get a certificate?','Yes. You receive a certificate of completion at the end of the program.',6,true),
  ('0c0a5e00-0000-4000-8000-000000000057','What is your refund policy?','If you change your mind before the cohort starts, contact us for a full refund. Once the program begins, fees are non-refundable.',7,true),
  ('0c0a5e00-0000-4000-8000-000000000058','I have another question — how do I reach you?','Email us at hello@nedc.example and we will get back to you quickly.',8,true)
on conflict (id) do nothing;
