import { cn } from "@/lib/utils";

/**
 * Centers content and caps its width — the SINGLE source of truth for section
 * width + horizontal padding, used on every marketing section so they all line
 * up to the same left/right edges. Uses `cn()` so a caller's `className` (e.g. a
 * narrower `max-w-*`) merges predictably instead of fighting the base classes.
 */
export function Container({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-[100rem] px-4 sm:px-6 lg:px-8", className)}>
      {children}
    </div>
  );
}
