import Image from "next/image";
import type { TeamMember } from "@/lib/types";

/** A team member's photo + role. Used on the /team page. */
export function TeamCard({ member }: { member: TeamMember }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-foreground/10 p-6 text-center">
      {member.photo_url ? (
        <Image
          src={member.photo_url}
          alt={member.name}
          width={160}
          height={160}
          sizes="112px"
          className="h-28 w-28 rounded-full object-cover"
        />
      ) : (
        <div className="h-28 w-28 rounded-full bg-foreground/5" />
      )}
      <h3 className="mt-4 font-semibold">{member.name}</h3>
      {member.role && (
        <p className="text-sm font-medium text-brand">{member.role}</p>
      )}
      {member.bio && (
        <p className="mt-2 text-sm leading-relaxed text-foreground/70">
          {member.bio}
        </p>
      )}
    </div>
  );
}
