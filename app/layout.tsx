import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";

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

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      "NEDC — National Entrepreneurship Development Center | Become a Job Creator",
    template: "%s | NEDC",
  },
  description:
    "NEDC runs the Entrepreneurship Development Program (EDP) — online & hybrid training that turns students, youth, professionals, women, and rural innovators into startup founders and job creators. Registrations opening soon.",
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
    siteName: "NEDC — National Entrepreneurship Development Center",
    title: "NEDC — Transforming Youth into Entrepreneurs",
    description:
      "Join the Entrepreneurship Development Program (EDP). Learn • Innovate • Build • Lead. Registrations opening soon.",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "NEDC — Transforming Youth into Entrepreneurs",
    description:
      "Join the Entrepreneurship Development Program (EDP). Learn • Innovate • Build • Lead.",
  },
};

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
