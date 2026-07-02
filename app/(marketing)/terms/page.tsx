import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { Badge } from "@/components/ui/badge";
import { CONTACT } from "@/lib/content";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "The terms and conditions governing your use of NEDC's website and the Entrepreneurship Development Program (EDP).",
};

export default function TermsPage() {
  return (
    <section className="py-16 sm:py-24">
      <Container className="max-w-3xl">
        <SectionHeading
          as="h1"
          eyebrow="Legal"
          title="Terms & Conditions"
        />

        {/* Draft callout — honest disclosure that this copy is not yet final. */}
        <div className="mt-8 rounded-2xl border border-border bg-brand/5 p-5">
          <Badge variant="outline">Draft</Badge>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            This page is provided in good faith as a working draft and is pending
            final legal review. It is not a substitute for professional legal
            advice and may change before publication.
          </p>
        </div>

        {/* Prose body */}
        <div className="mt-12 space-y-10">
          <div className="space-y-3">
            <h2 className="font-display text-xl font-bold text-foreground">
              1. Acceptance of these terms
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              By accessing this website, creating an account, or enrolling in a
              program, you agree to be bound by these Terms &amp; Conditions and
              our Privacy Policy. If you do not agree, please do not use the
              service.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-xl font-bold text-foreground">
              2. About the service
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              The National Entrepreneurship Development Center (NEDC) provides an
              educational Entrepreneurship Development Program (EDP) delivered
              online and in hybrid formats. The program offers mentorship,
              learning sessions, and guidance to help you build entrepreneurial
              skills.
            </p>
            <p className="leading-relaxed text-muted-foreground">
              NEDC is a learning platform, not a government body. We help
              participants understand and access public schemes such as Startup
              India, MSME support, Mudra, and Skill India, but we do not
              administer those schemes. The program does not guarantee any
              specific business outcome, registration, funding, income, or
              employment result.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-xl font-bold text-foreground">
              3. Eligibility
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              The program is open to students, youth, working professionals,
              women, and rural and agri aspirants who wish to learn to build a
              business. If you are a minor, you must have the consent of a parent
              or legal guardian to register and to make any payment.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-xl font-bold text-foreground">
              4. Registration & accounts
            </h2>
            <ul className="list-disc space-y-2 pl-5 leading-relaxed text-muted-foreground">
              <li>
                You agree to provide accurate, current, and complete information
                when you register.
              </li>
              <li>
                You are responsible for keeping your account credentials secure
                and for all activity that occurs under your account.
              </li>
              <li>
                Please notify us promptly if you suspect any unauthorised use of
                your account.
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-xl font-bold text-foreground">
              5. Payments
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              Enrolment requires a one-time program fee in Indian Rupees (INR),
              payable securely through our payment partner, Razorpay (which
              supports UPI, cards, and netbanking). The fee shown at checkout is
              the amount you will be charged. Cancellations and refunds are
              governed by our Refund &amp; Cancellation Policy.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-xl font-bold text-foreground">
              6. Acceptable use
            </h2>
            <ul className="list-disc space-y-2 pl-5 leading-relaxed text-muted-foreground">
              <li>
                Use the service only for lawful, personal, non-commercial
                learning purposes.
              </li>
              <li>
                Do not share, resell, record, or redistribute live sessions,
                join links, or recordings.
              </li>
              <li>
                Do not attempt to disrupt, reverse-engineer, or gain unauthorised
                access to the platform or other users&apos; accounts.
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-xl font-bold text-foreground">
              7. Intellectual property
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              All course materials, session content, recordings, and platform
              content are the property of NEDC or its licensors and are protected
              by applicable laws. You are granted a personal, non-transferable,
              non-commercial licence to access them for your own learning. You may
              not copy, distribute, or use them commercially without our written
              permission.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-xl font-bold text-foreground">
              8. Third-party links
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              The service may link to third-party websites, including government
              portals such as Startup India, MSME, and Skill India. These links
              are provided for convenience only. NEDC does not control and is not
              responsible for the content, policies, or availability of any
              third-party site.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-xl font-bold text-foreground">
              9. Limitation of liability
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              The service is provided on an &ldquo;as is&rdquo; and &ldquo;as
              available&rdquo; basis. To the maximum extent permitted by law, NEDC
              is not liable for any indirect, incidental, or consequential losses
              arising from your use of the service, and our total liability is
              limited to the program fee you paid.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-xl font-bold text-foreground">
              10. Governing law
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              These terms are governed by the laws of India. The courts of
              competent jurisdiction in India will have authority over any
              dispute; the specific jurisdiction (city) is to be confirmed before
              publication.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-xl font-bold text-foreground">
              11. Changes to these terms
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              We may update these terms from time to time. Material changes will
              be reflected on this page. Your continued use of the service after
              an update means you accept the revised terms.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="font-display text-xl font-bold text-foreground">
              12. Contact
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              Questions about these terms? Email us at{" "}
              <a
                href={`mailto:${CONTACT.email}`}
                className="rounded-sm font-medium text-brand underline underline-offset-2 hover:text-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {CONTACT.email}
              </a>
{" "}
              or call{" "}
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
