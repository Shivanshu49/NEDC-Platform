"use client";

import Script from "next/script";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, ShieldCheck } from "lucide-react";

import { OffsetCard } from "@/components/OffsetCard";
import { buttonVariants } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  edpRegistrationFields,
  normalizeIndianPhone,
  type EdpRegistrationFields,
} from "@/lib/validation";

/**
 * The /edp hero registration form — registration + payment as ONE continuous
 * flow, no navigation between steps:
 *
 *   submit → POST /api/edp/register (lead saved + enquiry email + Razorpay
 *   order at the SERVER price) → Razorpay Checkout opens in place, prefilled →
 *   success handler → POST /api/edp/verify (signature check server-side) →
 *   router.push(/edp/thank-you?ref=…).
 *
 * Failure/dismiss keeps the visitor right here with their form data intact and
 * a retry notice — the lead is already saved, and a retry reuses the same lead
 * row and open order (via registrationId) so nothing duplicates.
 */

type Phase = "idle" | "saving" | "paying" | "verifying";

type Notice = { tone: "error" | "info"; text: string };

type OrderPayload = {
  registrationId: string;
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  cohortName?: string;
};

export function EdpRegistrationForm({
  cohortId,
  priceLabel,
  startLabel,
  registrationOpen,
}: {
  /** Only passed when the featured cohort is genuinely open for enrollment. */
  cohortId?: string;
  /** Display-only formatted price (₹). The charged amount is server-derived. */
  priceLabel?: string;
  startLabel: string;
  registrationOpen: boolean;
}) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const [notice, setNotice] = useState<Notice | null>(null);
  const [leadSaved, setLeadSaved] = useState(false);
  // Set after the first successful save; retries update the SAME lead + order.
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);

  const form = useForm<EdpRegistrationFields>({
    resolver: zodResolver(edpRegistrationFields),
    mode: "onTouched",
    defaultValues: { name: "", email: "", phone: "", message: "" },
  });

  async function onSubmit(values: EdpRegistrationFields) {
    setNotice(null);
    setPhase("saving");
    try {
      const res = await fetch("/api/edp/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          cohortId,
          registrationId: registrationId ?? undefined,
          website: honeypotRef.current?.value ?? "",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        // The lead may still have been saved (e.g. the Razorpay order failed
        // after the insert) — remember it so a retry doesn't duplicate.
        if (typeof data?.registrationId === "string") {
          setRegistrationId(data.registrationId);
        }
        setNotice({
          tone: "error",
          text: data?.error ?? "Something went wrong. Please try again.",
        });
        setPhase("idle");
        return;
      }
      setRegistrationId(data.registrationId);
      if (data.leadOnly) {
        setLeadSaved(true);
        setPhase("idle");
        return;
      }
      openCheckout(data as OrderPayload, values);
    } catch {
      setNotice({
        tone: "error",
        text: "Something went wrong. Please check your connection and try again.",
      });
      setPhase("idle");
    }
  }

  function openCheckout(order: OrderPayload, values: EdpRegistrationFields) {
    if (typeof window === "undefined" || !window.Razorpay) {
      setNotice({
        tone: "error",
        text: "The payment window couldn't load. Your details are saved — please refresh and try again.",
      });
      setPhase("idle");
      return;
    }
    setPhase("paying");
    const phone = normalizeIndianPhone(values.phone) ?? values.phone;
    const rzp = new window.Razorpay({
      key: order.keyId,
      order_id: order.orderId,
      amount: order.amount,
      currency: order.currency,
      name: "NEDC",
      description: order.cohortName ?? "EDP registration",
      prefill: { name: values.name, email: values.email, contact: `+91${phone}` },
      theme: { color: "#0a2f6b" }, // NEDC navy
      handler: (response) => {
        void confirmPayment(response, order.registrationId);
      },
      modal: {
        // Dismissed without paying: stay here, keep their data, offer retry.
        // (Don't clobber a more specific payment-failed message.)
        ondismiss: () => {
          setPhase("idle");
          setNotice((current) =>
            current?.tone === "error"
              ? current
              : {
                  tone: "info",
                  text: "Payment not completed — no money was taken. Your details are saved; hit the button whenever you're ready to try again.",
                },
          );
        },
      },
    });
    rzp.on("payment.failed", (resp) => {
      setPhase("idle");
      setNotice({
        tone: "error",
        text: `${
          resp?.error?.description || "Your payment couldn't be completed."
        } Your details are saved — you can retry right away.`,
      });
    });
    rzp.open();
  }

  async function confirmPayment(
    response: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    },
    savedRegistrationId: string,
  ) {
    setPhase("verifying");
    try {
      const res = await fetch("/api/edp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(response),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.verified) {
        router.push(`/edp/thank-you${data.ref ? `?ref=${data.ref}` : ""}`);
        return;
      }
      // An explicit signature mismatch is a real problem — fail closed.
      setNotice({
        tone: "error",
        text: "We couldn't confirm your payment. If money left your account, your confirmation email will still arrive shortly — otherwise please try again or WhatsApp us.",
      });
      setPhase("idle");
    } catch {
      // Network hiccup while confirming — the Razorpay webhook is the source
      // of truth, so continue; the thank-you page shows a "confirming" state.
      router.push(`/edp/thank-you?ref=${savedRegistrationId}`);
    }
  }

  // Lead captured while registration isn't open → a quiet success, no payment.
  if (leadSaved) {
    return (
      <OffsetCard>
        <div className="flex items-start gap-3 p-6 sm:p-7">
          <CheckCircle2 className="mt-0.5 size-6 shrink-0 text-success" aria-hidden />
          <div>
            <p className="font-display font-bold text-foreground">
              Details received!
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Registration for the next cohort isn&apos;t open just yet. Our
              team will reach out on WhatsApp and email the moment it is — you
              won&apos;t lose your spot in line.
            </p>
          </div>
        </div>
      </OffsetCard>
    );
  }

  const busy = phase !== "idle";
  const buttonLabel =
    phase === "saving"
      ? "Starting secure checkout…"
      : phase === "paying"
        ? "Complete payment in the Razorpay window"
        : phase === "verifying"
          ? "Confirming your payment…"
          : registrationOpen
            ? "Register & Pay"
            : "Register";

  return (
    <>
      {/* Razorpay Checkout widget (adds window.Razorpay) */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />
      <OffsetCard>
        <div className="p-6 sm:p-7">
          {/* Card header: what + when + how much, in one glance. */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand">
                Registration
              </p>
              <h2 className="font-display mt-1 text-xl font-bold tracking-tight text-foreground">
                Register your seat
              </h2>
            </div>
            {priceLabel && (
              <div className="text-right">
                <p className="font-display text-2xl font-extrabold tracking-tight text-primary">
                  {priceLabel}
                </p>
                <p className="text-[11px] font-medium text-muted-foreground">
                  one-time, all-inclusive
                </p>
              </div>
            )}
          </div>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {registrationOpen
              ? `Starts ${startLabel} · limited seats per cohort`
              : "Registration opens soon — leave your details and we'll contact you first."}
          </p>

          <Form {...form}>
            <form
              // Built at event time (not render) — onSubmit reads the honeypot
              // ref, which must never be touched during render.
              onSubmit={(event) => void form.handleSubmit(onSubmit)(event)}
              className="relative mt-5 space-y-4"
              noValidate
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        data-edp-first-field
                        autoComplete="name"
                        placeholder="Your full name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        placeholder="you@email.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span
                          aria-hidden
                          className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm font-medium text-muted-foreground"
                        >
                          +91
                        </span>
                        <Input
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel-national"
                          placeholder="98765 43210"
                          className="pl-12"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Message{" "}
                      <span className="font-normal text-muted-foreground">
                        (optional)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="Anything you'd like us to know?"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Honeypot — humans never see it; bots that fill it get a 400. */}
              <input
                ref={honeypotRef}
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="absolute -left-[9999px] top-0 h-px w-px opacity-0"
              />

              {notice && (
                <div
                  role="status"
                  aria-live="polite"
                  className={cn(
                    "rounded-xl border px-4 py-3 text-sm leading-relaxed",
                    notice.tone === "error"
                      ? "border-destructive/30 bg-destructive/5 text-destructive"
                      : "border-primary/20 bg-primary/5 text-foreground",
                  )}
                >
                  {notice.text}
                </div>
              )}

              <button
                type="submit"
                disabled={busy}
                className={cn(
                  buttonVariants({ variant: "default", size: "lg" }),
                  "w-full rounded-full shadow-soft",
                )}
              >
                {busy && (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                )}
                {buttonLabel}
              </button>

              <p className="flex items-start justify-center gap-1.5 text-center text-xs leading-relaxed text-muted-foreground">
                <ShieldCheck
                  className="mt-0.5 size-3.5 flex-none text-success"
                  aria-hidden
                />
                Secure payment via Razorpay · UPI, cards &amp; net banking
              </p>
            </form>
          </Form>
        </div>
      </OffsetCard>
    </>
  );
}
