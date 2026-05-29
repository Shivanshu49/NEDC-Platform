import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Next 16 "proxy" (formerly "middleware"). Runs before matched requests to
 * refresh the Supabase session and guard /dashboard. The logic lives in
 * lib/supabase/middleware.ts (updateSession).
 */
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Run on all routes EXCEPT:
     *  - Next.js internals and static files
     *  - /api/webhooks/* — external callers (Razorpay/Zoom) have no session and
     *    need the RAW request body; the proxy must not touch them.
     *  - /api/inngest — machine-to-machine (signed by Inngest); no session work.
     */
    "/((?!_next/static|_next/image|favicon.ico|api/webhooks|api/inngest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
