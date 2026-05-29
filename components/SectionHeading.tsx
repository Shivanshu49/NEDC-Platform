/**
 * Consistent heading block for page sections: small eyebrow + title + intro.
 *
 * `as` controls the heading level: pass `as="h1"` when this is the page's TOP
 * heading (so every page has exactly one <h1>); leave the default "h2" for
 * sections within a page. The styling is identical either way.
 */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  center = false,
  as: Heading = "h2",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
  as?: "h1" | "h2";
}) {
  return (
    <div className={`max-w-2xl ${center ? "mx-auto text-center" : ""}`}>
      {eyebrow && (
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-brand">
          {eyebrow}
        </p>
      )}
      <Heading className="text-3xl font-bold tracking-tight sm:text-4xl">
        {title}
      </Heading>
      {subtitle && <p className="mt-4 text-lg text-foreground/70">{subtitle}</p>}
    </div>
  );
}
