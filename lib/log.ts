import "server-only";

/**
 * Minimal structured logging for security-relevant events.
 *
 * Emits one JSON line per event so logs are greppable/queryable in Vercel (or
 * any log drain). Deliberately tiny — no dependency.
 *
 * RULE: never pass secrets or full tokens here. Pass only safe identifiers
 * (user id, order id, ip, outcome). Callers are responsible for not leaking.
 */
type Level = "info" | "warn" | "error";

export function logEvent(
  level: Level,
  event: string,
  data: Record<string, unknown> = {},
): void {
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    level,
    event,
    ...data,
  });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}
