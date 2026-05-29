import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { FaqAccordion } from "@/components/FaqAccordion";
import { EmptyState } from "@/components/EmptyState";
import { getFaqs } from "@/lib/queries";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to common questions about the NEDC program.",
};

export default async function FaqPage() {
  const faqs = await getFaqs();

  return (
    <section className="py-16 sm:py-24">
      <Container className="max-w-3xl">
        <SectionHeading
          eyebrow="FAQ"
          title="Frequently asked questions"
          center
          as="h1"
        />
        <div className="mt-12">
          {faqs.length > 0 ? (
            <FaqAccordion faqs={faqs} />
          ) : (
            <EmptyState message="FAQs will appear here. Add rows to the 'faqs' table in Supabase (or run supabase/seed.sql)." />
          )}
        </div>
      </Container>
    </section>
  );
}
