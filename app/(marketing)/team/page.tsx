import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { TeamCard } from "@/components/TeamCard";
import { EmptyState } from "@/components/EmptyState";
import { getTeamMembers } from "@/lib/queries";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Team",
  description: "The people behind the National Entrepreneurship Development Center.",
};

export default async function TeamPage() {
  const team = await getTeamMembers();

  return (
    <section className="py-16 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="Our team"
          title="The people behind NEDC"
          subtitle="A small team obsessed with helping first-time founders ship."
          as="h1"
        />
        {team.length > 0 ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((member) => (
              <TeamCard key={member.id} member={member} />
            ))}
          </div>
        ) : (
          <div className="mt-10">
            <EmptyState message="Team members will appear here. Add rows to the 'team_members' table in Supabase (or run supabase/seed.sql)." />
          </div>
        )}
      </Container>
    </section>
  );
}
