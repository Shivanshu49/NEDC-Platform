"use client";

import { useEffect, useState } from "react";

/**
 * Rotating secondary tagline under the hero headline. Cycles through the brand
 * lines with a gentle fade. Pure presentation respects reduced-motion via the
 * CSS in globals.css (animations are near-instant there). We rotate with JS so
 * the line content (for SEO/AT) is the first one on the server render.
 */
const LINES = [
  "Transform Your Ideas into Startups",
  "Learn • Innovate • Build • Lead",
  "From Skill Development to Startup Development",
];

export function HeroTagline() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % LINES.length), 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <span
      key={i}
      className="inline-block animate-[tagline_3s_ease-in-out] font-semibold text-brand-light"
      // re-trigger the fade each time the line changes
      style={{ animationIterationCount: 1 }}
    >
      {LINES[i]}
    </span>
  );
}
