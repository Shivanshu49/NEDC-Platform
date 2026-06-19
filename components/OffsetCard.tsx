import { cn } from "@/lib/utils";

/**
 * The reference's SIGNATURE card detail: a white rounded card with a thin
 * indigo border offset slightly down-and-to-the-right behind it (a layered
 * "stacked card" look), NOT a normal drop shadow.
 *
 * Implementation: a relative wrapper holds (1) an absolute, same-size border
 * layer translated +6px/+6px behind the card, and (2) the real white card on
 * top. On hover the offset grows a touch for a subtle lift.
 *
 * `as` lets callers render it as a <li> etc. without an extra wrapper element.
 */
export function OffsetCard({
  children,
  className,
  innerClassName,
}: {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
}) {
  return (
    <div className={cn("group relative", className)}>
      <div
        aria-hidden
        className="absolute inset-0 translate-x-1.5 translate-y-1.5 rounded-2xl border border-primary/50 transition-transform duration-200 group-hover:translate-x-2 group-hover:translate-y-2"
      />
      <div
        className={cn(
          "relative h-full rounded-2xl border border-border bg-card",
          innerClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}
