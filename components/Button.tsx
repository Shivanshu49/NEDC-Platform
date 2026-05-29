import Link from "next/link";

/**
 * A link styled as a button. We use links (not <button>) for navigation/CTAs.
 * `variant` picks the look; everything routes via Next's <Link>.
 */
export function Button({
  href,
  children,
  variant = "primary",
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
}) {
  const base =
    "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2";
  const look =
    variant === "primary"
      ? "bg-brand text-brand-foreground hover:bg-brand/90"
      : "border border-foreground/15 text-foreground hover:bg-foreground/4";
  return (
    <Link href={href} className={`${base} ${look} ${className}`}>
      {children}
    </Link>
  );
}
