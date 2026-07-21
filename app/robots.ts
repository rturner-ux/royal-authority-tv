import type { MetadataRoute } from "next";

// Search engines still need to crawl this site -- "free to browse, no
// paywall" is the whole point, and blocking Googlebot/Bingbot outright would
// kill the traffic that makes the mission work. What we actually disallow
// here are the bulk AI-training and wholesale-content scrapers, plus the
// API routes (no reason any crawler needs those). Note: this is an honor
// -system file -- it only stops crawlers that choose to respect it.
const BLOCKED_SCRAPERS = [
  "GPTBot",
  "ChatGPT-User",
  "CCBot",
  "ClaudeBot",
  "anthropic-ai",
  "Google-Extended",
  "Bytespider",
  "PerplexityBot",
  "Omgilibot",
  "Diffbot",
  "SemrushBot",
  "AhrefsBot",
  "MJ12bot",
  "DotBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: "/api/" },
      ...BLOCKED_SCRAPERS.map((userAgent) => ({ userAgent, disallow: "/" })),
    ],
  };
}
