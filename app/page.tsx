import { getTrendingCases, getFeaturedCases, getSiteStats, getRandomSpotlightCases } from "@/lib/cases";
import { getSubscriberStatus } from "@/lib/subscription";
import { isTikTokLive } from "@/lib/tiktokLive";
import HomeClient from "./components/HomeClient";

export default async function Home() {
  const [cases, featuredCases, stats, { user }, isLive, spotlightCases] = await Promise.all([
    getTrendingCases(),
    getFeaturedCases(),
    getSiteStats(),
    getSubscriberStatus(),
    isTikTokLive(),
    getRandomSpotlightCases(6),
  ]);

  const accountProps = user
    ? { accountLabel: "My Account", accountHref: "/account" }
    : { accountLabel: "Sign In", accountHref: "/login" };

  return (
    <HomeClient
      cases={cases}
      featuredCases={featuredCases}
      stats={stats}
      isLive={isLive}
      spotlightCases={spotlightCases}
      {...accountProps}
    />
  );
}
