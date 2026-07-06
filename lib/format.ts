/**
 * Small display helpers. Keep all formatting in one place so the whole site is
 * consistent.
 */

/** Money is stored as integer PAISE (see CLAUDE.md). Show it as ₹ rupees. */
export function formatINR(paise: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100);
}

/** Format a plain ISO date ("2026-07-14") as "14 July 2026". */
export function formatDate(iso: string): string {
  // Append a time so it's parsed at local midnight (avoids off-by-one in some TZs).
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Date + time in IST, e.g. "Tue, 14 Jul 2026, 6:00 PM". For session start times. */
export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });
}

/**
 * Where a live session sits relative to `now`:
 *  - "upcoming" — hasn't started
 *  - "live"     — between start and end (defaults to a 2-hour window if no end)
 *  - "past"     — finished
 */
export function sessionStatus(
  startsAt: string,
  endsAt: string | null,
  now: Date,
): "upcoming" | "live" | "past" {
  const start = new Date(startsAt).getTime();
  const end = endsAt
    ? new Date(endsAt).getTime()
    : start + 2 * 60 * 60 * 1000; // assume 2h if no end time set
  const t = now.getTime();
  if (t < start) return "upcoming";
  if (t > end) return "past";
  return "live";
}

/**
 * A daily session window like "6:30 PM to 8:30 PM" from two wall-clock time
 * strings ("18:30" or "18:30:00"). The inputs are already in the cohort's local
 * timezone (IST), so we format the wall-clock directly and never shift zones.
 * Returns null if either bound is missing/malformed (caller can then hide it).
 */
export function formatTimeRange(
  start: string | null | undefined,
  end: string | null | undefined,
): string | null {
  const fmt = (t: string): string | null => {
    const [hRaw, mRaw] = t.split(":");
    const h = Number(hRaw);
    const m = Number(mRaw ?? "0");
    if (!Number.isInteger(h) || h < 0 || h > 23 || !Number.isInteger(m) || m < 0 || m > 59) {
      return null;
    }
    const period = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return m === 0
      ? `${hour12} ${period}`
      : `${hour12}:${String(m).padStart(2, "0")} ${period}`;
  };
  if (!start || !end) return null;
  const s = fmt(start);
  const e = fmt(end);
  if (!s || !e) return null;
  return `${s} to ${e}`;
}

/** Friendly range, e.g. "14–19 July 2026" or "30 July – 4 August 2026". */
export function formatDateRange(startIso: string, endIso: string): string {
  const start = new Date(`${startIso}T00:00:00`);
  const end = new Date(`${endIso}T00:00:00`);
  const sameMonth =
    start.getMonth() === end.getMonth() &&
    start.getFullYear() === end.getFullYear();

  if (sameMonth) {
    const monthYear = start.toLocaleDateString("en-IN", {
      month: "long",
      year: "numeric",
    });
    return `${start.getDate()} to ${end.getDate()} ${monthYear}`;
  }
  const opts: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
  };
  return `${start.toLocaleDateString("en-IN", opts)} to ${end.toLocaleDateString("en-IN", opts)}`;
}
