"use client";

import { useEffect } from "react";

/**
 * Fires the Meta Pixel `Purchase` event for a confirmed-paid EDP registration.
 * Render it ONLY when the server has verified payment_status === 'paid' — the
 * decision of *whether* to track lives in the thank-you page, this component
 * only guarantees *once per payment*:
 *
 *  - a localStorage flag keyed by the registration id makes refreshes and
 *    back/forward visits no-ops (set only AFTER a successful fbq call, so an
 *    ad-blocked first visit doesn't burn the flag);
 *  - `eventID` lets Meta drop any duplicate that slips through anyway (e.g.
 *    localStorage cleared, or a future server-side Conversions API).
 */
export function PurchasePixel({
  registrationId,
  amountPaise,
}: {
  registrationId: string;
  /** Amount paid in integer paise, exactly as stored on the registration. */
  amountPaise: number;
}) {
  useEffect(() => {
    const storageKey = `nedc-edp-purchase-${registrationId}`;
    try {
      if (window.localStorage.getItem(storageKey)) return;
    } catch {
      // Storage unavailable (private mode / blocked) — fall through and rely
      // on the eventID for dedupe.
    }

    let cancelled = false;
    let attempts = 0;

    // The pixel snippet is in <head>, but fbevents.js is still async — retry
    // briefly rather than silently dropping a real conversion.
    const fire = () => {
      if (cancelled) return;
      if (window.fbq) {
        window.fbq(
          "track",
          "Purchase",
          // Meta expects currency units (rupees), not paise.
          { value: amountPaise / 100, currency: "INR" },
          { eventID: registrationId },
        );
        try {
          window.localStorage.setItem(storageKey, new Date().toISOString());
        } catch {
          // Best effort — eventID still protects against double-counting.
        }
        return;
      }
      if (attempts++ < 20) setTimeout(fire, 250);
    };
    fire();

    return () => {
      cancelled = true;
    };
  }, [registrationId, amountPaise]);

  return null;
}
