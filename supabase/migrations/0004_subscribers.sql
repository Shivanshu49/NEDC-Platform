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
