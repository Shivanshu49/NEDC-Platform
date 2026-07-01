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

drop trigger if exists profiles_set_updated_at on public.profiles;
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

drop trigger if exists courses_set_updated_at on public.courses;
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

drop trigger if exists cohorts_set_updated_at on public.cohorts;
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

drop trigger if exists sessions_set_updated_at on public.sessions;
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

drop trigger if exists enrollments_set_updated_at on public.enrollments;
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

drop trigger if exists payments_set_updated_at on public.payments;
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

drop trigger if exists recordings_set_updated_at on public.recordings;
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
drop trigger if exists speakers_set_updated_at on public.speakers;
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
drop trigger if exists team_members_set_updated_at on public.team_members;
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
drop trigger if exists gallery_images_set_updated_at on public.gallery_images;
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
drop trigger if exists faqs_set_updated_at on public.faqs;
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
