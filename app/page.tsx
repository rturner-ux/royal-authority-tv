import { getTrendingCases, getSiteStats } from "@/lib/cases";
import { getSubscriberStatus } from "@/lib/subscription";
import { isTikTokLive } from "@/lib/tiktokLive";
import HomeClient from "./components/HomeClient";

export default async function Home() {
  const [cases, stats, { user }, isLive] = await Promise.all([
    getTrendingCases(),
    getSiteStats(),
    getSubscriberStatus(),
    isTikTokLive(),
  ]);

  const accountProps = user
    ? { accountLabel: "My Account", accountHref: "/account" }
    : { accountLabel: "Sign In", accountHref: "/login" };

  return <HomeClient cases={cases} stats={stats} isLive={isLive} {...accountProps} />;
}
