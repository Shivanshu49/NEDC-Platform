"use client";

import type { VariantProps } from "class-variance-authority";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Smooth-scroll to the /edp hero registration form and put the cursor in the
 * first field. Every enroll CTA on the page funnels here — nothing opens a
 * separate page or modal.
 */
export function scrollToRegistrationForm(targetId = "register") {
  const section = document.getElementById(targetId);
  if (!section) return;

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  section.scrollIntoView({
    behavior: reduceMotion ? "auto" : "smooth",
    block: "start",
  });
  window.history.replaceState(null, "", `#${targetId}`);

  const focusFirstField = () =>
    document
      .querySelector<HTMLElement>("[data-edp-first-field]")
      ?.focus({ preventScroll: true });

  if (reduceMotion) {
    focusFirstField();
    return;
  }
  // Focus once the smooth scroll settles ("scrollend" where supported, timer
  // as fallback) so the mobile keyboard doesn't pop up mid-scroll.
  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    window.removeEventListener("scrollend", finish);
    focusFirstField();
  };
  window.addEventListener("scrollend", finish, { once: true });
  window.setTimeout(finish, 700);
}

/**
 * An anchor to the hero form (#register) styled as a button. Renders a real
 * <a href="#register"> so it still works without JS; with JS it adds smooth
 * scrolling + focusing the first field.
 */
export function ScrollToFormLink({
  targetId = "register",
  variant = "default",
  size = "default",
  className,
  children,
}: {
  targetId?: string;
  className?: string;
  children: React.ReactNode;
} & VariantProps<typeof buttonVariants>) {
  return (
    <a
      href={`#${targetId}`}
      className={cn(buttonVariants({ variant, size }), className)}
      onClick={(event) => {
        event.preventDefault();
        scrollToRegistrationForm(targetId);
      }}
    >
      {children}
    </a>
  );
}
