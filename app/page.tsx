import { getTrendingCases, getFeaturedCases, getSiteStats, getRandomSpotlightCase } from "@/lib/cases";
import { getSubscriberStatus } from "@/lib/subscription";
import { isTikTokLive } from "@/lib/tiktokLive";
import HomeClient from "./components/HomeClient";

export default async function Home() {
  const [cases, featuredCases, stats, { user }, isLive, spotlightCase] = await Promise.all([
    getTrendingCases(),
    getFeaturedCases(),
    getSiteStats(),
    getSubscriberStatus(),
    isTikTokLive(),
    getRandomSpotlightCase(),
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
      spotlightCase={spotlightCase}
      {...accountProps}
    />
  );
}
