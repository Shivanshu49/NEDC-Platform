import type { Metadata } from "next";
import Link from "next/link";
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
      <h1 className="text-2xl font-bold tracking-tight">My courses</h1>

      {enrolled && (
        <div className="mt-4 rounded-lg bg-brand/5 p-4 text-sm">
          Payment received — welcome aboard! If your course isn&apos;t showing
          yet, give it a moment and refresh.
        </div>
      )}

      {enrollments.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-foreground/15 p-10 text-center text-foreground/70">
          You&apos;re not enrolled in a cohort yet.{" "}
          <Link href="/pricing" className="font-semibold text-brand hover:underline">
            Browse programs →
          </Link>
          <p className="mt-2 text-xs text-foreground/50">
            Just paid? Access unlocks within a moment — refresh this page.
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {enrollments.map((e) =>
            e.cohort ? (
              <li key={e.id}>
                <Link
                  href={`/dashboard/${e.cohort.id}`}
                  className="block rounded-2xl border border-foreground/10 p-6 transition hover:border-brand/40 hover:bg-foreground/2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                >
                  <p className="font-semibold">
                    {e.cohort.course?.title ?? "Your program"}
                  </p>
                  <p className="text-sm text-foreground/70">
                    {e.cohort.name} ·{" "}
                    {formatDateRange(e.cohort.start_date, e.cohort.end_date)}
                  </p>
                  <p className="mt-3 text-sm font-medium text-brand">
                    View schedule &amp; join links →
                  </p>
                </Link>
              </li>
            ) : null,
          )}
        </ul>
      )}
    </div>
  );
}
