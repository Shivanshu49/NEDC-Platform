import { WhatsappIcon } from "@/components/BrandIcons";
import { CONTACT } from "@/lib/content";
import { cn } from "@/lib/utils";

/**
 * Floating WhatsApp chat button, shown on every public page. Opens a wa.me chat
 * to the NEDC support number (set in lib/content → CONTACT.whatsapp).
 * `className` lets a page reposition it (e.g. /edp lifts it above its sticky
 * enroll bar); default placement is unchanged.
 */
export function WhatsAppButton({ className }: { className?: string }) {
  const href = `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(
    "Hi NEDC, I'd like to know more about the EDP program.",
  )}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with NEDC on WhatsApp"
      className={cn(
        "fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2",
        className,
      )}
    >
      <WhatsappIcon className="size-5" />
      <span className="hidden sm:inline">Chat with us</span>
    </a>
  );
}
