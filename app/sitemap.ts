import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase/server";
import { COLLECTIONS } from "@/lib/collections";

const SITE_URL = "https://royalauthorityofficial.com";

// Most case pages have no inbound link from the homepage's trending/featured
// rows once they scroll off, so search engines have no way to discover them
// without this. Excludes anything without a slug (raw ingestion-only
// incidents never get a dedicated page) and anything hidden.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const db = supabase();
  const { data: incidents } = await db
    .from("incidents")
    .select("slug, updated_at")
    .eq("is_hidden", false)
    .not("slug", "is", null);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "hourly", priority: 1 },
    { url: `${SITE_URL}/case-file`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${SITE_URL}/map`, changeFrequency: "daily", priority: 0.6 },
    { url: `${SITE_URL}/transcript`, changeFrequency: "daily", priority: 0.5 },
    { url: `${SITE_URL}/subscribe`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/search`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/history`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const collectionRoutes: MetadataRoute.Sitemap = Object.keys(COLLECTIONS).map((slug) => ({
    url: `${SITE_URL}/collections/${slug}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const caseRoutes: MetadataRoute.Sitemap = (incidents ?? []).map((incident) => ({
    url: `${SITE_URL}/case-file/${incident.slug}`,
    lastModified: incident.updated_at ? new Date(incident.updated_at) : undefined,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...collectionRoutes, ...caseRoutes];
}
