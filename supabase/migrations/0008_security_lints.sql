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
