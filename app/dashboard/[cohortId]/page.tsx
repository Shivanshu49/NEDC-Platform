import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock, Video } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SessionCard } from "@/components/SessionCard";
import { formatDateRange, sessionStatus } from "@/lib/format";

export const metadata: Metadata = { title: "Course schedule" };

type EnrollmentRow = {
  id: string;
  cohort: {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    course: { title: string } | null;
  } | null;
};

type SessionRow = {
  id: string;
  title: string;
  day_number: number | null;
  starts_at: string;
  ends_at: string | null;
  zoom_join_url: string | null;
};

type RecordingRow = {
  id: string;
  session_id: string;
  status: "pending" | "processing" | "ready" | "failed";
};

export default async function CohortDashboardPage({
  params,
}: {
  params: Promise<{ cohortId: string }>;
}) {
  const { cohortId } = await params;
  const supabase = await createSupabaseServerClient();

  // 1. Confirm THIS user has an active enrollment in THIS cohort. RLS already
  //    limits enrollments to the current user, so this is both the access check
  //    and where we fetch the cohort/course details.
  const { data: enrollmentData } = await supabase
    .from("enrollments")
    .select(
      "id, cohort:cohorts(id, name, start_date, end_date, course:courses(title))",
    )
    .eq("cohort_id", cohortId)
    .eq("status", "active")
    .maybeSingle();
  const enrollment = enrollmentData as EnrollmentRow | null;

  // Not enrolled (or refunded/cancelled) → back to the dashboard. Even if this
  // check were skipped, RLS would return zero sessions, so links never leak.
  if (!enrollment || !enrollment.cohort) {
    redirect("/dashboard");
  }
  const cohort = enrollment.cohort;

  // 2. Sessions — visible only because we're enrolled (RLS via is_enrolled()).
  const { data: sessionData } = await supabase
    .from("sessions")
    .select("id, title, day_number, starts_at, ends_at, zoom_join_url")
    .eq("cohort_id", cohortId)
    .order("day_number", { ascending: true })
    .order("starts_at", { ascending: true });
  const sessions = (sessionData as SessionRow[] | null) ?? [];

  // 3. Recordings for those sessions. RLS only returns rows for cohorts the user
  //    is enrolled in; the actual video is still gated by a signed Mux token.
  const recordingBySession = new Map<string, RecordingRow>();
  if (sessions.length > 0) {
    const { data: recData } = await supabase
      .from("recordings")
      .select("id, session_id, status")
      .in(
        "session_id",
        sessions.map((s) => s.id),
      );
    for (const r of (recData as RecordingRow[] | null) ?? []) {
      recordingBySession.set(r.session_id, r);
    }
  }

  // Request-time "now" (this page is dynamic) drives each session's status.
  const now = new Date();

  return (
    <div>
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        All my courses
      </Link>

      {/* Course header card */}
      <div className="mt-4 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {cohort.course?.title ?? "Your program"}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-4" />
            {cohort.name} ·{" "}
            {formatDateRange(cohort.start_date, cohort.end_date)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-4" />
            Times shown in IST
          </span>
        </div>
      </div>

      <h2 className="mt-10 flex items-center gap-2 font-display text-lg font-semibold text-foreground">
        <Video className="size-5 text-primary" />
        Session schedule
      </h2>

      {sessions.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
          The schedule will appear here as soon as sessions are published. Check
          back shortly before your start date.
        </div>
      ) : (
        <ul className="mt-4 space-y-4">
          {sessions.map((s) => {
            const rec = recordingBySession.get(s.id);
            const recording =
              rec?.status === "ready"
                ? ({ state: "ready", recordingId: rec.id } as const)
                : rec?.status === "processing"
                  ? ({ state: "processing" } as const)
                  : ({ state: "none" } as const);
            return (
              <SessionCard
                key={s.id}
                title={s.title}
                dayNumber={s.day_number}
                startsAt={s.starts_at}
                zoomJoinUrl={s.zoom_join_url}
                status={sessionStatus(s.starts_at, s.ends_at, now)}
                recording={recording}
              />
            );
          })}
        </ul>
      )}

      <p className="mt-8 text-sm text-muted-foreground">
        Recordings of each session appear here after it ends.
      </p>
    </div>
  );
}
