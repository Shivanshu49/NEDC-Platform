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
    live: { text: "● Live now", cls: "bg-success/10 text-success" },
    upcoming: { text: "Upcoming", cls: "bg-primary/10 text-primary" },
    past: { text: "Completed", cls: "bg-muted text-muted-foreground" },
  }[status];

  // Show the Zoom button while the session is upcoming or live (it's gone once past).
  const showJoin = status !== "past" && !!zoomJoinUrl;

  return (
    <li className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            {dayNumber != null && (
              <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {dayNumber}
              </span>
            )}
            <h3 className="font-semibold text-foreground">{title}</h3>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
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
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {status === "live" ? "Join live now" : "Join on Zoom"}
          </a>
        ) : status !== "past" ? (
          <span className="text-sm text-muted-foreground">
            Join link coming soon
          </span>
        ) : null}

        {/* Recording slot (Phase 5) */}
        {recording.state === "ready" ? (
          <RecordingPlayer recordingId={recording.recordingId} title={title} />
        ) : status === "past" ? (
          <span className="text-sm text-muted-foreground">
            {recording.state === "processing"
              ? "Recording is processing…"
              : "Recording will appear here soon"}
          </span>
        ) : null}
      </div>
    </li>
  );
}
