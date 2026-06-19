"use client";

import { useState } from "react";
import MuxPlayer from "@mux/mux-player-react";

/**
 * Plays a session recording with a SIGNED, share-proof Mux token.
 *
 * We don't embed the token in the page. The user clicks "Watch", we fetch a
 * fresh short-lived token from /api/recordings/[id]/token (which re-checks the
 * user is still enrolled), and only then load the player. A copied page URL is
 * useless; a copied token expires fast.
 */
export function RecordingPlayer({
  recordingId,
  title,
}: {
  recordingId: string;
  title: string;
}) {
  const [state, setState] = useState<"idle" | "loading" | "ready" | "error">(
    "idle",
  );
  const [playback, setPlayback] = useState<{ id: string; token: string } | null>(
    null,
  );

  async function loadToken() {
    setState("loading");
    try {
      const res = await fetch(`/api/recordings/${recordingId}/token`);
      if (!res.ok) {
        setState("error");
        return;
      }
      const data = await res.json();
      setPlayback({ id: data.playbackId, token: data.token });
      setState("ready");
    } catch {
      setState("error");
    }
  }

  if (state === "ready" && playback) {
    return (
      <MuxPlayer
        playbackId={playback.id}
        tokens={{ playback: playback.token }}
        metadata={{ video_title: title }}
        streamType="on-demand"
        className="aspect-video w-full overflow-hidden rounded-xl"
      />
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={loadToken}
        disabled={state === "loading"}
        className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {state === "loading" ? "Loading…" : "Watch recording"}
      </button>
      {state === "error" && (
        <p className="mt-2 text-sm text-red-600">
          Couldn&apos;t load the recording. Please refresh and try again.
        </p>
      )}
    </div>
  );
}
