import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { Badge } from "@/components/ui/badge";
import { CONTACT } from "@/lib/content";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How NEDC collects, uses, and protects your personal information, and the rights you have over your data.",
};

export default function PrivacyPage() {
  return (
    <section className="py-16 sm:py-24">
      <Container className="max-w-3xl">
        <SectionHeading as="h1" eyebrow="Legal" title="Privacy Policy" />

        {/* Draft callout — honest disclosure that this copy is not yet final. */}
        <div className="mt-8 rounded-2xl border border-border bg-brand/5 p-5">
          <Badge variant="outline">Draft</Badge>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            This page is provided in good faith as a working draft and is pending
            final legal review. It describes our intended data practices and may
            change before publication.
          </p>
        </div>

        {/* Prose body */}
        <div className="mt-12 space-y-10">
          <div className="space-y-3">
            <p className="leading-relaxed text-muted-foreground">
              This policy explains what information the National Entrepreneurship
              Development Center (NEDC) collects when you use this website and the
              Entrepreneurship Development Program (EDP), how we use it, and the
              choices you have.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-xl font-bold text-foreground">
              Information we collect
            </h2>
            <ul className="list-disc space-y-2 pl-5 leading-relaxed text-muted-foreground">
              <li>
                <span className="font-medium text-foreground">
                  Account details
                </span>{" "}
                — your name, email address, and phone number when you register or
                contact us.
              </li>
              <li>
                <span className="font-medium text-foreground">
                  Payment metadata
                </span>{" "}
                — order and transaction identifiers and payment status received
                from our payment partner. NEDC does{" "}
                <span className="font-medium text-foreground">not</span> store
                your card, UPI, or netbanking credentials; those are handled
                entirely by Razorpay.
              </li>
              <li>
                <span className="font-medium text-foreground">
                  Usage information
                </span>{" "}
                — basic technical data needed to keep your session secure and the
                platform working.
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-xl font-bold text-foreground">
              How we use your information
            </h2>
            <ul className="list-disc space-y-2 pl-5 leading-relaxed text-muted-foreground">
              <li>To create and manage your account.</li>
              <li>
                To give you access to your program, session schedule, join links,
                and recordings.
              </li>
              <li>To send receipts, confirmations, and important updates.</li>
              <li>To provide support and respond to your enquiries.</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-xl font-bold text-foreground">
              Service providers we work with
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              We rely on trusted processors to operate the service, and we share
              only the information each one needs:
            </p>
            <ul className="list-disc space-y-2 pl-5 leading-relaxed text-muted-foreground">
              <li>
                <span className="font-medium text-foreground">Supabase</span> —
                secure database, authentication, and storage of your account data.
              </li>
              <li>
                <span className="font-medium text-foreground">Razorpay</span> —
                payment processing; they handle your payment credentials directly.
              </li>
              <li>
                <span className="font-medium text-foreground">Resend</span> —
                delivery of transactional email such as receipts and join links.
              </li>
              <li>
                <span className="font-medium text-foreground">
                  Our SMS provider
                </span>{" "}
                — delivery of confirmation messages.
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-xl font-bold text-foreground">
              Cookies & sessions
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              We use essential cookies to keep you signed in and to maintain a
              secure session. These are required for the platform to function and
              are not used for advertising.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-xl font-bold text-foreground">
              Data retention
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              We keep your information for as long as your account is active and
              for any period needed to meet legal, tax, or accounting
              obligations. When it is no longer required, we delete or anonymise
              it.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-xl font-bold text-foreground">
              Your rights
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              You may request to access, correct, or delete the personal
              information we hold about you. To make a request, email us at{" "}
              <a
                href={`mailto:${CONTACT.email}`}
                className="rounded-sm font-medium text-brand underline underline-offset-2 hover:text-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {CONTACT.email}
              </a>{" "}
              and we will respond within a reasonable time.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-xl font-bold text-foreground">
              Contact for privacy requests
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              For any privacy question or request, contact us at{" "}
              <a
                href={`mailto:${CONTACT.email}`}
                className="rounded-sm font-medium text-brand underline underline-offset-2 hover:text-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {CONTACT.email}
              </a>
              , call{" "}
              <a
                href={`tel:${CONTACT.phone.replace(/\s/g, "")}`}
                className="rounded-sm font-medium text-brand underline underline-offset-2 hover:text-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {CONTACT.phone}
              </a>
              , or write to us at {CONTACT.address}.
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
