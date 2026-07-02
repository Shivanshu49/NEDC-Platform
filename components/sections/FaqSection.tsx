import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/**
 * Section S15 — "FAQ".
 *
 * Server component that renders the (client) shadcn/Radix Accordion. Answers are
 * intentionally honest and concrete: no fabricated price, duration, or refund
 * figures — those live with the published policy / registration flow.
 */

export type QA = {
  question: string;
  answer: string;
};

// Exported so the /edp ad landing page can reuse (a trimmed subset of) the same
// answers instead of maintaining a second copy that drifts.
export const FAQS: QA[] = [
  {
    question: "Who is this for?",
    answer:
      "Students, youth, women, rural and agri aspirants, and working professionals across India. No prior business experience is needed, just the intent to learn how to build one.",
  },
  {
    question: "Is it fully online?",
    answer:
      "The program runs online and hybrid, with mentor-led live sessions. You can join from anywhere in India with a phone or laptop and an internet connection.",
  },
  {
    question: "How long is it?",
    answer:
      "It is a focused, multi-day immersive program. The final schedule (exact days and timings) is announced at registration so you can plan ahead.",
  },
  {
    question: "What do I get, and is there a certificate?",
    answer:
      "Yes. A Certificate of Completion from NEDC, along with session recordings to revisit, ready-to-use templates, and guidance from mentors throughout the program.",
  },
  {
    question: "How do I pay, and is it secure?",
    answer:
      "Payments are handled securely through Razorpay (UPI, cards, and net banking). You receive instant confirmation by email and SMS once your registration is complete.",
  },
  {
    question: "What's the refund policy?",
    answer:
      "Refunds follow our published Refund & Cancellation policy. You can read the full terms on the Refund & Cancellation page before you register.",
  },
  {
    question: "Do I need a business idea already?",
    answer:
      "Not at all. The program is built to help you find, shape, and test an idea, whether you are starting from a blank page or refining something you already have in mind.",
  },
];

export function FaqSection() {
  return (
    <section id="faq" className="scroll-mt-24 bg-secondary/40 py-16 sm:py-24">
      <Container>
        <SectionHeading
          center
          eyebrow="FAQ"
          title="Frequently asked questions"
        />

        {/* Bordered card keeps the accordion grounded and easy to read on mobile. */}
        <div className="mt-10 overflow-hidden rounded-2xl border border-border bg-card px-5 shadow-soft sm:mt-12 sm:px-7">
          <Accordion type="single" collapsible>
            {FAQS.map((faq) => (
              <AccordionItem key={faq.question} value={faq.question}>
                <AccordionTrigger className="text-base text-foreground">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-base">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Container>
    </section>
  );
}
