/**
 * Section heading block — serif title in navy-slate, like the reference.
 *
 * `as` controls the heading level: pass `as="h1"` when this is the page's TOP
 * heading (so every page has exactly one <h1>); leave the default "h2" for
 * sections. `eyebrow` is an optional small label above the title.
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
        <p
          className={`mb-3 inline-flex items-center gap-2.5 text-xs font-bold uppercase tracking-[0.16em] text-primary ${
            center ? "justify-center" : ""
          }`}
        >
          <span aria-hidden className="h-px w-6 bg-brand" />
          {eyebrow}
        </p>
      )}
      <Heading className="font-display text-balance text-fluid-h2 font-bold leading-tight tracking-tight text-foreground">
        {title}
      </Heading>
      {subtitle && (
        <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground">
          {subtitle}
        </p>
      )}
    </div>
  );
}
