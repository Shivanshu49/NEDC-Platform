"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { rateLimit } from "@/lib/ratelimit";
import { logEvent } from "@/lib/log";

/**
 * Newsletter "notify me on the next EDP" signup (server action).
 *
 * Validates the email, rate-limits per IP, and inserts into `subscribers` via
 * the service-role client (the table is default-deny to clients). A repeat
 * signup is a harmless no-op thanks to the unique(lower(email)) constraint.
 */
const schema = z.object({
  email: z.email("Please enter a valid email").max(200),
  source: z.string().max(40).optional(),
});

export type NewsletterState = { ok: boolean; error?: string };

export async function subscribe(
  _prev: NewsletterState,
  formData: FormData,
): Promise<NewsletterState> {
  const hdrs = await headers();
  const ip =
    hdrs.get("x-vercel-forwarded-for") ??
    hdrs.get("x-forwarded-for")?.split(",").pop()?.trim() ??
    hdrs.get("x-real-ip") ??
    "unknown";
  const { ok } = await rateLimit("contact", ip); // reuse the contact limiter
  if (!ok) {
    return { ok: false, error: "Please try again in a little while." };
  }

  const parsed = schema.safeParse({
    email: formData.get("email"),
    source: formData.get("source") ?? undefined,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid email." };
  }

  try {
    const admin = createSupabaseAdminClient();
    // Store lowercased; ignore duplicates so repeat signups don't error.
    const { error } = await admin
      .from("subscribers")
      .upsert(
        {
          email: parsed.data.email.toLowerCase(),
          source: parsed.data.source ?? null,
        },
        { onConflict: "email", ignoreDuplicates: true },
      );
    if (error) {
      logEvent("error", "newsletter.insert_failed", { reason: error.message });
      return { ok: false, error: "Couldn't subscribe. Please try again." };
    }
    logEvent("info", "newsletter.subscribed", { source: parsed.data.source });
    return { ok: true };
  } catch {
    return { ok: false, error: "Couldn't subscribe. Please try again." };
  }
}
