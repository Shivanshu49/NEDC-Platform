import Image from "next/image";
import type { Speaker } from "@/lib/types";

/** A speaker's photo + bio. Used on the home preview and the /speakers page. */
export function SpeakerCard({ speaker }: { speaker: Speaker }) {
  return (
    <div className="rounded-2xl border border-foreground/10 p-5">
      {speaker.photo_url ? (
        <Image
          src={speaker.photo_url}
          alt={speaker.name}
          width={400}
          height={400}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="aspect-square w-full rounded-xl object-cover"
        />
      ) : (
        // Fallback box when no photo is set, so the layout doesn't jump.
        <div className="aspect-square w-full rounded-xl bg-foreground/5" />
      )}
      <h3 className="mt-4 font-semibold">{speaker.name}</h3>
      {speaker.title && (
        <p className="text-sm font-medium text-brand">{speaker.title}</p>
      )}
      {speaker.bio && (
        <p className="mt-2 text-sm leading-relaxed text-foreground/70">
          {speaker.bio}
        </p>
      )}
    </div>
  );
}
