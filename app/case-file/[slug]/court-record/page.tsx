import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "../../../components/Navbar";
import CourtRecordNav from "../../../components/CourtRecordNav";
import DocumentLink from "../../../components/DocumentLink";
import { getCaseBySlug } from "@/lib/cases";
import { getSubscriberStatus } from "@/lib/subscription";
import { COURT_RECORD_LABELS, COURT_RECORD_CLASSES } from "@/lib/labels";

function formatDate(value: string | null): string | null {
  if (!value) return null;
  return new Date(value + "T12:00:00").toLocaleDateString("en-US", { dateStyle: "medium" });
}

export default async function CourtRecordPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getCaseBySlug(slug);
  if (!result) notFound();

  const { incident, people, courtCase, charges, bondSettings, courtRecords, financialRecords } = result;
  const { isActive } = await getSubscriberStatus();

  const hasAnyCourtData =
    !!courtCase || charges.length > 0 || bondSettings.length > 0 || courtRecords.length > 0;
  if (!hasAnyCourtData) notFound();

  if (!isActive) {
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
              { label: incident.title, href: `/case-file/${slug}` },
              { label: "Court Record" },
            ]}
          />

          <div className="mx-auto max-w-2xl py-16 text-center">
            <div className="text-xs uppercase tracking-[0.34em] text-[#E8D19A]">Court Record</div>
            <h1 className="mt-3 font-serif text-4xl text-white md:text-5xl">{incident.title}</h1>

            <div className="mx-auto mt-8 max-w-md rounded-[30px] border border-[#C9A24A]/30 bg-[#C9A24A]/10 p-8">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E8D19A]">
                Subscriber Only
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                The full Court Record, case information, charges, bond settings, hearings, and
                documents, is available to subscribers.
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

  const defendants = people.filter((p) => p.role === "suspect");
  const documents = courtRecords.filter((r) => !!r.document_url);
  const seenDocUrls = new Set<string>();
  const uniqueDocuments = documents.filter((r) => {
    if (seenDocUrls.has(r.document_url!)) return false;
    seenDocUrls.add(r.document_url!);
    return true;
  });

  const available = [
    courtCase && "case-information",
    defendants.length > 0 && "party",
    charges.length > 0 && "charge",
    bondSettings.length > 0 && "bond-settings",
    courtRecords.length > 0 && "events-and-hearings",
    "financial",
    uniqueDocuments.length > 0 && "documents",
  ].filter(Boolean) as string[];

  return (
    <main id="top" className="relative min-h-screen bg-[#05070b] text-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#05070b] via-[#08111d] to-black" />
      <div className="absolute top-0 right-0 h-[400px] w-[400px] rounded-full bg-[#C9A24A]/10 blur-[140px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-6 lg:px-10">
        <Navbar
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Case Files", href: "/case-file" },
            { label: incident.title, href: `/case-file/${slug}` },
            { label: "Court Record" },
          ]}
        />

        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-xs uppercase tracking-[0.34em] text-[#E8D19A]">Court Record</div>
            <span className="rounded-full border border-[#C9A24A]/30 bg-[#C9A24A]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#E8D19A]">
              Premium
            </span>
          </div>
          <h1 className="mt-3 font-serif text-4xl text-white md:text-5xl">{incident.title}</h1>
          <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-300 md:text-base">
            Case information, party details, charges, bond settings, docket events and hearings,
            financial history, and documents, sourced from the official court record.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_240px]">
          <div className="space-y-8">
            {courtCase && (
              <section
                id="case-information"
                className="scroll-mt-24 rounded-[32px] border border-white/10 bg-black/30 p-7 backdrop-blur-sm"
              >
                <div className="text-xs uppercase tracking-[0.3em] text-[#E8D19A]">
                  Case Information
                </div>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {courtCase.case_number && (
                    <div>
                      <div className="text-xs uppercase tracking-[0.15em] text-slate-500">Case Number</div>
                      <div className="mt-1 text-sm font-semibold text-white">{courtCase.case_number}</div>
                    </div>
                  )}
                  {courtCase.court_name && (
                    <div>
                      <div className="text-xs uppercase tracking-[0.15em] text-slate-500">Court</div>
                      <div className="mt-1 text-sm font-semibold text-white">
                        {courtCase.court_name}
                        {courtCase.division ? `, ${courtCase.division}` : ""}
                      </div>
                    </div>
                  )}
                  {courtCase.judicial_officer && (
                    <div>
                      <div className="text-xs uppercase tracking-[0.15em] text-slate-500">Judicial Officer</div>
                      <div className="mt-1 text-sm font-semibold text-white">{courtCase.judicial_officer}</div>
                    </div>
                  )}
                  {courtCase.file_date && (
                    <div>
                      <div className="text-xs uppercase tracking-[0.15em] text-slate-500">File Date</div>
                      <div className="mt-1 text-sm font-semibold text-white">{formatDate(courtCase.file_date)}</div>
                    </div>
                  )}
                  {courtCase.case_type && (
                    <div>
                      <div className="text-xs uppercase tracking-[0.15em] text-slate-500">Case Type</div>
                      <div className="mt-1 text-sm font-semibold text-white">{courtCase.case_type}</div>
                    </div>
                  )}
                  {courtCase.case_status && (
                    <div>
                      <div className="text-xs uppercase tracking-[0.15em] text-slate-500">Case Status</div>
                      <div className="mt-1 text-sm font-semibold text-white">{courtCase.case_status}</div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {defendants.length > 0 && (
              <section
                id="party"
                className="scroll-mt-24 rounded-[32px] border border-white/10 bg-black/30 p-7 backdrop-blur-sm"
              >
                <div className="text-xs uppercase tracking-[0.3em] text-[#E8D19A]">Party</div>
                <div className="mt-5 space-y-5">
                  {defendants.map((d) => (
                    <div key={d.id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                      <div className="text-xs uppercase tracking-[0.15em] text-red-300">Defendant</div>
                      <div className="mt-1 text-lg font-semibold text-white">{d.name}</div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {d.dob && (
                          <div className="text-sm text-slate-300">
                            <span className="font-semibold text-white">DOB:</span> {formatDate(d.dob)}
                          </div>
                        )}
                        {d.race && (
                          <div className="text-sm text-slate-300">
                            <span className="font-semibold text-white">Race:</span> {d.race}
                          </div>
                        )}
                        {d.home_address && (
                          <div className="text-sm text-slate-300 sm:col-span-2">
                            <span className="font-semibold text-white">Address:</span> {d.home_address}
                          </div>
                        )}
                        {d.attorney_name && (
                          <div className="text-sm text-slate-300 sm:col-span-2">
                            <span className="font-semibold text-white">Attorney:</span> {d.attorney_name}
                            {d.attorney_status ? ` (${d.attorney_status})` : ""}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {charges.length > 0 && (
              <section
                id="charge"
                className="scroll-mt-24 rounded-[32px] border border-white/10 bg-black/30 p-7 backdrop-blur-sm"
              >
                <div className="text-xs uppercase tracking-[0.3em] text-[#E8D19A]">Charge</div>
                <div className="mt-5 overflow-x-auto">
                  <table className="w-full min-w-[500px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-xs uppercase tracking-[0.15em] text-slate-500">
                        <th className="py-2 pr-4">Description</th>
                        <th className="py-2 pr-4">Statute</th>
                        <th className="py-2 pr-4">Level</th>
                        <th className="py-2">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {charges.map((c) => (
                        <tr key={c.id} className="border-b border-white/5">
                          <td className="py-3 pr-4 font-semibold text-white">{c.description}</td>
                          <td className="py-3 pr-4 text-slate-300">{c.statute || "N/A"}</td>
                          <td className="py-3 pr-4 text-slate-300">{c.level || "N/A"}</td>
                          <td className="py-3 text-slate-300">{formatDate(c.charge_date) || "N/A"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {bondSettings.length > 0 && (
              <section
                id="bond-settings"
                className="scroll-mt-24 rounded-[32px] border border-white/10 bg-black/30 p-7 backdrop-blur-sm"
              >
                <div className="text-xs uppercase tracking-[0.3em] text-[#E8D19A]">Bond Settings</div>
                <div className="mt-5 space-y-3">
                  {bondSettings.map((b) => (
                    <div
                      key={b.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3"
                    >
                      <span className="text-sm font-semibold text-white">{formatDate(b.setting_date)}</span>
                      {b.amount && <span className="text-sm text-slate-300">{b.amount}</span>}
                      {b.notes && <span className="text-xs text-slate-500">{b.notes}</span>}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {courtRecords.length > 0 && (
              <section
                id="events-and-hearings"
                className="scroll-mt-24 rounded-[32px] border border-white/10 bg-black/30 p-7 backdrop-blur-sm"
              >
                <div className="text-xs uppercase tracking-[0.3em] text-[#E8D19A]">
                  Events and Hearings
                </div>
                <div className="mt-5 space-y-5">
                  {courtRecords.map((r) => (
                    <div key={r.id} className="border-l border-[#C9A24A]/30 pl-4">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${COURT_RECORD_CLASSES[r.record_type]}`}
                        >
                          {COURT_RECORD_LABELS[r.record_type]}
                        </span>
                        {r.event_date && (
                          <span className="text-xs text-slate-500">{formatDate(r.event_date)}</span>
                        )}
                      </div>
                      <div className="text-sm font-semibold text-white">{r.title}</div>
                      {r.description && (
                        <div className="mt-1 text-sm leading-7 text-slate-400">{r.description}</div>
                      )}
                      {(r.judicial_officer || r.hearing_time || r.result) && (
                        <div className="mt-2 grid gap-1 text-xs text-slate-400 sm:grid-cols-3">
                          {r.judicial_officer && (
                            <div>
                              <span className="text-slate-500">Judicial Officer:</span> {r.judicial_officer}
                            </div>
                          )}
                          {r.hearing_time && (
                            <div>
                              <span className="text-slate-500">Hearing Time:</span> {r.hearing_time}
                            </div>
                          )}
                          {r.result && (
                            <div>
                              <span className="text-slate-500">Result:</span> {r.result}
                            </div>
                          )}
                        </div>
                      )}
                      <div className="mt-2 flex flex-wrap gap-3">
                        {r.document_url && <DocumentLink url={r.document_url} />}
                        {r.source_url && (
                          <a
                            href={r.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block text-xs text-[#67e8f9]"
                          >
                            Source
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section
              id="financial"
              className="scroll-mt-24 rounded-[32px] border border-white/10 bg-black/30 p-7 backdrop-blur-sm"
            >
              <div className="text-xs uppercase tracking-[0.3em] text-[#E8D19A]">Financial</div>
              {financialRecords.length === 0 ? (
                <p className="mt-4 text-sm text-slate-400">No financial information exists for this case.</p>
              ) : (
                <div className="mt-5 space-y-3">
                  {financialRecords.map((f) => (
                    <div
                      key={f.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3"
                    >
                      <span className="text-sm text-slate-300">{f.description}</span>
                      <div className="flex items-center gap-3">
                        {f.amount && <span className="text-sm font-semibold text-white">{f.amount}</span>}
                        {f.event_date && (
                          <span className="text-xs text-slate-500">{formatDate(f.event_date)}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {uniqueDocuments.length > 0 && (
              <section
                id="documents"
                className="scroll-mt-24 rounded-[32px] border border-white/10 bg-black/30 p-7 backdrop-blur-sm"
              >
                <div className="text-xs uppercase tracking-[0.3em] text-[#E8D19A]">Documents</div>
                <div className="mt-5 space-y-2">
                  {uniqueDocuments.map((r) => (
                    <DocumentLink
                      key={r.id}
                      url={r.document_url!}
                      className="flex w-full items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 text-left text-sm text-white transition hover:border-[#C9A24A]/40"
                      label={
                        <>
                          <span>{r.title}</span>
                          <span className="text-xs text-[#67e8f9]">View Document</span>
                        </>
                      }
                    />
                  ))}
                </div>
              </section>
            )}
          </div>

          <CourtRecordNav available={available} />
        </div>
      </div>
    </main>
  );
}
