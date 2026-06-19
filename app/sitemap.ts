import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** Public, indexable routes. (The dashboard/login/api are intentionally omitted.) */
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/about", "/program", "/speakers", "/team", "/gallery", "/faq", "/contact"];
  const now = new Date();
  return routes.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: path === "" || path === "/program" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path === "/program" ? 0.9 : 0.6,
  }));
}
