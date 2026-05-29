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
