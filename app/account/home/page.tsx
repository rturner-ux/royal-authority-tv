import { redirect } from "next/navigation";
import { getTrendingCases, getFeaturedCases, getSiteStats, getRandomSpotlightCases } from "@/lib/cases";
import { getSubscriberStatus } from "@/lib/subscription";
import { isTikTokLive } from "@/lib/tiktokLive";
import { getTotalClicks } from "@/lib/clicks";
import HomeClient from "../../components/HomeClient";

// Same content as the public homepage, just rendered inside the account
// section's sidebar layout ("profile mode") instead of navigating away from
// it -- reuses the exact same data fetching and HomeClient component.
export default async function AccountHomePage() {
  const { user, isActive } = await getSubscriberStatus();
  if (!user) redirect("/login?next=/account/home");
  if (!isActive) redirect("/account");

  const [cases, featuredCases, stats, isLive, spotlightCases, totalClicks] = await Promise.all([
    getTrendingCases(),
    getFeaturedCases(),
    getSiteStats(),
    isTikTokLive(),
    getRandomSpotlightCases(6),
    getTotalClicks(),
  ]);

  return (
    <HomeClient
      cases={cases}
      featuredCases={featuredCases}
      stats={stats}
      isLive={isLive}
      spotlightCases={spotlightCases}
      totalClicks={totalClicks}
      accountLabel="My Profile"
      accountHref="/account"
      embedded
    />
  );
}
