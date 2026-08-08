import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Navbar from "../../components/Navbar";
import PersonCard from "../../components/PersonCard";
import CaseReactionBar from "../../components/CaseReactionBar";
import LocationZoomReveal from "../../components/LocationZoomReveal";
import PhotoGallery from "../../components/PhotoGallery";
import CaseLog from "../../components/CaseLog";
import CaseQuiz from "../../components/CaseQuiz";
import CaseConnectionsMap from "../../components/CaseConnectionsMap";
import CaseFactChecker from "../../components/CaseFactChecker";
import CaseVideoLibrary from "../../components/CaseVideoLibrary";
import CasePictureScan from "../../components/CasePictureScan";
import CaseIntroVideo from "../../components/CaseIntroVideo";
import RecordLastCase from "../../components/RecordLastCase";
import CaseEngagementPopup from "../../components/CaseEngagementPopup";
import InvestigatorToolkit from "../../components/InvestigatorToolkit";
import CasePartners from "../../components/CasePartners";
import { getCaseBySlug, getCaseTrackingCount, getCaseConnections, incrementCaseViewCount, getCaseCommentCount } from "@/lib/cases";
import { getCollection } from "@/lib/collections";
import { getSubscriberStatus } from "@/lib/subscription";
import { supabaseServerAuth } from "@/lib/supabase/serverAuth";
import {
  CATEGORY_LABELS,
  PERSON_ROLE_LABELS,
  isActiveAlert,
} from "@/lib/labels";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await getCaseBySlug(slug);
  if (!result) return { title: "Royal Authority TV" };

  const title = `${result.incident.title} | Royal Authority TV`;
  const description = result.incident.description || undefined;
  // The root layout sets a site-wide default openGraph/twitter block for
  // pages with no metadata of their own. Next.js does not deep-merge that
  // across parent/child segments -- a page that only sets top-level
  // title/description (as this used to) silently inherits the parent's
  // entire openGraph and twitter objects, generic image included, instead
  // of this case's own. Setting them explicitly here (and pointing
  // twitter's image at the same per-case opengraph-image route Next
  // already generates for og:image) is what makes a shared case link
  // actually preview as that case rather than the homepage.
  const imageUrl = `/case-file/${slug}/opengraph-image`;
  // og:video lets Facebook render the share as an actual playable video
  // card in the feed (using this embed URL as the player), while the link
  // itself (og:url, set automatically from the page's own canonical URL)
  // still points back to this page, not to YouTube directly.
  const videoEmbedUrl = result.incident.video_embed_url;

  return {
    title,
    description,
    alternates: { canonical: `/case-file/${slug}` },
    openGraph: {
      title,
      description,
      images: [imageUrl],
      ...(videoEmbedUrl && {
        videos: [{ url: videoEmbedUrl, width: 1280, height: 720, type: "text/html" }],
      }),
    },
    twitter: { card: "summary_large_image", title, description, images: [imageUrl] },
  };
}

