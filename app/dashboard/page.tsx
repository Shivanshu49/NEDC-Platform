import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  DashboardHome,
  type DashEnrollment,
  type DashProfile,
} from "@/components/dashboard/DashboardHome";

export const metadata: Metadata = { title: "My dashboard" };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ enrolled?: string }>;
}) {
  const { enrolled } = await searchParams;
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  // The layout already redirects signed-out users; this guard is for types.
  if (!user) return null;

  // RLS limits both reads to THIS user. `select("*")` on profiles keeps working
  // even before 0006 is applied (the new columns just read as undefined).
  const [{ data: profileRow }, { data: enrollData }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase
      .from("enrollments")
      .select(
        "id, plan, cohort:cohorts(id, name, start_date, end_date, course:courses(title))",
      )
      .eq("status", "active"),
  ]);

  // Pass only the fields the UI needs to the client — never serialize is_admin
  // or the email snapshot into client props.
  const p = (profileRow as Record<string, unknown> | null) ?? null;
  const profile: DashProfile = p
    ? {
        full_name: (p.full_name as string | null) ?? null,
        phone: (p.phone as string | null) ?? null,
        profession: (p.profession as string | null) ?? null,
        organization: (p.organization as string | null) ?? null,
        city: (p.city as string | null) ?? null,
        bio: (p.bio as string | null) ?? null,
        avatar_url: (p.avatar_url as string | null) ?? null,
        created_at: (p.created_at as string | null) ?? null,
      }
    : null;

  return (
    <DashboardHome
      userId={user.id}
      email={user.email ?? ""}
      profile={profile}
      enrollments={(enrollData as DashEnrollment[] | null) ?? []}
      justEnrolled={Boolean(enrolled)}
    />
  );
}
