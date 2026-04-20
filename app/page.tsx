import Image from "next/image";
import Link from "next/link";
import CaseRow from "./components/CaseRow";
import Navbar from "./components/Navbar";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-[#020617] text-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#020617] via-[#020617] to-black" />
      <div className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full bg-red-600/10 blur-[140px]" />
      <div className="absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[140px]" />

      <div className="relative z-10">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <Navbar rightButtonLabel="Latest Case" rightButtonHref="/case-file" />
        </div>

        <div className="flex flex-col items-center px-6">
          <section className="grid w-full max-w-6xl items-center gap-12 py-24 md:grid-cols-2">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl bg-white/5 blur-2xl" />
                <Image
                  src="/robby.png"
                  alt="Royal Authority Host"
                  width={420}
                  height={520}
                  className="relative rounded-2xl border border-white/10 object-cover shadow-2xl"
                  priority
                />
              </div>
            </div>

            <div className="space-y-6 text-center md:text-left">
              <h1 className="text-5xl font-bold leading-tight tracking-tight md:text-6xl">
                ROYAL AUTHORITY
                <span className="block text-red-500">TV</span>
              </h1>

              <p className="max-w-lg text-lg text-gray-300">
                Breaking narratives. Exposing truth. Delivering real commentary
                on the stories shaping culture right now.
              </p>

              <div className="flex justify-center gap-4 md:justify-start">
                <Link
                  href="/case-file"
                  className="rounded-xl bg-red-600 px-6 py-3 font-semibold transition shadow-lg shadow-red-600/30 hover:bg-red-700"
                >
                  View Case Files
                </Link>

                <Link
                  href="/transcript"
                  className="rounded-xl border border-white/20 px-6 py-3 font-semibold transition hover:bg-white hover:text-black"
                >
                  Read Transcript
                </Link>
              </div>
            </div>
          </section>

          <div className="mb-12 text-xs tracking-[0.3em] text-gray-500">
            ROYAL AUTHORITY INVESTIGATIVE DESK
          </div>

          <section className="mt-6 w-full max-w-6xl space-y-6 pb-20">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold tracking-wide">
                Featured Cases
              </h2>

              <Link
                href="/case-file"
                className="text-sm text-red-400 transition hover:text-red-500"
              >
                View All →
              </Link>
            </div>

            <CaseRow />
          </section>
        </div>
      </div>
    </main>
  );
}