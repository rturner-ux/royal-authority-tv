import { getTrendingCases, getSiteStats } from "@/lib/cases";
import HomeClient from "./components/HomeClient";

export default async function Home() {
  const [cases, stats] = await Promise.all([getTrendingCases(), getSiteStats()]);

  return <HomeClient cases={cases} stats={stats} />;
}
