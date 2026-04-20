import Image from "next/image";
import Link from "next/link";
import Navbar from "../../components/Navbar";

const timelineItems = [
  {
    time: "April 4, 2026",
    text: "Ashlee and Joseph arrive at Zuri Hotel for their stay.",
  },
  {
    time: "April 8, Evening",
    text: "A romantic dispute is reported by a neighboring guest in Room 24.",
  },
  {
    time: "Hotel Response",
    text: "Management separates the pair and moves Joseph to Room 65.",
  },
  {
    time: "Later That Night",
    text: "Ashlee asks hotel staff for a phone charger.",
  },
  {
    time: "Approx. 20 Minutes Later",
    text: "Staff returns, finds the door locked, the lights off, and uses an emergency key.",
  },
  {
    time: "Discovery",
    text: "Ashlee is found hanging inside the wardrobe and is still alive when discovered.",
  },
  {
    time: "April 9, 2026",
    text: "She dies while receiving treatment. Investigation remains active.",
  },
];

export default function AshleeCasePage() {
  return (
    <main className="relative min-h-screen bg-[#05070b] text-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#05070b] via-[#08111d] to-black" />
      <div className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full bg-red-700/10 blur-[140px]" />
      <div className="absolute right-0 top-40 h-[450px] w-[450px] rounded-full bg-[#C9A24A]/10 blur-[140px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-6 lg:px-10">
        <Navbar
          rightButtonLabel="Open Transcript"
          rightButtonHref="/transcript/ashlee"
        />

        <div className="mb-8">
          <div className="text-xs uppercase tracking-[0.34em] text-[#E8D19A]">
            Royal Authority TV
          </div>
          <h1 className="mt-3 font-serif text-4xl text-white md:text-5xl">
            Case File 01
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-300 md:text-base">
            Verified source-based case coverage built for transcript publishing,
            timeline presentation, and documentary-style reporting.
          </p>
        </div>

        {/* HERO */}
        <section className="mb-12 grid items-center gap-8 md:grid-cols-2">
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 rounded-2xl bg-red-500/10 blur-3xl" />
            <Image
              src="/ashlee-case-v5.png"
              alt="Ashlee Robinson and Joseph McCann"
              width={600}
              height={700}
              className="relative object-contain"
              priority
            />
          </div>

          <div className="space-y-6">
            <div className="text-xs uppercase tracking-[0.3em] text-red-400">
              Featured Investigation
            </div>

            <h2 className="font-serif text-4xl font-bold leading-tight md:text-5xl">
              Ashlee Robinson Case
            </h2>

            <p className="text-lg leading-8 text-slate-300">
              A 31-year-old American woman found inside a luxury resort villa in
              Zanzibar. The official police statement describes a hanging inside a
              wardrobe, while the full circumstances remain under investigation.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/transcript/ashlee"
                className="rounded-2xl bg-[#C9A24A] px-5 py-3 text-sm font-semibold text-black transition hover:scale-[1.02] hover:bg-[#ddbb6a]"
              >
                Full Transcript
              </Link>

              <Link
                href="/case-file/ashlee/member-room"
                className="rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Member Room
              </Link>
              
             <Link
              href="/case-file/ashlee/discussion"
              className="rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Open Discussion
            </Link>

              <button className="rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                Watch Breakdown
              </button>
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
              <p>
                <span className="font-semibold text-white">Victim:</span> Ashlee
                Robinson
              </p>
              <p>
                <span className="font-semibold text-white">Location:</span> Zuri Hotel,
                Nungwi, Zanzibar
              </p>
              <p>
                <span className="font-semibold text-white">Companion:</span> Joseph
                Isaac McCann
              </p>
              <p>
                <span className="font-semibold text-white">Status:</span> Investigation
                ongoing
              </p>
            </div>
          </div>

          <div className="rounded-[30px] border border-white/10 bg-black/30 p-6 backdrop-blur-sm">
            <div className="text-xs uppercase tracking-[0.26em] text-[#E8D19A]">
              Coverage Modules
            </div>

            <div className="mt-5 grid gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
                Official transcript block
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
                Timeline breakdown section
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
                Episode and live analysis
              </div>
            </div>
          </div>
        </section>

        {/* ZURI HOTEL SECTION */}
        <section className="mt-10 rounded-[32px] border border-white/10 bg-black/30 p-6 backdrop-blur-sm">
          <div className="text-xs uppercase tracking-[0.26em] text-[#E8D19A]">
            Scene Analysis
          </div>

          <h3 className="mt-3 font-serif text-2xl text-white md:text-3xl">
            The Zuri Hotel Where the Incident Took Place
          </h3>

          <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-300">
            The incident took place at Zuri Zanzibar, a large resort made up of
            separated villas connected by walking paths. The resort layout plays
            a critical role in understanding movement, visibility, and the reported
            distance between Villa 25 and Villa 65.
          </p>

          <div className="mt-6">
            <Link
              href="/case-file/ashlee/scene"
              className="inline-flex rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              View Scene Analysis →
            </Link>
          </div>
        </section>

        {/* PERSON OF INTEREST */}
        <section className="mt-10 rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-7 backdrop-blur-sm">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.3em] text-red-400">
                Investigative Focus
              </div>
              <h3 className="mt-2 font-serif text-2xl text-white md:text-3xl">
                Person of Interest
              </h3>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-yellow-300">
                Under Questioning
              </div>
              <div className="rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-red-200">
                Active Investigation
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="rounded-[28px] border border-white/10 bg-black/30 p-5">
              <div className="text-xs uppercase tracking-[0.26em] text-[#E8D19A]">
                Profile Image
              </div>

              <div className="relative mt-5 flex min-h-[340px] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="absolute inset-0 rounded-2xl bg-white/5 blur-2xl" />
                <div className="relative flex h-[300px] w-full items-center justify-center">
                  <Image
                    src="/joseph-mccann-v3.png"
                    alt="Joseph Isaac McCann"
                    width={320}
                    height={420}
                    className="object-contain"
                  />
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
                  <span className="font-semibold text-white">Name:</span> Joseph Isaac
                  McCann
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
                  <span className="font-semibold text-white">Age:</span> 48
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
                  <span className="font-semibold text-white">Nationality:</span> United
                  States
                </div>
              </div>
            </div>

            <div className="grid gap-6">
              <div className="rounded-[28px] border border-white/10 bg-black/30 p-6">
                <div className="text-xs uppercase tracking-[0.26em] text-[#E8D19A]">
                  Investigative Relevance
                </div>

                <div className="mt-5 space-y-4 text-sm leading-8 text-slate-300">
                  <p>
                    Joseph Isaac McCann was identified in the police statement as the
                    partner who arrived with Ashlee Robinson and stayed with her at the
                    Zuri Hotel.
                  </p>

                  <p>
                    According to the official timeline, hotel management intervened after
                    reported disputes and relocated him from Villa 25 to Villa 65 before
                    the incident.
                  </p>

                  <p>
                    Authorities stated that he remains under questioning as the
                    investigation continues into the circumstances surrounding Ashlee’s
                    death.
                  </p>
                </div>
              </div>

              <div className="rounded-[28px] border border-white/10 bg-black/30 p-6">
                <div className="text-xs uppercase tracking-[0.26em] text-[#E8D19A]">
                  Status Indicators
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-yellow-300">
                      Current Status
                    </div>
                    <div className="mt-2 text-sm font-semibold text-white">
                      Under Questioning
                    </div>
                  </div>

                  <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-red-200">
                      Case Position
                    </div>
                    <div className="mt-2 text-sm font-semibold text-white">
                      Investigative Focus
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-[#E8D19A]">
                      Arrival
                    </div>
                    <div className="mt-2 text-sm text-slate-300">
                      Arrived at Zuri Hotel with Ashlee on April 4, 2026.
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-[#E8D19A]">
                      Hotel Action
                    </div>
                    <div className="mt-2 text-sm text-slate-300">
                      Moved to Villa 65 after reported disputes.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TIMELINE + TRANSCRIPT PREVIEW */}
        <section className="mt-10 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-7 backdrop-blur-sm">
            <div className="text-xs uppercase tracking-[0.3em] text-[#E8D19A]">
              Timeline
            </div>

            <div className="mt-6 space-y-5">
              {timelineItems.map((item) => (
                <div key={item.time} className="border-l border-[#C9A24A]/30 pl-4">
                  <div className="text-sm font-semibold text-white">{item.time}</div>
                  <div className="mt-1 text-sm leading-7 text-slate-400">
                    {item.text}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-7 backdrop-blur-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.3em] text-[#E8D19A]">
                  Transcript Preview
                </div>
                <h3 className="mt-2 font-serif text-2xl text-white">
                  Official translated source material
                </h3>
              </div>

              <Link
                href="/transcript/ashlee"
                className="rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Open Full Transcript
              </Link>
            </div>

            <div className="mt-6 space-y-4 text-sm leading-8 text-slate-300">
              <p>
                “On April 8, at around 2:55 at night, at Zuri Hotel located in
                Nungwi District in the Northern Region of Unguja...”
              </p>
              <p>
                “A woman known as Ashlee Robinson, aged 31, a citizen of the United
                States...”
              </p>
              <p>
                “Hotel management, after receiving that information, went to see them
                and ask if there were any challenges...”
              </p>
              <p>
                “When he looked, he saw that female guest, Ashlee, hanging inside the
                wardrobe...”
              </p>
              <p>
                “The police force, in cooperation with Lumumba Hospital and other
                scientific departments, continues with the investigation...”
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}