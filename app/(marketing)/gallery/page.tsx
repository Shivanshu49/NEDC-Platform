import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { EmptyState } from "@/components/EmptyState";
import { getGalleryImages } from "@/lib/queries";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Gallery",
  description: "Moments from past NEDC programs and events.",
};

export default async function GalleryPage() {
  const images = await getGalleryImages();

  return (
    <section className="py-16 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="Gallery"
          title="Moments from past programs"
          subtitle="A look at the cohorts, demo days, and community behind NEDC."
          as="h1"
        />
        {images.length > 0 ? (
          // CSS columns give a simple masonry layout; break-inside-avoid keeps
          // each image whole.
          <div className="mt-12 columns-1 gap-4 sm:columns-2 lg:columns-3 *:mb-4">
            {images.map((img) => (
              <figure
                key={img.id}
                className="break-inside-avoid overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
              >
                <Image
                  src={img.image_url}
                  alt={img.caption ?? "NEDC program photo"}
                  width={800}
                  height={600}
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="h-auto w-full"
                />
                {img.caption && (
                  <figcaption className="p-3 text-sm text-muted-foreground">
                    {img.caption}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        ) : (
          <div className="mt-10">
            <EmptyState message="Photos will appear here. Add rows to the 'gallery_images' table in Supabase (or run supabase/seed.sql)." />
          </div>
        )}
      </Container>
    </section>
  );
}
