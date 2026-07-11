import type { MetadataRoute } from "next";
import { site, pages } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return pages.map((p) => ({
    url: p.slug === "/" ? site.url : `${site.url}${p.slug}`,
    lastModified: now,
    changeFrequency: p.changefreq ?? "monthly",
    priority: p.priority ?? 0.5,
  }));
}
