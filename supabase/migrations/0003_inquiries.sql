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
