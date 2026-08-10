"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

import { WhatsAppButton } from "@/components/WhatsAppButton";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { scrollToRegistrationForm } from "./ScrollToFormLink";

/**
 * The /edp page's floating CTAs, coordinated so they never overlap:
 *
 *  - the site's WhatsApp "Chat with us" button (always visible; on mobile it
 *    lifts above the enroll bar while the bar is shown);
 *  - a sticky "Enroll Now" that appears once the visitor scrolls PAST the hero
 *    form — a pill stacked above WhatsApp bottom-right on desktop, a
 *    full-width bottom bar on mobile — and smooth-scrolls back UP to the form.
 */
export function EdpFloatingCtas({
  priceLabel,
  targetId = "register",
}: {
  priceLabel?: string;
  targetId?: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById(targetId);
    if (!hero) return;
    const observer = new IntersectionObserver(
      ([entry]) =>
        // Show only once the hero form has scrolled fully ABOVE the viewport
        // (not when it's still below on first paint).
        setVisible(!entry.isIntersecting && entry.boundingClientRect.bottom < 0),
      { threshold: 0 },
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, [targetId]);

  return (
    <>
      <WhatsAppButton
        className={cn(
          "transition-[bottom] duration-300",
          visible &&
            "max-sm:bottom-[calc(5.25rem+env(safe-area-inset-bottom))]",
        )}
      />

      {/* Desktop: floating pill, stacked above the WhatsApp button. */}
      <div
        aria-hidden={!visible}
        className={cn(
          "fixed bottom-[4.75rem] right-5 z-40 hidden transition-all duration-300 sm:block",
          visible
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-3 opacity-0",
        )}
      >
        <button
          type="button"
          tabIndex={visible ? 0 : -1}
          onClick={() => scrollToRegistrationForm(targetId)}
          className={cn(
            buttonVariants({ variant: "brand", size: "lg" }),
            "rounded-full shadow-float",
          )}
        >
          Enroll Now
          <ArrowUp className="size-4" aria-hidden />
        </button>
      </div>

      {/* Mobile: full-width bottom bar (with safe-area padding). */}
      <div
        aria-hidden={!visible}
        className={cn(
          "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-4 pt-3 backdrop-blur transition-transform duration-300 sm:hidden",
          visible ? "translate-y-0" : "translate-y-full",
        )}
        style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
      >
        <button
          type="button"
          tabIndex={visible ? 0 : -1}
          onClick={() => scrollToRegistrationForm(targetId)}
          className={cn(
            buttonVariants({ variant: "brand", size: "lg" }),
            "w-full rounded-full",
          )}
        >
          Enroll Now{priceLabel ? ` · ${priceLabel}` : ""}
        </button>
      </div>
    </>
  );
}
