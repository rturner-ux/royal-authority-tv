import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Navbar from "../../components/Navbar";
import PersonProfileTabs from "../../components/PersonProfileTabs";
import ShareButton from "../../components/ShareButton";
import { getCaseBySlug } from "@/lib/cases";
import { getSubscriberStatus } from "@/lib/subscription";
import { CATEGORY_LABELS, CLAIM_TYPE_LABELS, CLAIM_TYPE_CLASSES, PERSON_ROLE_LABELS, PERSON_ROLE_CLASSES } from "@/lib/labels";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await getCaseBySlug(slug);
  if (!result) return { title: "Royal Authority TV" };
  return {
    title: `${result.incident.title} — Royal Authority TV`,
    description: result.incident.description || undefined,
  };
}

export default async function CaseFileSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getCaseBySlug(slug);
  if (!result) notFound();

  const { incident, updates, people, transcript, relatedIncident } = result;
  const { user, isActive } = await getSubscriberStatus();
  const accountProps = user
    ? { accountLabel: "My Account", accountHref: "/account" }
    : { accountLabel: "Sign In", accountHref: "/login" };

  const earlyAccessLocked =
    !!incident.early_access_until &&
    new Date(incident.early_access_until) > new Date() &&
    !isActive;

  if (earlyAccessLocked) {
    return (
      <main className="relative min-h-screen bg-[#05070b] text-white overflow-hidden">
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
                Subscribe — $4.99/mo
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-[#05070b] text-white overflow-hidden">
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
                className="object-cover"
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

            <h2 className="font-serif text-4xl font-bold leading-tight md:text-5xl">
              {incident.title}
            </h2>

            {incident.description && (
              <p className="text-lg leading-8 text-slate-300">
                {incident.description}
              </p>
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

              <Link
                href={`/case-file/${slug}/discussion`}
                className="rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Open Discussion
              </Link>

              <ShareButton />
            </div>
          </div>
        </section>

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
          <section className="mt-10 space-y-6">
            {people.map((person) => (
              <div
                key={person.id}
                className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-7 backdrop-blur-sm"
              >
                <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="text-xs uppercase tracking-[0.3em] text-red-400">
                      Investigative Focus
                    </div>
                    <h3 className="mt-2 font-serif text-2xl text-white md:text-3xl">
                      {PERSON_ROLE_LABELS[person.role]}
                    </h3>
                  </div>

                  {person.status && (
                    <div
                      className={`max-w-full whitespace-normal break-words rounded-2xl border px-4 py-2 text-left text-xs font-semibold uppercase tracking-[0.15em] md:max-w-[380px] ${PERSON_ROLE_CLASSES[person.role]}`}
                    >
                      {person.status}
                    </div>
                  )}
                </div>

                <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
                  <div className="rounded-[28px] border border-white/10 bg-black/30 p-5">
                    <div className="text-xs uppercase tracking-[0.26em] text-[#E8D19A]">
                      Profile
                    </div>

                    {person.photo_url ? (
                      <div
                        className={`relative mt-5 w-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] ${
                          person.photo_fit === "contain" ? "aspect-square p-8" : "aspect-[4/5]"
                        }`}
                      >
                        <Image
                          src={person.photo_url}
                          alt={person.name}
                          fill
                          unoptimized
                          className={person.photo_fit === "contain" ? "object-contain" : "object-cover"}
                        />
                      </div>
                    ) : (
                      <div className="mt-5 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] py-10">
                        <div className="grid h-14 w-14 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-lg font-bold text-white/40">
                          {person.name.charAt(0)}
                        </div>
                        <span className="text-xs uppercase tracking-[0.15em] text-white/30">
                          No Public Photo Available
                        </span>
                      </div>
                    )}

                    <div className="mt-5 grid gap-3">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
                        <span className="font-semibold text-white">Name:</span>{" "}
                        {person.name}
                      </div>
                      {person.age && (
                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
                          <span className="font-semibold text-white">Age:</span>{" "}
                          {person.age}
                        </div>
                      )}
                    </div>
                  </div>

                  <PersonProfileTabs person={person} />
                </div>
              </div>
            ))}
          </section>
        )}

        {/* TIMELINE + TRANSCRIPT PREVIEW */}
        <section className="mt-10 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-7 backdrop-blur-sm">
            <div className="text-xs uppercase tracking-[0.3em] text-[#E8D19A]">
              Case Log
            </div>

            <div className="mt-6 space-y-5">
              {updates.map((u) => {
                const contradicted = u.contradicts_update_id
                  ? updates.find((x) => x.id === u.contradicts_update_id)
                  : null;
                const locked = u.is_premium && !isActive;
                return (
                  <div
                    key={u.id}
                    className={`pl-4 ${contradicted ? "border-l-2 border-amber-500/50" : "border-l border-[#C9A24A]/30"}`}
                  >
                    {contradicted && (
                      <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-300">
                        ⚠ Statement Corrected
                      </div>
                    )}
                    <div className="mb-1 flex items-center gap-2">
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${CLAIM_TYPE_CLASSES[u.claim_type]}`}
                      >
                        {CLAIM_TYPE_LABELS[u.claim_type]}
                      </span>
                      <span className="text-xs text-slate-500">
                        {u.event_date
                          ? new Date(u.event_date + "T12:00:00").toLocaleDateString("en-US", { dateStyle: "medium" })
                          : new Date(u.created_at).toLocaleDateString("en-US", { dateStyle: "medium" })}
                      </span>
                      {u.is_premium && (
                        <span className="rounded-full border border-[#C9A24A]/30 bg-[#C9A24A]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#E8D19A]">
                          Premium
                        </span>
                      )}
                    </div>

                    {locked ? (
                      <div className="relative">
                        <div className="select-none text-sm leading-7 text-slate-400 blur-sm">
                          {u.body}
                        </div>
                        <Link
                          href="/subscribe"
                          className="mt-2 inline-block text-xs font-semibold text-[#E8D19A] hover:underline"
                        >
                          Subscribe to read this update →
                        </Link>
                      </div>
                    ) : (
                      <>
                        <div className="text-sm leading-7 text-slate-400">
                          {u.body}
                        </div>
                        {contradicted && (
                          <div className="mt-2 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs leading-6 text-amber-200/80">
                            <span className="font-semibold text-amber-300">Originally stated:</span> {contradicted.body}
                            {u.correction_note && <div className="mt-1.5 text-amber-200/70">{u.correction_note}</div>}
                          </div>
                        )}
                        {u.source_url && (
                          <a
                            href={u.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 inline-block text-xs text-[#67e8f9]"
                          >
                            Source
                          </a>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
              {updates.length === 0 && (
                <p className="text-sm text-slate-500">No case facts logged yet.</p>
              )}
            </div>
          </div>

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
