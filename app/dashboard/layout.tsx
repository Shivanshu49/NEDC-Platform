import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { Logo } from "@/components/Logo";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { initials as initialsOf } from "@/lib/profile";

/**
 * Protects the whole /dashboard area. Middleware already redirects signed-out
 * users, but we re-check here (defense in depth) and use the user for the header.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard");

  // Prefer the user's name for the header chip; fall back to the email.
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url, onboarded_at")
    .eq("id", user.id)
    .maybeSingle();

  // Route first-time users through the one-time onboarding flow. Both "Finish"
  // and "Skip for now" stamp onboarded_at, so this only fires once. We require
  // the row to EXIST (profile != null) before redirecting: if the profile row is
  // somehow missing, an onboarding UPDATE would no-op and bounce the user back
  // here forever, so we let them through and render gracefully instead.
  if (profile && !profile.onboarded_at) redirect("/welcome");

  const displayName: string = profile?.full_name?.trim() || user.email || "";
  const avatarUrl = (profile?.avatar_url as string | null) ?? null;
  const initials = initialsOf(profile?.full_name ?? "", user.email ?? "");

  return (
    <div className="min-h-screen bg-secondary/40">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <Logo
            withWordmark
            priority
            className="h-8 w-auto"
            wordmarkClassName="text-lg"
          />
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2.5 rounded-full border border-border bg-card py-1 pl-1 pr-3 sm:flex">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- tiny avatar; next/image optimization is unnecessary
                <img
                  src={avatarUrl}
                  alt=""
                  className="size-7 rounded-full object-cover"
                />
              ) : (
                <span className="flex size-7 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                  {initials}
                </span>
              )}
              <span className="max-w-[14rem] truncate text-sm text-muted-foreground">
                {displayName}
              </span>
            </div>
            {/* Sign out is a POST so a stray link/prefetch can't trigger it. */}
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <LogOut className="size-4" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
