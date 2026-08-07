import { NextRequest, NextResponse } from "next/server";

// Visit this URL once per browser/device to stop that browser's own
// activity from padding the site-wide visit counter and every case's view
// count. Sets a long-lived cookie that both the client tracker and the
// server-side view-count increment check before counting anything.
export async function GET(req: NextRequest) {
  const res = NextResponse.redirect(new URL("/", req.url));
  res.cookies.set("ra_notrack", "1", {
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
  });
  return res;
}
