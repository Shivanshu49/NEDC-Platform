import Image from "next/image";
import type { Speaker } from "@/lib/types";
import { OffsetCard } from "@/components/OffsetCard";

/** A speaker's photo + bio in the signature offset card. */
export function SpeakerCard({ speaker }: { speaker: Speaker }) {
  return (
    <OffsetCard innerClassName="overflow-hidden">
      {speaker.photo_url ? (
        <Image
          src={speaker.photo_url}
          alt={speaker.name}
          width={400}
          height={400}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="aspect-square w-full object-cover"
        />
      ) : (
        // Fallback box when no photo is set, so the layout doesn't jump.
        <div className="aspect-square w-full bg-muted" />
      )}
      <div className="p-5">
        <h3 className="font-semibold text-foreground">{speaker.name}</h3>
        {speaker.title && (
          <p className="text-sm font-medium text-primary">{speaker.title}</p>
        )}
        {speaker.bio && (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {speaker.bio}
          </p>
        )}
      </div>
    </OffsetCard>
  );
}
