-- =============================================================================
-- NEDC Platform — /edp landing page: registrations (lead + payment in one row)
-- Run AFTER the earlier migrations, in the Supabase SQL editor. Idempotent.
--
-- The /edp ad landing page collects Name / Email / Phone / Message in the hero
-- and flows straight into Razorpay checkout — no account, no login. Each submit
-- writes ONE row here (the lead), which is then annotated with the Razorpay
-- order and, on success, the payment. A lead is NEVER deleted by the app: a
-- failed or abandoned payment simply leaves payment_status = 'pending'/'failed'
-- so staff can follow up.
--
-- Writes happen via route handlers using the SERVICE-ROLE key (bypasses RLS),
-- so the table is default-deny to clients: anon/authenticated can neither read
-- nor write it. Staff work the leads in the Supabase Table Editor.
-- =============================================================================

create table if not exists public.edp_registrations (
  id                          uuid primary key default gen_random_uuid(),

  -- The lead, exactly as submitted (phone normalized to 10 digits server-side).
  name                        text not null,
  email                       text not null,
  phone                       text not null,
  message                     text,

  -- Which cohort they were buying into (kept even if the cohort is deleted).
  cohort_id                   uuid references public.cohorts(id) on delete set null,

  -- Payment ledger for this funnel. amount_inr is PAISE, server-set from
  -- cohorts.price_inr at order creation — never from the browser.
  amount_inr                  integer,
  currency                    text not null default 'INR',
  razorpay_order_id           text unique,
  razorpay_payment_id         text,
  payment_status              text not null default 'pending'
                              check (payment_status in ('pending', 'paid', 'failed')),

  -- Staff triage, editable in the Table Editor: new | contacted | closed …
  status                      text not null default 'new',

  -- Email bookkeeping — claimed atomically so retries can't double-send.
  enquiry_email_sent_at       timestamptz,
  confirmation_email_sent_at  timestamptz,

  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

create index if not exists edp_registrations_created_at_idx
  on public.edp_registrations(created_at desc);

-- Reuses the shared updated_at trigger function from 0001_init.sql.
drop trigger if exists edp_registrations_set_updated_at on public.edp_registrations;
create trigger edp_registrations_set_updated_at
  before update on public.edp_registrations
  for each row execute function public.set_updated_at();

-- RLS on, with NO policies → clients can't read or write. Only the service role
-- (the /api/edp/* route handlers + Razorpay webhook) and the Table Editor can
-- touch this table.
alter table public.edp_registrations enable row level security;

-- =============================================================================
-- DONE. To work the leads: Supabase → Table Editor → edp_registrations.
--   • payment_status 'paid'   → confirmed registration (Razorpay payment id set)
--   • payment_status 'pending'/'failed' → follow up by phone/email
-- =============================================================================
