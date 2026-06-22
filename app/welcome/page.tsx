import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";

export const metadata: Metadata = {
  title: "Welcome, set up your profile",
  robots: { index: false, follow: false },
};

/**
 * One-time post-login onboarding. The middleware + /dashboard layout route a
 * freshly signed-in user here while `profiles.onboarded_at` is NULL. Once they
 * finish or skip, that column is stamped and this page redirects to /dashboard,
 * so it never shows twice.
 */
export default async function WelcomePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/welcome");

  const { data: profileRow } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const p = (profileRow as Record<string, unknown> | null) ?? null;

  // Already onboarded → straight to the dashboard.
  if (p?.onboarded_at) redirect("/dashboard");

  // Prefer a name Google handed us; the column may also already hold one.
  const metaName =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    "";

  return (
    <OnboardingWizard
      userId={user.id}
      email={user.email ?? ""}
      initial={{
        full_name: ((p?.full_name as string | null) ?? null) || metaName,
        phone: (p?.phone as string | null) ?? "",
        profession: (p?.profession as string | null) ?? "",
        organization: (p?.organization as string | null) ?? "",
        city: (p?.city as string | null) ?? "",
        bio: (p?.bio as string | null) ?? "",
        avatar_url: (p?.avatar_url as string | null) ?? null,
      }}
    />
  );
}
