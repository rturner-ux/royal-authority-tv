// Single channel name shared by the sitewide tracker (mounted in the root
// layout, present on every page) and the homepage's visible counter, so
// they join the same Supabase Realtime Presence room.
export const SITE_PRESENCE_CHANNEL = "site-visitors";
