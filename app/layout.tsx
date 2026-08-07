import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import ScrapeDeterrent from "./components/ScrapeDeterrent";
import SubscribePrompt from "./components/SubscribePrompt";
import Footer from "./components/Footer";
import PresenceProvider from "./components/PresenceProvider";
import SiteClickTracker from "./components/SiteClickTracker";
import MusicPlayer from "./components/MusicPlayer";
import { MusicPlayerProvider } from "./components/MusicPlayerContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const SITE_URL = "https://royalauthorityofficial.com";
const DEFAULT_TITLE = "Royal Authority TV | Verified Investigative Case Coverage";
const DEFAULT_DESCRIPTION =
  "Documentary-grade case coverage with verified sourcing, claim-type labeling, multi-language transcripts, and a real-time case map.";

// Case pages set their own richer metadata (including a dynamic
// opengraph-image per case) via generateMetadata; this is the fallback for
// every other page (homepage, map, collections, etc.) so a link shared
// anywhere still gets a real title, description, and preview image instead
// of a blank card.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
  openGraph: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    siteName: "Royal Authority TV",
    images: ["/hero-wallpaper.webp"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: ["/hero-wallpaper.webp"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <PresenceProvider>
          <MusicPlayerProvider>
            <SiteClickTracker />
            <ScrapeDeterrent />
            <div className="flex-1">{children}</div>
            <Footer />
            <SubscribePrompt />
            <MusicPlayer />
          </MusicPlayerProvider>
        </PresenceProvider>
      </body>
    </html>
  );
}
