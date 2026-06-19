"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { rateLimit } from "@/lib/ratelimit";
import { logEvent } from "@/lib/log";

/**
 * Contact inquiry form submission (server action).
 *
 * Validates with Zod, rate-limits per IP, and inserts into `inquiries` via the
 * service-role client (the table is default-deny to clients). Never trusts the
 * client for anything beyond the validated fields.
 */
const inquirySchema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(120),
  email: z.email("Please enter a valid email").max(200),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  subject: z.string().trim().max(160).optional().or(z.literal("")),
  message: z.string().trim().min(5, "Please write a short message").max(4000),
});

export type ContactState = {
  ok: boolean;
  error?: string;
};

export async function submitInquiry(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  // Rate limit per IP (graceful no-op until Upstash is configured).
  const hdrs = await headers();
  const ip =
    hdrs.get("x-vercel-forwarded-for") ??
    hdrs.get("x-forwarded-for")?.split(",").pop()?.trim() ??
    hdrs.get("x-real-ip") ??
    "unknown";
  const { ok } = await rateLimit("contact", ip);
  if (!ok) {
    return { ok: false, error: "Too many messages. Please try again shortly." };
  }

  const parsed = inquirySchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Please check the form.",
    };
  }

  try {
    const admin = createSupabaseAdminClient();
    const { error } = await admin.from("inquiries").insert({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      subject: parsed.data.subject || null,
      message: parsed.data.message,
    });
    if (error) {
      logEvent("error", "contact.insert_failed", { reason: error.message });
      return { ok: false, error: "Couldn't send your message. Please try again." };
    }
    logEvent("info", "contact.inquiry_received", {});
    return { ok: true };
  } catch {
    return { ok: false, error: "Couldn't send your message. Please try again." };
  }
}
