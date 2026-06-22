import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { ProfileCard, type ProfileFields } from "@/components/dashboard/ProfileCard";
import { Badge } from "@/components/ui/badge";
import { formatDateRange } from "@/lib/format";

export type DashProfile = (ProfileFields & { created_at: string | null }) | null;

export type DashEnrollment = {
  id: string;
  plan: "basic" | "premium" | null;
  cohort: {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    course: { title: string } | null;
  } | null;
};

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <span className="flex size-11 flex-none items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="font-display truncate text-lg font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
}

function ProgramCard({ e }: { e: DashEnrollment }) {
  if (!e.cohort) return null;
  return (
    <Link
      href={`/dashboard/${e.cohort.id}`}
      className="group flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <BookOpen className="size-5" />
        </span>
        {e.plan === "premium" ? (
          <Badge variant="brand">
            <Sparkles className="size-3.5" aria-hidden />
            Premium
          </Badge>
        ) : (
          <Badge variant="default">Basic</Badge>
        )}
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
        {e.cohort.course?.title ?? "Your program"}
      </h3>
      <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
        <CalendarDays className="size-4" />
        {e.cohort.name} · {formatDateRange(e.cohort.start_date, e.cohort.end_date)}
      </p>
      <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary">
        View schedule and join links
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

export function DashboardHome({
  email,
  profile,
  enrollments,
  justEnrolled = false,
}: {
  email: string;
  profile: DashProfile;
  enrollments: DashEnrollment[];
  justEnrolled?: boolean;
}) {
  const firstName =
    profile?.full_name?.trim().split(/\s+/)[0] || email.split("@")[0] || "there";
  const hasPremium = enrollments.some((e) => e.plan === "premium");
  const planLabel = enrollments.length === 0 ? "—" : hasPremium ? "Premium" : "Basic";
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      })
    : "—";

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Welcome back, {firstName}.
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your profile and jump back into your programs.
        </p>
      </div>

      {/* Post-payment success banner */}
      {justEnrolled && (
        <div className="flex items-start gap-3 rounded-2xl border border-success/20 bg-success/5 p-4">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" />
          <p className="text-sm text-foreground">
            <span className="font-semibold">Payment received. Welcome aboard!</span>{" "}
            If your program isn&apos;t showing yet, give it a moment and refresh.
          </p>
        </div>
      )}

      {/* Profile */}
      <ProfileCard email={email} profile={profile} />

      {/* Account stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat icon={BookOpen} label="Programs" value={enrollments.length} />
        <Stat icon={BadgeCheck} label="Plan" value={planLabel} />
        <Stat icon={CalendarDays} label="Member since" value={memberSince} />
      </div>

      {/* Programs */}
      <section>
        <h2 className="font-display text-lg font-bold tracking-tight text-foreground">
          My programs
        </h2>
        {enrollments.length > 0 ? (
          <ul className="mt-5 grid gap-5 sm:grid-cols-2">
            {enrollments.map((e) =>
              e.cohort ? (
                <li key={e.id}>
                  <ProgramCard e={e} />
                </li>
              ) : null,
            )}
          </ul>
        ) : (
          <div className="mt-5 flex flex-col items-center rounded-3xl border border-dashed border-border bg-card px-6 py-16 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Sparkles className="size-7" />
            </span>
            <h3 className="mt-5 font-display text-lg font-semibold text-foreground">
              You&apos;re not enrolled yet
            </h3>
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
        )}
      </section>
    </div>
  );
}
