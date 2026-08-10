import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * App-level rate limiting (Upstash Redis, serverless-friendly).
 *
 * GRACEFUL NO-OP: if the Upstash env vars aren't set, every call is allowed.
 * This keeps local dev and pre-setup deploys working — but set the two env vars
 * in production (see .env.example) so the limits actually apply.
 *
 * Limits are sliding-window. Keep them generous enough not to bother real users;
 * the goal is to blunt scripted abuse (mass order creation, token farming), not
 * to throttle normal clicking.
 */
function makeLimiter(
  tokens: number,
  window: Parameters<typeof Ratelimit.slidingWindow>[1],
) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(tokens, window),
    analytics: false,
    prefix: "nedc-rl",
  });
}

// One limiter per protected action. `null` until Upstash is configured.
const LIMITERS = {
  // Creating a Razorpay order is billable/abusable — keep it tight.
  checkout: makeLimiter(10, "1 m"),
  // Minting signed playback tokens — generous (a page can request several).
  recordingToken: makeLimiter(60, "1 m"),
  // Public contact form — blunt spam/flooding.
  contact: makeLimiter(5, "10 m"),
  // /edp registration form — creates a lead + Razorpay order + sends an
  // enquiry email. Slightly looser than `contact` because legitimate payment
  // retries re-POST here (they reuse the same lead/order, but still count).
  edpRegister: makeLimiter(8, "10 m"),
  // Profile self-edits — generous; just blunts scripted write spam.
  profile: makeLimiter(20, "1 m"),
  // Post-login onboarding submit/skip — generous; one-time flow.
  onboarding: makeLimiter(20, "1 m"),
} as const;

/**
 * Returns { ok: false } when the caller has exceeded the limit for `action`.
 * `identifier` should be the user id when available, else the client IP.
 */
export async function rateLimit(
  action: keyof typeof LIMITERS,
  identifier: string,
): Promise<{ ok: boolean }> {
  const limiter = LIMITERS[action];
  if (!limiter) return { ok: true }; // not configured → allow
  const { success } = await limiter.limit(identifier);
  return { ok: success };
}

/** Best-effort client IP from proxy headers (Vercel sets x-forwarded-for). */
export function clientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return request.headers.get("x-real-ip")?.trim() ?? "unknown";
}
