"use client";

import Script from "next/script";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

/**
 * Enroll → Razorpay checkout.
 *
 * Flow: POST /api/checkout (server creates the order) → open Razorpay Checkout →
 * the payment webhook grants the enrollment → we send the user to the dashboard.
 * - 401 from checkout means "not logged in" → send to /login.
 * - 409 means "already enrolled" → send to /dashboard.
 */
export function EnrollButton({
  cohortId,
  cohortName,
  className = "",
}: {
  cohortId: string;
  cohortName: string;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname(); // so post-login returns to the page they were on
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleEnroll() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cohortId }),
      });

      if (res.status === 401) {
        router.push(`/login?next=${encodeURIComponent(pathname)}`);
        return;
      }
      const data = await res.json();
      if (res.status === 409 && data.alreadyEnrolled) {
        router.push("/dashboard");
        return;
      }
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }
      if (typeof window === "undefined" || !window.Razorpay) {
        setError("Payment couldn't load. Please refresh and try again.");
        setLoading(false);
        return;
      }

      const rzp = new window.Razorpay({
        key: data.keyId,
        order_id: data.orderId,
        amount: data.amount,
        currency: data.currency,
        name: "NEDC",
        description: data.cohortName ?? cohortName,
        prefill: data.prefillEmail ? { email: data.prefillEmail } : undefined,
        theme: { color: "#0a2f6b" }, // NEDC navy (matches the brand)
        // On success, confirm the handler signature server-side before moving on.
        // The webhook still grants access; this is a fast, tamper-proof gate.
        handler: async (response) => {
          try {
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json().catch(() => ({}));
            if (verifyRes.ok && verifyData.verified) {
              router.push("/dashboard?enrolled=1");
              return;
            }
            // An explicit mismatch is a real problem — don't pretend it worked.
            setError(
              "We couldn't confirm your payment. If you were charged, your access will appear shortly — otherwise please try again or contact support.",
            );
            setLoading(false);
          } catch {
            // Network hiccup confirming — the webhook is authoritative, so send
            // them along; access shows up on the dashboard once it lands.
            router.push("/dashboard?enrolled=1");
          }
        },
        modal: { ondismiss: () => setLoading(false) },
      });
      rzp.on("payment.failed", (resp) => {
        setError(
          resp?.error?.description ||
            "Your payment couldn't be completed. Please try again.",
        );
        setLoading(false);
      });
      rzp.open();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <>
      {/* Razorpay Checkout widget (adds window.Razorpay) */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <button
        type="button"
        onClick={handleEnroll}
        disabled={loading}
        className={`inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className}`}
      >
        {loading ? "Processing…" : "Enroll now"}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </>
  );
}
