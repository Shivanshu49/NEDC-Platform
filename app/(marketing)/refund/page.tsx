import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { Badge } from "@/components/ui/badge";
import { CONTACT } from "@/lib/content";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy",
  description:
    "NEDC's refund and cancellation policy for the Entrepreneurship Development Program (EDP), including timelines and how to request a refund.",
};

export default function RefundPage() {
  return (
    <section className="py-16 sm:py-24">
      <Container className="max-w-3xl">
        <SectionHeading
          as="h1"
          eyebrow="Legal"
          title="Refund & Cancellation Policy"
        />

        {/* Draft callout — honest disclosure that this copy is not yet final. */}
        <div className="mt-8 rounded-2xl border border-border bg-brand/5 p-5">
          <Badge variant="outline">Draft</Badge>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            This page is provided in good faith as a working draft and is pending
            final legal review. The windows and timelines below describe our
            intended policy and may change before publication.
          </p>
        </div>

        {/* Prose body */}
        <div className="mt-12 space-y-10">
          <div className="space-y-3">
            <p className="leading-relaxed text-muted-foreground">
              We want you to enrol with confidence. This policy explains when a
              cancellation qualifies for a refund of the one-time program fee and
              how the process works. All amounts are in Indian Rupees (INR).
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-xl font-bold text-foreground">
              Cancellation windows
            </h2>
            <ul className="list-disc space-y-2 pl-5 leading-relaxed text-muted-foreground">
              <li>
                <span className="font-medium text-foreground">Full refund</span>{" "}
                — if you cancel at least 7 days before the program start date, you
                receive a full refund of the fee paid.
              </li>
              <li>
                <span className="font-medium text-foreground">50% refund</span> —
                if you cancel within 7 days of the start date but before the
                program begins, you receive a refund of 50% of the fee paid.
              </li>
              <li>
                <span className="font-medium text-foreground">No refund</span> —
                once the program has started, or once you have accessed any live
                session or recording, the fee is non-refundable.
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-xl font-bold text-foreground">
              How refunds are processed
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              Approved refunds are returned to your original payment method
              through our payment partner, Razorpay. Once approved, refunds are
              typically processed within 5&ndash;7 business days; the time it
              takes to appear in your account may vary depending on your bank or
              provider.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-xl font-bold text-foreground">
              How to request a refund
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              Email us at{" "}
              <a
                href={`mailto:${CONTACT.email}`}
                className="rounded-sm font-medium text-brand underline underline-offset-2 hover:text-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {CONTACT.email}
              </a>{" "}
              with your registration details — the name and email used to enrol,
              the program and cohort, and your order or payment reference. We will
              review your request and confirm the outcome by email.
            </p>
            <p className="leading-relaxed text-muted-foreground">
              For any questions about a cancellation, you can also call us at{" "}
              <a
                href={`tel:${CONTACT.phone.replace(/\s/g, "")}`}
                className="rounded-sm font-medium text-brand underline underline-offset-2 hover:text-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {CONTACT.phone}
              </a>
              .
            </p>
          </div>
        </div>

        <p className="mt-12 border-t border-border pt-6 text-sm text-muted-foreground">
          Last updated: this date will be set when the policy is published.
        </p>
      </Container>
    </section>
  );
}
