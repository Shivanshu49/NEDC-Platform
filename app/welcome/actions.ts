"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/ratelimit";
import { logEvent } from "@/lib/log";
import { profileFields } from "@/lib/validation";

/**
 * Server actions for the one-time post-login onboarding flow (/welcome).
 *
 * Both stamp `profiles.onboarded_at` so onboarding is shown exactly once: the
 * /dashboard layout sends users here only while that column is NULL. Everything
 * runs through the user-scoped Supabase client, so RLS (profiles_update_own) +
 * the per-column GRANTs limit it to the user's own row and the editable columns
 * — a user can never set is_admin or write someone else's profile here.
 */

export type OnboardingState = { ok: boolean; error?: string };

const str = (v: FormDataEntryValue | null) => String(v ?? "");
const clean = (v: string) => {
  const t = v.trim();
  return t.length > 0 ? t : null;
};

export async function completeOnboarding(
  _prev: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/welcome");

  const { ok: allowed } = await rateLimit("onboarding", user.id);
  if (!allowed) {
    return { ok: false, error: "Too many attempts. Please wait a moment and try again." };
  }

  const parsed = profileFields.safeParse({
    full_name: str(formData.get("full_name")),
    phone: str(formData.get("phone")),
    profession: str(formData.get("profession")),
    organization: str(formData.get("organization")),
    city: str(formData.get("city")),
    bio: str(formData.get("bio")),
    avatar_url: str(formData.get("avatar_url")),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Please check the form and try again.",
    };
  }

  const d = parsed.data;
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: clean(d.full_name),
      phone: clean(d.phone),
      profession: clean(d.profession),
      organization: clean(d.organization),
      city: clean(d.city),
      bio: clean(d.bio),
      avatar_url: clean(d.avatar_url),
      onboarded_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    logEvent("error", "onboarding.save_failed", { reason: error.message });
    return { ok: false, error: "Couldn't save your details. Please try again in a moment." };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

/**
 * "Skip for now" — record that the user has seen onboarding (so we don't nag
 * them again) without changing any profile fields, then go to the dashboard.
 * Bound directly to a <form action>, so it receives FormData we ignore.
 */
export async function skipOnboarding(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/welcome");

  const { error } = await supabase
    .from("profiles")
    .update({ onboarded_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) {
    logEvent("error", "onboarding.skip_failed", { reason: error.message });
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
