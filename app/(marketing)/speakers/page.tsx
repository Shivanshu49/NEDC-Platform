import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { SpeakerCard } from "@/components/SpeakerCard";
import { EmptyState } from "@/components/EmptyState";
import { getSpeakers } from "@/lib/queries";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Speakers",
  description: "Meet the founders and experts who mentor the NEDC program.",
};

export default async function SpeakersPage() {
  const speakers = await getSpeakers();

  return (
    <section className="py-16 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="Speakers"
          title="Learn from people who've done it"
          subtitle="Founders, investors, and operators who guide you through the program."
          as="h1"
        />
        {speakers.length > 0 ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {speakers.map((sp) => (
              <SpeakerCard key={sp.id} speaker={sp} />
            ))}
          </div>
        ) : (
          <div className="mt-10">
            <EmptyState message="Speakers will be announced soon. Add rows to the 'speakers' table in Supabase (or run supabase/seed.sql)." />
          </div>
        )}
      </Container>
    </section>
  );
}
