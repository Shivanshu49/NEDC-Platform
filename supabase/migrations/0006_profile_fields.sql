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
