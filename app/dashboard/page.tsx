import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, BookOpen, CheckCircle2, Sparkles } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatDateRange } from "@/lib/format";

export const metadata: Metadata = { title: "My dashboard" };

// Shape of the nested select below (supabase-js returns loose types without
// generated types, so we annotate exactly what we read).
type EnrollmentRow = {
  id: string;
  status: string;
  cohort: {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    course: { title: string } | null;
  } | null;
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ enrolled?: string }>;
}) {
  const { enrolled } = await searchParams;
  const supabase = await createSupabaseServerClient();

  // RLS returns only THIS user's enrollments.
  const { data } = await supabase
    .from("enrollments")
    .select(
      "id, status, cohort:cohorts(id, name, start_date, end_date, course:courses(title))",
    )
    .eq("status", "active");
  const enrollments = (data as EnrollmentRow[] | null) ?? [];

  return (
    <div>
      {/* Page heading */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            My courses
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {enrollments.length > 0
              ? `You're enrolled in ${enrollments.length} ${enrollments.length === 1 ? "program" : "programs"}.`
              : "Your enrolled programs will appear here."}
          </p>
        </div>
      </div>

      {/* Post-payment success banner */}
      {enrolled && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-success/20 bg-success/5 p-4">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" />
          <p className="text-sm text-foreground">
            <span className="font-semibold">Payment received. Welcome aboard!</span>{" "}
            If your course isn&apos;t showing yet, give it a moment and refresh.
          </p>
        </div>
      )}

      {enrollments.length === 0 ? (
        // Empty state
        <div className="mt-8 flex flex-col items-center rounded-3xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Sparkles className="size-7" />
          </span>
          <h2 className="mt-5 font-display text-lg font-semibold text-foreground">
            You&apos;re not enrolled yet
          </h2>
          <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
            Browse our live programs and reserve your seat in the next cohort.
            Access unlocks here the moment your payment is confirmed.
          </p>
          <Link
            href="/pricing"
            className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Browse programs
            <ArrowRight className="size-4" />
          </Link>
        </div>
      ) : (
        // Enrollment cards
        <ul className="mt-8 grid gap-5 sm:grid-cols-2">
          {enrollments.map((e) =>
            e.cohort ? (
              <li key={e.id}>
                <Link
                  href={`/dashboard/${e.cohort.id}`}
                  className="group flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <BookOpen className="size-5" />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
                    {e.cohort.course?.title ?? "Your program"}
                  </h3>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <CalendarDays className="size-4" />
                    {e.cohort.name} ·{" "}
                    {formatDateRange(e.cohort.start_date, e.cohort.end_date)}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                    View schedule &amp; join links
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </li>
            ) : null,
          )}
        </ul>
      )}
    </div>
  );
}
