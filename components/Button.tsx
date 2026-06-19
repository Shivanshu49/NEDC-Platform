import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * A link styled as a button (for navigation/CTAs). Thin wrapper over the shadcn
 * button styles so links and real <button>s look identical.
 *
 * Variant mapping (keeps the old call sites working):
 *   primary   → navy default
 *   accent    → warm amber (reserve for the single most important CTA)
 *   secondary → quiet outline
 *   ghost     → text-only
 */
export function Button({
  href,
  children,
  variant = "primary",
  size = "default",
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "accent" | "brand" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
}) {
  const mapped =
    variant === "primary"
      ? "default"
      : variant === "secondary"
        ? "outline"
        : variant; // accent | ghost pass through

  return (
    <Link
      href={href}
      className={cn(buttonVariants({ variant: mapped, size }), className)}
    >
      {children}
    </Link>
  );
}
