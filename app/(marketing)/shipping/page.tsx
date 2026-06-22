import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { Badge } from "@/components/ui/badge";
import { CONTACT } from "@/lib/content";

export const metadata: Metadata = {
  title: "Shipping & Delivery Policy",
  description:
    "How NEDC delivers access to its digital Entrepreneurship Development Program (EDP). There is no physical shipment.",
};

export default function ShippingPage() {
  return (
    <section className="py-16 sm:py-24">
      <Container className="max-w-3xl">
        <SectionHeading
          as="h1"
          eyebrow="Legal"
          title="Shipping & Delivery Policy"
        />

        {/* Draft callout — honest disclosure that this copy is not yet final. */}
        <div className="mt-8 rounded-2xl border border-border bg-brand/5 p-5">
          <Badge variant="outline">Draft</Badge>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            This page is provided in good faith as a working draft and is pending
            final legal review. It explains how access to our digital program is
            delivered and may change before publication.
          </p>
        </div>

        {/* Prose body */}
        <div className="mt-12 space-y-10">
          <div className="space-y-3">
            <h2 className="font-display text-xl font-bold text-foreground">
              A digital program with no physical shipment
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              The Entrepreneurship Development Program (EDP) is delivered entirely
              online and in hybrid formats. There is{" "}
              <span className="font-medium text-foreground">no physical product</span>{" "}
              to ship, so no shipping charges or courier delivery apply.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-xl font-bold text-foreground">
              How access is delivered
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              Once your payment is successfully confirmed, access is delivered
              electronically, immediately or shortly afterwards:
            </p>
            <ul className="list-disc space-y-2 pl-5 leading-relaxed text-muted-foreground">
              <li>
                A confirmation is sent to you by email and SMS using the details
                you provided at registration.
              </li>
              <li>
                Your Zoom join links, session schedule, and (after each session)
                recordings appear inside your student dashboard.
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-xl font-bold text-foreground">
              If you don&apos;t receive access
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              If your payment was successful but you have not received access
              within a short time, please first check your email spam or
              promotions folder. If you still need help, contact us at{" "}
              <a
                href={`mailto:${CONTACT.email}`}
                className="rounded-sm font-medium text-brand underline underline-offset-2 hover:text-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {CONTACT.email}
              </a>{" "}
              or call{" "}
              <a
                href={`tel:${CONTACT.phone.replace(/\s/g, "")}`}
                className="rounded-sm font-medium text-brand underline underline-offset-2 hover:text-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {CONTACT.phone}
              </a>{" "}
              and we will restore your access promptly.
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
