// Matches the short-count style used across social platforms: plain
// integer under 10,000, one decimal place with a K/M suffix above that.
export function formatCompactCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 10_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}
