import { formatDateTime } from "@/lib/format";
import { RecordingPlayer } from "@/components/RecordingPlayer";

/**
 * One live session in the student dashboard: title, date/time (IST), a status
 * badge, the Zoom join button, and the recording slot.
 *
 * `status` is computed server-side from the session time. When a recording is
 * `ready` (Phase 5), the recording slot shows a signed, share-proof Mux player
 * (RecordingPlayer) that fetches a short-lived token on demand.
 */
type RecordingState =
  | { state: "none" }
  | { state: "processing" }
  | { state: "ready"; recordingId: string };

export function SessionCard({
  title,
  dayNumber,
  startsAt,
  zoomJoinUrl,
  status,
  recording,
}: {
  title: string;
  dayNumber: number | null;
  startsAt: string;
  zoomJoinUrl: string | null;
  status: "upcoming" | "live" | "past";
  recording: RecordingState;
}) {
  const badge = {
    live: { text: "● Live now", cls: "bg-green-100 text-green-700" },
    upcoming: { text: "Upcoming", cls: "bg-brand/10 text-brand" },
    past: { text: "Completed", cls: "bg-foreground/10 text-foreground/60" },
  }[status];

  // Show the Zoom button while the session is upcoming or live (it's gone once past).
  const showJoin = status !== "past" && !!zoomJoinUrl;

  return (
    <li className="rounded-2xl border border-foreground/10 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            {dayNumber != null && (
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand">
                {dayNumber}
              </span>
            )}
            <h3 className="font-semibold">{title}</h3>
          </div>
          <p className="mt-1 text-sm text-foreground/70">
            {formatDateTime(startsAt)} IST
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${badge.cls}`}>
          {badge.text}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {showJoin ? (
          <a
            href={zoomJoinUrl!}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full bg-brand px-5 py-2 text-sm font-semibold text-brand-foreground transition hover:bg-brand/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            {status === "live" ? "Join live now" : "Join on Zoom"}
          </a>
        ) : status !== "past" ? (
          <span className="text-sm text-foreground/60">Join link coming soon</span>
        ) : null}

        {/* Recording slot (Phase 5) */}
        {recording.state === "ready" ? (
          <RecordingPlayer recordingId={recording.recordingId} title={title} />
        ) : status === "past" ? (
          <span className="text-sm text-foreground/60">
            {recording.state === "processing"
              ? "Recording is processing…"
              : "Recording will appear here soon"}
          </span>
        ) : null}
      </div>
    </li>
  );
}
