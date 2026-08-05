import Navbar from "../components/Navbar";
import PictureScanClient from "../components/PictureScanClient";

export const metadata = {
  title: "AI Picture Scan | Royal Authority TV",
  description: "Upload a photo you saw circulating online to identify which case or person on Royal Authority TV it relates to.",
};

export default function PictureScanPage({ embedded }: { embedded?: boolean } = {}) {
  return (
    <main className="relative min-h-screen bg-[#05070b] text-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#05070b] via-[#08111d] to-black" />
      <div className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full bg-red-700/10 blur-[140px]" />
      <div className="absolute right-0 top-40 h-[450px] w-[450px] rounded-full bg-[#C9A24A]/10 blur-[140px]" />

      <div className="relative z-10 mx-auto max-w-3xl px-6 py-6 lg:px-10">
        <Navbar breadcrumbs={[{ label: "Home", href: "/" }, { label: "AI Picture Scan" }]} embedded={embedded} />

        <div className="mb-8 mt-4">
          <div className="text-xs uppercase tracking-[0.34em] text-[#E8D19A]">Royal Authority TV</div>
          <h1 className="mt-3 font-serif text-4xl text-white md:text-5xl">AI Picture Scan</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
            Seen a photo circulating online and want to know which case it&apos;s from? Upload it below.
            We read any visible text, names, or captions in the image and check them against our case
            database. This tool identifies text it can read in a photo, it does not verify a photo&apos;s
            authenticity or confirm who is pictured from their face alone.
          </p>
        </div>

        <PictureScanClient />
      </div>
    </main>
  );
}
