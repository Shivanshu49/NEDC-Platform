import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Two Google fonts loaded via Next's font system (no extra network requests at
// runtime — they're self-hosted at build time). Exposed to CSS as variables.
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Site-wide <head> metadata. Next merges/overrides this with any `metadata`
// exported from individual pages.
export const metadata: Metadata = {
  title: {
    default: "NEDC — National Entrepreneurship Development Center",
    template: "%s | NEDC",
  },
  description:
    "Live 5–6 day online entrepreneurship programs. Learn from experts, join live Zoom sessions, and rewatch the recordings.",
};

// The root layout wraps every page in the app. Keep it minimal — shared chrome
// like a navbar/footer will be added per route group in later phases.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
