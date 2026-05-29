import "server-only";
import { inngest, EVENTS } from "@/lib/inngest";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSignedAssetFromUrl } from "@/lib/mux";

/**
 * The recordings pipeline, as an Inngest background job.
 *
 * Triggered by the `zoom/recording.completed` event (sent from the Zoom
 * webhook). Each `step.run` is retried independently on failure and its result
 * is memoized, so a retry won't re-do completed steps.
 *
 * Flow: find the session by Zoom meeting id → mark the recording 'processing' →
 * create a SIGNED Mux asset from Zoom's download URL → store the asset/playback
 * ids and mark it 'ready'. The dashboard then shows a signed, share-proof player.
 */
export const processRecording = inngest.createFunction(
  {
    id: "process-zoom-recording",
    retries: 3,
    triggers: [{ event: EVENTS.RECORDING_COMPLETED }],
  },
  async ({ event, step }) => {
    const { zoomMeetingId, downloadUrl } = event.data as {
      zoomMeetingId: string;
      downloadUrl: string;
    };

    // 1. Find the session this Zoom meeting maps to.
    const sessionId = await step.run("find-session", async () => {
      const admin = createSupabaseAdminClient();
      const { data } = await admin
        .from("sessions")
        .select("id")
        .eq("zoom_meeting_id", zoomMeetingId)
        .maybeSingle();
      return data?.id ?? null;
    });
    if (!sessionId) {
      // No matching session — nothing to attach the recording to. Stop cleanly.
      return { skipped: "no matching session for zoom meeting" };
    }

    // 2. Mark a recording row 'processing' (upsert: one row per session, so a
    //    re-delivered event reuses the same row instead of duplicating).
    await step.run("mark-processing", async () => {
      const admin = createSupabaseAdminClient();
      await admin
        .from("recordings")
        .upsert(
          { session_id: sessionId, status: "processing" },
          { onConflict: "session_id" },
        );
    });

    // 3. Create the SIGNED Mux asset from Zoom's download URL.
    let assetInfo: { assetId: string; playbackId: string | null };
    try {
      assetInfo = await step.run("create-mux-asset", () =>
        createSignedAssetFromUrl(downloadUrl),
      );
    } catch (err) {
      await step.run("mark-failed", async () => {
        const admin = createSupabaseAdminClient();
        await admin
          .from("recordings")
          .update({ status: "failed" })
          .eq("session_id", sessionId);
      });
      throw err; // let Inngest retry
    }

    // 4. Store the ids and mark ready. (Mux finishes encoding asynchronously;
    //    'ready' here means the asset was accepted. A future enhancement can
    //    listen to Mux's video.asset.ready webhook to confirm encoding — for now
    //    the signed player handles "still processing" gracefully.)
    await step.run("save-ready", async () => {
      const admin = createSupabaseAdminClient();
      await admin
        .from("recordings")
        .update({
          mux_asset_id: assetInfo.assetId,
          mux_playback_id: assetInfo.playbackId,
          zoom_recording_url: downloadUrl,
          status: "ready",
        })
        .eq("session_id", sessionId);
    });

    return { sessionId, assetId: assetInfo.assetId };
  },
);
