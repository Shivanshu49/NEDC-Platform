import { serve } from "inngest/next";
import { type NextRequest } from "next/server";
import { inngest } from "@/lib/inngest";
import { processRecording } from "@/lib/inngest-functions";

export const runtime = "nodejs";

/**
 * Inngest's serve endpoint. Inngest calls this URL to run our background
 * functions; it also handles registration/handshake. It verifies request
 * signatures using INNGEST_SIGNING_KEY, which it reads from the environment.
 *
 * SECURITY — fail closed: if the signing key is missing in production, Inngest
 * couldn't verify signatures, so the endpoint would accept unsigned (forgeable)
 * invocations that could drive the Mux pipeline. We therefore REJECT every
 * request with 503 in production when the key is absent. This check runs PER
 * REQUEST (not at module load) so `next build` — which runs with
 * NODE_ENV=production but without runtime secrets — isn't broken. Locally the
 * Inngest dev server doesn't sign, so the key may be unset in development.
 */
const handlers = serve({
  client: inngest,
  functions: [processRecording],
});

function signingKeyMissingInProd(): boolean {
  return (
    process.env.NODE_ENV === "production" && !process.env.INNGEST_SIGNING_KEY
  );
}

function blocked(): Response {
  return new Response(
    JSON.stringify({ error: "Inngest signing key not configured" }),
    { status: 503, headers: { "content-type": "application/json" } },
  );
}

export async function GET(req: NextRequest): Promise<Response> {
  if (signingKeyMissingInProd()) return blocked();
  return handlers.GET(req, undefined);
}

export async function POST(req: NextRequest): Promise<Response> {
  if (signingKeyMissingInProd()) return blocked();
  return handlers.POST(req, undefined);
}

export async function PUT(req: NextRequest): Promise<Response> {
  if (signingKeyMissingInProd()) return blocked();
  return handlers.PUT(req, undefined);
}
