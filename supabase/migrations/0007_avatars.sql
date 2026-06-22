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
