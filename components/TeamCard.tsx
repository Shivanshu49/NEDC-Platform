import Image from "next/image";
import type { TeamMember } from "@/lib/types";
import { OffsetCard } from "@/components/OffsetCard";

/** A team member's photo + role in the signature offset card. */
export function TeamCard({ member }: { member: TeamMember }) {
  return (
    <OffsetCard>
      <div className="flex flex-col items-center p-6 text-center">
        {member.photo_url ? (
          <Image
            src={member.photo_url}
            alt={member.name}
            width={160}
            height={160}
            sizes="112px"
            className="size-28 rounded-full object-cover"
          />
        ) : (
          <div className="size-28 rounded-full bg-muted" />
        )}
        <h3 className="mt-4 font-semibold text-foreground">{member.name}</h3>
        {member.role && (
          <p className="text-sm font-medium text-primary">{member.role}</p>
        )}
        {member.bio && (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {member.bio}
          </p>
        )}
      </div>
    </OffsetCard>
  );
}