export default async function CaseFileSlugPage({
  params,
  embedded,
}: {
  params: Promise<{ slug: string }>;
  // Set only when rendered from inside the account-section sidebar layout
  // ("profile mode") -- see app/account/case-file/[slug]/page.tsx. Threaded
  // to Navbar so its full-bleed top bar doesn't overlap the sidebar.
  embedded?: boolean;
}) {
  const { slug } = await params;
  const result = await getCaseBySlug(slug);
  if (!result) notFound();

  const { incident, updates, people, transcript, courtRecords, photos, relatedIncident, courtCase, charges } = result;
  const incidentCollection = incident.collection_slug ? getCollection(incident.collection_slug) : null;

  // Facebook's video plugin embeds (Reels, posts) are portrait and come with
  // their own width/height query params -- those get their own small
  // section below rather than being forced into the landscape card grid.
  // Everything else (YouTube, news station embeds, etc.) is folded into the
  // same Video Library grid as a synthetic first entry so there's one
  // consistent small-card presentation instead of a separate large player.
  const primaryVideoIsFacebook = incident.video_embed_url?.includes("facebook.com/plugins/video") ?? false;
  const libraryVideos =
    incident.video_embed_url && !primaryVideoIsFacebook
      ? [
          {
            id: "primary-embed",
            incident_id: incident.id,
            title: `${incident.title} video`,
            source_label: null,
            youtube_url: incident.video_embed_url,
            thumbnail_url: null,
            sequence: -1,
            view_count: 0,
            like_count: 0,
            share_count: 0,
          },
          ...result.videos,
        ]
      : result.videos;
  const trackingCount = await getCaseTrackingCount(incident.id);
  const commentCount = await getCaseCommentCount(incident.id);
  const connections = await getCaseConnections(incident.id);
  const cookieStore = await cookies();
  if (!cookieStore.get("ra_notrack")) {
    incrementCaseViewCount(incident.id).catch(() => {});
  }
  const { user, isActive } = await getSubscriberStatus();
  const accountProps = user
    ? { accountLabel: "My Profile", accountHref: "/account" }
    : { accountLabel: "Sign In", accountHref: "/login" };

  let subscriberRole: string | null = null;
  if (user && isActive) {
    const authDb = await supabaseServerAuth();
    const { data: profile } = await authDb
      .from("subscriber_profiles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();
    subscriberRole = profile?.role ?? null;
  }
  const hasRole = !!subscriberRole;

  const earlyAccessLocked =
    !!incident.early_access_until &&
    new Date(incident.early_access_until) > new Date() &&
    !isActive;

  if (earlyAccessLocked) {
    return (
      <main className="relative min-h-screen bg-[#05070b] text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-[#05070b] via-[#08111d] to-black" />
        <div className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full bg-red-700/10 blur-[140px]" />
        <div className="absolute right-0 top-40 h-[450px] w-[450px] rounded-full bg-[#C9A24A]/10 blur-[140px]" />

        <div className="relative z-10 mx-auto max-w-7xl px-6 py-6 lg:px-10">
          <Navbar
            breadcrumbs={[
              { label: "Home", href: "/" },
              { label: "Case Files", href: "/case-file" },
              { label: incident.title },
            ]}
            embedded={embedded}
            {...accountProps}
          />

          <div className="mx-auto max-w-2xl py-16 text-center">
            <div className="text-xs uppercase tracking-[0.34em] text-[#E8D19A]">
              {CATEGORY_LABELS[incident.category]}
            </div>
            <h1 className="mt-3 font-serif text-4xl text-white md:text-5xl">
              {incident.title}
            </h1>

            <div className="mx-auto mt-8 max-w-md rounded-[30px] border border-[#C9A24A]/30 bg-[#C9A24A]/10 p-8">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E8D19A]">
                Subscriber Early Access
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                Subscribers can view this case now. It opens to the public on{" "}
                {new Date(incident.early_access_until!).toLocaleDateString("en-US", { dateStyle: "long" })}.
              </p>
              <Link
                href="/subscribe"
                className="mt-6 inline-flex rounded-2xl bg-[#C9A24A] px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90"
              >
                Subscribe for $4.99/mo
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Article structured data -- gives Google Discover and rich results
  // something concrete to key off of; without it the page is just prose to
  // a crawler. Escaping "</" prevents case text that happens to contain it
  // from breaking out of the script tag.
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: incident.title,
    description: incident.description || undefined,
    image: incident.poster_url || incident.image_url || undefined,
    datePublished: incident.published_at,
    dateModified: incident.updated_at || incident.published_at,
    url: `https://royalauthorityofficial.com/case-file/${slug}`,
    publisher: {
      "@type": "Organization",
      name: "Royal Authority TV",
      url: "https://royalauthorityofficial.com",
    },
  };

  return (
    <main className="relative min-h-screen bg-[#05070b] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd).replace(/</g, "\\u003c") }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#05070b] via-[#08111d] to-black" />
      <div className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full bg-red-700/10 blur-[140px]" />
      <div className="absolute right-0 top-40 h-[450px] w-[450px] rounded-full bg-[#C9A24A]/10 blur-[140px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-6 lg:px-10">
        <RecordLastCase slug={slug} title={incident.title} />
        <CaseEngagementPopup slug={slug} isActive={isActive} />
        <Navbar
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Case Files", href: "/case-file" },
            { label: incident.title },
          ]}
          embedded={embedded}
          {...accountProps}
        />

        <div className="mb-8">
          <div className="text-xs uppercase tracking-[0.34em] text-[#E8D19A]">
            Royal Authority TV
          </div>
          <h1 className="mt-3 font-serif text-4xl text-white md:text-5xl">
            {CATEGORY_LABELS[incident.category]}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-300 md:text-base">
            Verified source-based case coverage built for transcript publishing,
            timeline presentation, and documentary-style reporting.
          </p>
        </div>

        {/* HERO */}
        <section className="mb-12 grid items-center gap-8 md:grid-cols-2">
          <div className="relative h-[420px] w-full overflow-hidden rounded-2xl border border-white/10 md:h-[500px]">
            {incident.image_url ? (
              <Image
                src={incident.image_url}
                alt={incident.title}
                fill
                unoptimized
                className="object-cover object-top"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-white/[0.02] text-6xl text-white/10">
                ?
              </div>
            )}
          </div>

          <div className="space-y-6">
            {incident.is_featured && (
              <div className="text-xs uppercase tracking-[0.3em] text-red-400">
                Featured Investigation
              </div>
            )}

            {incidentCollection && (
              <Link
                href={`/collections/${incidentCollection.slug}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#E8D19A] transition hover:text-white"
              >
                Part of: {incidentCollection.name} →
              </Link>
            )}

            <h2 className="font-serif text-4xl font-bold leading-tight md:text-5xl">
              {incident.title}
            </h2>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5">
                  <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                {(incident.view_count ?? 0).toLocaleString()} view{(incident.view_count ?? 0) === 1 ? "" : "s"}
              </div>

              {trackingCount > 0 && (
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {trackingCount} {trackingCount === 1 ? "subscriber is" : "subscribers are"} tracking this case
                </div>
              )}
            </div>

            {incident.description && (
              <p className="text-lg leading-8 text-slate-300">
                {incident.description}
              </p>
            )}

            {incident.tip_line_phone && (
              <a
                href={`tel:${incident.tip_line_phone.replace(/[^0-9+]/g, "")}`}
                className="flex items-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/[0.07] px-5 py-4 transition hover:border-red-500/50 hover:bg-red-500/[0.1]"
              >
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-500/15 text-lg">
                  📞
                </span>
                <span>
                  <span className="block text-xs font-bold uppercase tracking-[0.2em] text-red-400">
                    {incident.tip_line_label || "Tip Line"}
                  </span>
                  <span className="block text-lg font-bold text-white">{incident.tip_line_phone}</span>
                </span>
              </a>
            )}

            <div className="flex flex-wrap gap-3">
              {transcript.length > 0 && (
                <Link
                  href={`/case-file/${slug}/transcript`}
                  className="rounded-2xl bg-[#C9A24A] px-5 py-3 text-sm font-semibold text-black transition hover:scale-[1.02] hover:bg-[#ddbb6a]"
                >
                  Full Transcript
                </Link>
              )}

              <Link
                href={`/case-file/${slug}/member-room`}
                className="rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Member Room
              </Link>

            </div>

            <CaseReactionBar
              incidentId={incident.id}
              discussionHref={`/case-file/${slug}/discussion`}
              commentCount={commentCount}
              initialShareCount={incident.share_count}
              isSignedIn={!!user}
            />
          </div>
        </section>

        {/* AI CASE INTRO VIDEO */}
        {incident.intro_video_url && (
          <CaseIntroVideo url={incident.intro_video_url} title={incident.title} />
        )}

        {/* LIVE / FACEBOOK PLUGIN VIDEO (portrait, rare) */}
        {incident.video_embed_url && primaryVideoIsFacebook && (
          <section className="mb-12 overflow-hidden rounded-[32px] border border-red-500/30 bg-black/30 backdrop-blur-sm">
            <div className="flex items-center gap-2 px-6 pt-6">
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
              <div className="text-xs font-bold uppercase tracking-[0.3em] text-red-400">
                Watch
              </div>
            </div>
            <div className="mt-4 flex justify-center px-6 pb-6">
              <iframe
                src={incident.video_embed_url}
                title={`${incident.title} video`}
                width="350"
                height="622"
                style={{ border: "none", overflow: "hidden", maxWidth: "100%" }}
                scrolling="no"
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </section>
        )}

        {/* VIDEO LIBRARY */}
        {libraryVideos.length > 0 && (
          <section className="mb-12">
            <div className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-[#E8D19A]">
              Video Library
            </div>
            <CaseVideoLibrary videos={libraryVideos} fallbackThumbnail={incident.poster_url || incident.image_url} />
          </section>
        )}

        {/* PREMIUM TOOLS */}
        <section className="mb-4">
          <div className="text-xs font-bold uppercase tracking-[0.3em] text-[#E8D19A]">
            Premium Tools
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Everything below is built directly from this case&apos;s sourced Case Log.
          </p>
        </section>

        {/* AI CASE BRIEF */}
        {incident.ai_summary && (
          <section className="mb-6 rounded-[32px] border border-[#C9A24A]/30 bg-gradient-to-br from-[#C9A24A]/[0.1] to-transparent p-7 backdrop-blur-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="text-xs uppercase tracking-[0.3em] text-[#E8D19A]">
                  AI Case Brief
                </div>
                <span className="rounded-full border border-[#C9A24A]/30 bg-[#C9A24A]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#E8D19A]">
                  Premium
                </span>
              </div>
              {incident.ai_summary_updated_at && (
                <div className="text-xs text-slate-500">
                  Updated{" "}
                  {new Date(incident.ai_summary_updated_at).toLocaleDateString("en-US", {
                    dateStyle: "medium",
                  })}
                </div>
              )}
            </div>

            {isActive ? (
              <>
                <p className="mt-4 max-w-3xl whitespace-pre-line text-sm leading-8 text-slate-200 md:text-base">
                  {incident.ai_summary}
                </p>
                <p className="mt-4 text-xs text-slate-500">
                  Auto-generated from the sourced Case Log below. Full timeline and sources always available underneath.
                </p>
              </>
            ) : (
              <div className="relative mt-4">
                <p className="max-w-3xl select-none whitespace-pre-line text-sm leading-8 text-slate-400 blur-sm">
                  {incident.ai_summary}
                </p>
                <div className="absolute inset-0 flex items-end">
                  <Link
                    href="/subscribe"
                    className="inline-flex rounded-2xl bg-[#C9A24A] px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90"
                  >
                    Subscribe to Read the AI Case Brief
                  </Link>
                </div>
              </div>
            )}
          </section>
        )}

        {/* CONNECTIONS MAP */}
        {isActive ? (
          <div className="mb-6">
            <CaseConnectionsMap nodes={connections.nodes} edges={connections.edges} />
          </div>
        ) : (
          (connections.nodes.length > 0) && (
            <section className="mb-6 rounded-[32px] border border-[#C9A24A]/30 bg-gradient-to-br from-[#C9A24A]/[0.1] to-transparent p-7 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <div className="text-xs uppercase tracking-[0.3em] text-[#E8D19A]">
                  Connections Map
                </div>
                <span className="rounded-full border border-[#C9A24A]/30 bg-[#C9A24A]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#E8D19A]">
                  Premium
                </span>
              </div>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
                See how everyone in this case connects, in an interactive relationship diagram.
              </p>
              <Link
                href="/subscribe"
                className="mt-6 inline-flex rounded-2xl bg-[#C9A24A] px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90"
              >
                Subscribe to Unlock the Connections Map
              </Link>
            </section>
          )
        )}

        {/* QUIZ */}
        <div className="mb-6">
          <CaseQuiz slug={slug} caseTitle={incident.title} isActive={isActive} />
        </div>

        {/* FACT CHECKER */}
        <div className="mb-6">
          <CaseFactChecker slug={slug} isActive={isActive} />
        </div>

        {/* AI PICTURE SCAN */}
        <div className="mb-6">
          <CasePictureScan isActive={isActive} />
        </div>

        {/* INVESTIGATOR TOOLKIT */}
        <div className="mb-6">
          <InvestigatorToolkit slug={slug} isActive={isActive} hasRole={hasRole} initialRole={subscriberRole} />
        </div>

        {/* PARTNER UP */}
        <div className="mb-6">
          <CasePartners slug={slug} isActive={isActive} currentUserId={user?.id ?? null} />
        </div>

        {/* COURT & ARREST RECORDS */}
        {(courtCase || charges.length > 0 || courtRecords.length > 0) && (
          <section className="mb-6 rounded-[32px] border border-[#C9A24A]/30 bg-gradient-to-br from-[#C9A24A]/[0.1] to-transparent p-7 backdrop-blur-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="text-xs uppercase tracking-[0.3em] text-[#E8D19A]">
                  Court &amp; Arrest Records
                </div>
                <span className="rounded-full border border-[#C9A24A]/30 bg-[#C9A24A]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#E8D19A]">
                  Premium
                </span>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {charges.length > 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-slate-300">
                  <span className="font-semibold text-white">{charges.length}</span> charge
                  {charges.length === 1 ? "" : "s"} filed
                </div>
              )}
              {courtRecords.length > 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-slate-300">
                  <span className="font-semibold text-white">{courtRecords.length}</span> docket event
                  {courtRecords.length === 1 ? "" : "s"} on record
                </div>
              )}
            </div>

            <div className="mt-6">
              <Link
                href={`/case-file/${slug}/court-record`}
                className="inline-flex rounded-2xl bg-[#C9A24A] px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90"
              >
                View Full Court Record →
              </Link>
            </div>
          </section>
        )}

        {/* MEMBER ANALYSIS */}
        {incident.member_analysis && (
          <section className="mb-12 rounded-[32px] border border-[#C9A24A]/30 bg-gradient-to-br from-[#C9A24A]/[0.1] to-transparent p-7 backdrop-blur-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="text-xs uppercase tracking-[0.3em] text-[#E8D19A]">
                  Member Analysis
                </div>
                <span className="rounded-full border border-[#C9A24A]/30 bg-[#C9A24A]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#E8D19A]">
                  Premium
                </span>
              </div>
              {incident.member_analysis_updated_at && (
                <div className="text-xs text-slate-500">
                  Updated{" "}
                  {new Date(incident.member_analysis_updated_at).toLocaleDateString("en-US", {
                    dateStyle: "medium",
                  })}
                </div>
              )}
            </div>

            {isActive ? (
              <>
                <p className="mt-4 max-w-3xl whitespace-pre-line text-sm leading-8 text-slate-200 md:text-base">
                  {incident.member_analysis}
                </p>
                <p className="mt-4 text-xs text-slate-500">
                  Editorial commentary on open questions in the case log above, not new reporting.
                </p>
              </>
            ) : (
              <div className="relative mt-4">
                <p className="max-w-3xl select-none whitespace-pre-line text-sm leading-8 text-slate-400 blur-sm">
                  {incident.member_analysis}
                </p>
                <div className="absolute inset-0 flex items-end">
                  <Link
                    href="/subscribe"
                    className="inline-flex rounded-2xl bg-[#C9A24A] px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90"
                  >
                    Subscribe to Read the Member Analysis
                  </Link>
                </div>
              </div>
            )}
          </section>
        )}

        {/* SUMMARY */}
        <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-[30px] border border-white/10 bg-black/30 p-6 backdrop-blur-sm">
            <div className="text-xs uppercase tracking-[0.26em] text-[#E8D19A]">
              Case Summary
            </div>

            <div className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
              {people[0] && (
                <p>
                  <span className="font-semibold text-white">
                    {PERSON_ROLE_LABELS[people[0].role]}:
                  </span>{" "}
                  {people[0].name}
                </p>
              )}
              {incident.location_label && (
                <p>
                  <span className="font-semibold text-white">Location:</span>{" "}
                  {incident.location_label}
                </p>
              )}
              <p>
                <span className="font-semibold text-white">Status:</span>{" "}
                {incident.status === "active"
                  ? "Investigation ongoing"
                  : incident.status === "resolved"
                    ? "Resolved"
                    : "Cleared"}
              </p>
            </div>
          </div>

          <div className="rounded-[30px] border border-white/10 bg-black/30 p-6 backdrop-blur-sm">
            <div className="text-xs uppercase tracking-[0.26em] text-[#E8D19A]">
              Coverage Modules
            </div>

            <div className="mt-5 grid gap-3">
              {transcript.length > 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
                  Official transcript block
                </div>
              )}
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
                Timeline breakdown section
              </div>
              {incident.scene_description && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
                  Scene analysis
                </div>
              )}
            </div>
          </div>
        </section>

        {/* LOCATION MAP */}
        <section className="mt-10 overflow-hidden rounded-[32px] border border-white/10 bg-black/30 p-6 backdrop-blur-sm">
          <LocationZoomReveal
            lat={incident.lat}
            lng={incident.lng}
            label={incident.location_label}
            preciseLat={incident.precise_lat}
            preciseLng={incident.precise_lng}
            preciseLabel={incident.precise_location_label}
            isActive={isActive}
            thenPhotoUrl={incident.precise_then_photo_url}
            thenCaption={incident.precise_then_caption}
            thenSourceUrl={incident.precise_then_source_url}
            annotation={incident.precise_annotation}
            sceneVideoUrl={incident.scene_video_url}
          />
        </section>

        {/* SCENE TEASER */}
        {incident.scene_description && (
          <section className="mt-10 rounded-[32px] border border-white/10 bg-black/30 p-6 backdrop-blur-sm">
            <div className="text-xs uppercase tracking-[0.26em] text-[#E8D19A]">
              Scene Analysis
            </div>

            <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-300">
              {incident.scene_description}
            </p>

            <div className="mt-6">
              <Link
                href={`/case-file/${slug}/scene`}
                className="inline-flex rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                View Scene Analysis →
              </Link>
            </div>
          </section>
        )}

        {/* LOCATION HISTORY */}
        {incident.location_history && (
          <section className="mt-10 rounded-[32px] border border-white/10 bg-black/30 p-6 backdrop-blur-sm">
            <div className="text-xs uppercase tracking-[0.26em] text-[#E8D19A]">
              Location History
            </div>

            <p className="mt-4 max-w-3xl whitespace-pre-line text-sm leading-8 text-slate-300">
              {incident.location_history}
            </p>
          </section>
        )}

        {/* RELATED INVESTIGATION */}
        {relatedIncident?.slug && (
          <section className="mt-10">
            <Link
              href={`/case-file/${relatedIncident.slug}`}
              className="group flex items-center gap-5 rounded-[32px] border border-[#C9A24A]/20 bg-gradient-to-r from-[#C9A24A]/[0.06] to-transparent p-6 transition hover:border-[#C9A24A]/40"
            >
              <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/40">
                {relatedIncident.image_url ? (
                  <Image src={relatedIncident.image_url} alt={relatedIncident.title} fill unoptimized className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-2xl text-white/20">?</div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs uppercase tracking-[0.26em] text-[#E8D19A]">Related Investigation</div>
                <h3 className="mt-1 truncate font-serif text-xl text-white">{relatedIncident.title}</h3>
              </div>
              <span className="flex-shrink-0 text-[#E8D19A] transition group-hover:translate-x-1">→</span>
            </Link>
          </section>
        )}

        {/* PEOPLE */}
        {people.length > 0 && (
          <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {people.map((person) => (
              <PersonCard key={person.id} person={person} isMissingAlert={isActiveAlert(incident)} />
            ))}
          </section>
        )}

        {/* FUNERAL */}
        {photos.filter((p) => p.category !== "evidence").length > 0 && (
          <PhotoGallery
            photos={photos.filter((p) => p.category !== "evidence")}
            title="Funeral"
            altFallback={incident.title}
          />
        )}

        {/* FAMILY-SHARED EVIDENCE */}
        {photos.filter((p) => p.category === "evidence").length > 0 && (
          <PhotoGallery
            photos={photos.filter((p) => p.category === "evidence")}
            title="Family-Shared Evidence"
            altFallback={incident.title}
          />
        )}

        {/* TIMELINE + TRANSCRIPT PREVIEW */}
        <section className="mt-10 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <CaseLog updates={updates} isActive={isActive} />

          {transcript.length > 0 && (
            <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-7 backdrop-blur-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.3em] text-[#E8D19A]">
                    Transcript Preview
                  </div>
                  <h3 className="mt-2 font-serif text-2xl text-white">
                    Official source material
                  </h3>
                </div>

                <Link
                  href={`/case-file/${slug}/transcript`}
                  className="rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Open Full Transcript
                </Link>
              </div>

              <div className="mt-6 space-y-4 text-sm leading-8 text-slate-300">
                {transcript.slice(0, 5).map((row) => (
                  <p key={row.id}>&ldquo;{row.translated_text || row.original_text}&rdquo;</p>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
