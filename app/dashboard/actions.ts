"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/ratelimit";
import { logEvent } from "@/lib/log";

/**
 * Update the signed-in user's own profile.
 *
 * Runs through the user-scoped Supabase client, so Row Level Security
 * (profiles_update_own) limits it to their own row, and the column-level GRANT
 * (see 0001 + 0006) limits WHICH columns can change — a user can never set
 * is_admin or touch anyone else's row from here. Email is intentionally NOT
 * editable: it is managed by the auth provider / login.
 */
const profileSchema = z.object({
  full_name: z.string().trim().max(120, "Name is too long (max 120 characters)."),
  phone: z.string().trim().max(40, "Phone is too long (max 40 characters)."),
  profession: z.string().trim().max(80, "Profession is too long (max 80 characters)."),
  organization: z.string().trim().max(120, "Organization is too long (max 120 characters)."),
  city: z.string().trim().max(80, "City is too long (max 80 characters)."),
  bio: z.string().trim().max(500, "About is too long (max 500 characters)."),
});

export type ProfileState = { ok: boolean; error?: string; savedAt?: number };

const str = (v: FormDataEntryValue | null) => String(v ?? "");
const clean = (v: string) => {
  const t = v.trim();
  return t.length > 0 ? t : null;
};

export async function updateProfile(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Your session expired. Please sign in again." };

  // Generous per-user throttle (graceful no-op until Upstash is configured).
  const { ok: allowed } = await rateLimit("profile", user.id);
  if (!allowed) {
    return { ok: false, error: "Too many updates. Please wait a moment and try again." };
  }

  // FormData.get() returns null for an absent field; normalize to "" so the
  // schema (and a partial/direct POST) is handled gracefully.
  const parsed = profileSchema.safeParse({
    full_name: str(formData.get("full_name")),
    phone: str(formData.get("phone")),
    profession: str(formData.get("profession")),
    organization: str(formData.get("organization")),
    city: str(formData.get("city")),
    bio: str(formData.get("bio")),
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
    })
    .eq("id", user.id);

  if (error) {
    logEvent("error", "profile.update_failed", { reason: error.message });
    return {
      ok: false,
      error: "Couldn't save your profile. Please try again in a moment.",
    };
  }

  revalidatePath("/dashboard");
  // savedAt makes every success a distinct value so the UI reliably detects
  // repeat saves (not just the first false→true transition).
  return { ok: true, savedAt: Date.now() };
}
