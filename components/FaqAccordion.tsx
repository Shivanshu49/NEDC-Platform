import type { Faq } from "@/lib/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/** FAQ list as an accessible shadcn/Radix accordion (one open at a time). */
export function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  return (
    <Accordion
      type="single"
      collapsible
      className="overflow-hidden rounded-xl border border-border bg-card px-5 shadow-sm"
    >
      {faqs.map((faq) => (
        <AccordionItem key={faq.id} value={faq.id}>
          <AccordionTrigger className="text-foreground">
            {faq.question}
          </AccordionTrigger>
          <AccordionContent>{faq.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
