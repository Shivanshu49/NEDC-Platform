"use client";

import Image from "next/image";
import { useState } from "react";
import { Play } from "lucide-react";

/**
 * Lightweight YouTube embed (click-to-play "facade").
 *
 * On load we render only the thumbnail + a play button — no YouTube iframe, so
 * the page stays fast and sets no YouTube cookies until the user opts in. On
 * click we swap in the privacy-enhanced (youtube-nocookie) iframe and autoplay.
 *
 * Requires youtube-nocookie.com in the CSP frame-src and i.ytimg.com in
 * next.config images.remotePatterns (both already set).
 */
export function VideoEmbed({
  videoId,
  title,
  className = "",
}: {
  videoId: string;
  title: string;
  className?: string;
}) {
  const [playing, setPlaying] = useState(false);
  // Prefer the 16:9 maxres thumbnail; fall back to hqdefault (always present) if
  // a given video has no maxres image.
  const [thumb, setThumb] = useState(
    `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
  );

  return (
    <div
      className={`relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-primary shadow-float ${className}`}
    >
      {playing ? (
        <iframe
          className="absolute inset-0 size-full"
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`Play video: ${title}`}
          className="group absolute inset-0 size-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Image
            src={thumb}
            alt=""
            fill
            sizes="(min-width: 1024px) 46rem, 90vw"
            className="object-cover"
            onError={() =>
              setThumb(`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`)
            }
          />
          {/* navy scrim → lifts on hover so the thumbnail brightens */}
          <span
            aria-hidden
            className="absolute inset-0 bg-primary/30 transition-colors group-hover:bg-primary/15"
          />
          {/* maroon play button — the one accent */}
          <span
            aria-hidden
            className="absolute left-1/2 top-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-brand text-brand-foreground shadow-lift transition-transform duration-200 group-hover:scale-110"
          >
            <Play className="size-7 translate-x-0.5 fill-current" />
          </span>
        </button>
      )}
    </div>
  );
}
