import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import {
  getFeaturedProgram,
  pickNextCohort,
  registrationState,
  REGISTRATION_BADGE,
} from "@/lib/queries";

// Plus Jakarta Sans — confident, modern sans for display headings.
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

// Inter — clean, legible body + UI font.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Monospace — used for the occasional code/figure.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// Sitewide metadata. Built in generateMetadata (not a static export) so the
// registration line in search snippets and link previews is derived from the
// same registrationState() the home and /edp badges use — the copy flips
// between "opening soon" / "open now" / "closed" with the DB, not by redeploy.
// Pages that export their own description/openGraph (e.g. /edp) override this.
export async function generateMetadata(): Promise<Metadata> {
  const featured = await getFeaturedProgram();
  const nextCohort = featured ? pickNextCohort(featured.cohorts) : null;
  const regLine = REGISTRATION_BADGE[registrationState(nextCohort)];

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default:
        "NEDC, National Entrepreneurship Development Center | Become a Job Creator",
      template: "%s | NEDC",
    },
    description: `NEDC runs the Entrepreneurship Development Program (EDP), online & hybrid training that turns students, youth, professionals, women, and rural innovators into startup founders and job creators. ${regLine}.`,
    keywords: [
      "NEDC",
      "Entrepreneurship Development Program",
      "EDP",
      "startup training India",
      "become a job creator",
      "MSME",
      "Startup India",
      "youth entrepreneurship",
    ],
    openGraph: {
      type: "website",
      siteName: "NEDC, National Entrepreneurship Development Center",
      title: "NEDC: Transforming Youth into Entrepreneurs",
      description: `Join the Entrepreneurship Development Program (EDP). Learn • Innovate • Build • Lead. ${regLine}.`,
      url: SITE_URL,
    },
    twitter: {
      card: "summary_large_image",
      title: "NEDC: Transforming Youth into Entrepreneurs",
      description:
        "Join the Entrepreneurship Development Program (EDP). Learn • Innovate • Build • Lead.",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning: only <body> attributes can differ here (browser
    // extensions, dev font-class re-hashing) — both benign, both one level deep.
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${jakarta.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
