import "server-only";
import { Inngest } from "inngest";

/**
 * Inngest client — runs background jobs reliably (with automatic retries) off
 * the request path. We use it for the recordings pipeline so the Zoom webhook
 * can return instantly while the slow work (fetch → upload to Mux → wait for
 * encoding) happens in the background.
 */
export const inngest = new Inngest({ id: "nedc-platform" });

/** Event names we send, kept in one place to avoid typos. */
export const EVENTS = {
  RECORDING_COMPLETED: "zoom/recording.completed",
} as const;
