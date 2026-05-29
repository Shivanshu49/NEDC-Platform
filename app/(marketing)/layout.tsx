import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

/**
 * Shared chrome for all PUBLIC marketing pages (home + program/speakers/etc.).
 * The "(marketing)" folder is a route group: it organizes files but adds NO URL
 * segment, so this layout wraps "/" as well as "/program", "/faq", and so on.
 */
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
