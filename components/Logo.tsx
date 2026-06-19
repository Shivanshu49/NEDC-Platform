import Image from "next/image";
import Link from "next/link";

/**
 * The official NEDC brand mark.
 *
 * By DEFAULT it renders the ICON ONLY — the compass ring + bar-chart + maroon
 * up-arrow + the four compass-point diamonds — served from
 * `/public/nedc-icon.svg` on a transparent background. This is what the Navbar
 * and Footer use.
 *
 * Pass `withWordmark` to render the full LOCKUP (icon + the "NEDC" wordmark,
 * matching the official logo). Add `subtitle` for the expanded organisation
 * name underneath, and `orientation="vertical"` to stack the icon over the
 * wordmark (the badge style from the brand sheet).
 *
 * `variant`:
 *   "default" — navy + maroon, for LIGHT backgrounds (header, hero, footer-top).
 *   "white"   — icon recolored solid white via a CSS filter + a white wordmark,
 *               for DARK backgrounds (navy bands). We filter rather than
 *               hand-recolor the auto-traced icon paths.
 *
 * Size the ICON with `className` (height + auto width keeps the 1:1 square),
 * e.g. `<Logo className="h-12 w-auto" />`. Size the wordmark with
 * `wordmarkClassName` so the two stay proportional.
 */
export function Logo({
  variant = "default",
  className = "h-12 w-auto",
  priority = false,
  linked = true,
  withWordmark = false,
  orientation = "horizontal",
  subtitle = false,
  wordmarkClassName = "text-xl",
  href = "/",
}: {
  variant?: "default" | "white";
  className?: string;
  priority?: boolean;
  linked?: boolean;
  withWordmark?: boolean;
  orientation?: "horizontal" | "vertical";
  subtitle?: boolean;
  wordmarkClassName?: string;
  href?: string;
}) {
  const icon = (
    <Image
      src="/nedc-icon.svg"
      // Decorative when the visible wordmark already names the brand; otherwise
      // the icon itself carries the accessible name.
      alt={withWordmark ? "" : "NEDC — National Entrepreneurship Development Center"}
      // Intrinsic size = the icon SVG's square viewBox, so `h-* w-auto` keeps
      // the correct 1:1 proportion.
      width={852}
      height={852}
      priority={priority}
      // Local SVG: skip the optimizer (it can't resize SVG) and render as-is.
      unoptimized
      className={`${className} ${
        // brightness-0 → black, invert → white: composes to
        // `filter: brightness(0) invert(100%)`, recoloring the icon solid white
        // in one go while preserving the transparent background.
        variant === "white" ? "brightness-0 invert" : ""
      }`}
    />
  );

  // ----- Icon-only (default) — unchanged behaviour for Navbar / Footer. -----
  if (!withWordmark) {
    if (!linked) return icon;
    return (
      <Link
        href={href}
        aria-label="NEDC home"
        className="inline-flex items-center"
      >
        {icon}
      </Link>
    );
  }

  // ----- Full lockup (icon + "NEDC" wordmark). -----
  const wordColor = variant === "white" ? "text-white" : "text-primary";
  const subColor =
    variant === "white" ? "text-white/70" : "text-muted-foreground";
  const isVertical = orientation === "vertical";

  const lockup = (
    <span
      className={
        isVertical
          ? "inline-flex flex-col items-center gap-2 text-center"
          : "inline-flex items-center gap-3"
      }
    >
      {icon}
      <span
        className={`flex flex-col ${isVertical ? "items-center" : "items-start"} leading-none`}
      >
        <span
          className={`font-display font-extrabold leading-none tracking-tight ${wordColor} ${wordmarkClassName}`}
        >
          NEDC
        </span>
        {subtitle && (
          <span
            className={`mt-1.5 max-w-[15rem] text-[10px] font-medium uppercase leading-tight tracking-[0.12em] ${subColor}`}
          >
            National Entrepreneurship Development Center
          </span>
        )}
      </span>
    </span>
  );

  if (!linked) return lockup;
  return (
    <Link href={href} aria-label="NEDC home" className="inline-flex items-center">
      {lockup}
    </Link>
  );
}
