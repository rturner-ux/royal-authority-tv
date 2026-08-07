import Link from "next/link";
import Navbar from "../components/Navbar";

export const metadata = {
  title: "A History That Keeps Returning | Royal Authority TV",
  description:
    "The documented history of racial terror lynching in the United States, and the modern pattern of disputed hanging-death rulings that investigators and families have publicly connected to it.",
};

export default function HistoryPage() {
  return (
    <main className="relative min-h-screen bg-[#05070b] text-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#05070b] via-[#08111d] to-black" />
      <div className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full bg-red-700/10 blur-[140px]" />
      <div className="absolute right-0 top-40 h-[450px] w-[450px] rounded-full bg-[#C9A24A]/10 blur-[140px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-6 lg:px-10">
        <Navbar breadcrumbs={[{ label: "Home", href: "/" }, { label: "History" }]} />

        <div className="mx-auto max-w-3xl py-10">
          <div className="text-xs uppercase tracking-[0.34em] text-[#E8D19A]">Context</div>
          <h1 className="mt-3 font-serif text-4xl text-white md:text-5xl">
            A History That Keeps Returning
          </h1>
          <p className="mt-5 text-sm leading-8 text-slate-300 md:text-base">
            Several cases on this Site involve Black people found hanging, officially ruled a
            suicide, with a family or an independent investigator publicly disputing that
            finding. Those disputes don&apos;t happen in a vacuum. Below is the documented
            historical record they sit against, and the reporting that has already examined how
            closely the two connect.
          </p>

          <div className="mt-10 space-y-10 text-sm leading-7 text-slate-300 md:text-base">
            <section>
              <h2 className="font-serif text-2xl text-white">1877&ndash;1950: The Documented Record</h2>
              <p className="mt-4">
                The Equal Justice Initiative spent years building the most complete record ever
                assembled of racial terror lynching in the United States. Their research,
                published as{" "}
                <a
                  href="https://eji.org/reports/lynching-in-america/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#E8D19A] hover:underline"
                >
                  Lynching in America: Confronting the Legacy of Racial Terror
                </a>
                , documented more than 4,400 racial terror lynchings of Black people between the
                end of Reconstruction and 1950. Mississippi recorded more than any other state:
                581.
              </p>
              <p className="mt-4">
                In 2018, EJI opened the{" "}
                <a
                  href="https://legacysites.eji.org/about/memorial/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#E8D19A] hover:underline"
                >
                  National Memorial for Peace and Justice
                </a>{" "}
                in Montgomery, Alabama, the nation&apos;s first memorial to lynching victims. Its
                center holds more than 800 corten steel monuments, one for every U.S. county where
                a documented lynching took place, each engraved with the names of the people
                killed there.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-white">A Pattern That Didn&apos;t End</h2>
              <p className="mt-4">
                Civil rights attorney Jill Collen Jefferson has spent years investigating a
                distinct, modern pattern: Black people found hanging in Mississippi, officially
                ruled suicides, almost without exception. In reporting published by{" "}
                <a
                  href="https://www.washingtonpost.com/nation/2021/08/08/modern-day-mississippi-lynchings/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#E8D19A] hover:underline"
                >
                  the Washington Post
                </a>{" "}
                in August 2021, Jefferson documented eight such deaths in Mississippi between June
                2000 and May 2019, ranging in age from 17 to 55, including{" "}
                <Link href="/case-file/otis-byrd" className="text-[#E8D19A] hover:underline">
                  Otis Byrd
                </Link>
                , found hanging from a tree in Port Gibson in March 2015, and Willie Andrew Jones
                Jr., found hanging from a pecan tree in Scott County in February 2018. Every death
                was ruled a suicide. Every family disputed it.
              </p>
              <blockquote className="mt-4 border-l-2 border-[#C9A24A]/40 pl-4 text-slate-400 italic">
                &ldquo;There is a pattern to how these cases are investigated,&rdquo; Jefferson
                told the Post. &ldquo;When authorities arrive on the scene of a hanging, it&apos;s
                treated as a suicide almost immediately. The crime scene is not preserved. The
                investigation is shoddy. And then there is a formal ruling of suicide, despite
                evidence to the contrary.&rdquo;
              </blockquote>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-white">How We Handle These Cases</h2>
              <p className="mt-4">
                Cases fitting this description are grouped in our{" "}
                <Link
                  href="/collections/hanging-death-investigations"
                  className="text-[#E8D19A] hover:underline"
                >
                  Hanging Death Investigations
                </Link>{" "}
                collection. Where a family, an attorney, or an independent forensic pathologist
                has gone on the record disputing an official ruling, that dispute is tagged and
                labeled as their account, not presented as a settled fact. Our{" "}
                <Link href="/pattern-intelligence" className="text-[#E8D19A] hover:underline">
                  Pattern Intelligence
                </Link>{" "}
                tool separately surfaces cases that share real similarity in timing, distance, and
                circumstance.
              </p>
              <div className="mt-6 rounded-[24px] border border-amber-500/30 bg-amber-500/[0.06] p-5 text-sm leading-7 text-amber-100/90">
                <span className="font-bold uppercase tracking-wide text-amber-300">
                  Important:
                </span>{" "}
                This page does not claim that any specific case covered on this Site is a
                lynching, a homicide, or connected to any other case. The historical rate of
                documented racial terror lynching in Mississippi and the modern pattern of quick
                suicide rulings that named investigators and families have publicly disputed are
                both real and independently reported, as sourced above. Nothing on this page is
                intended to identify, accuse, or name any individual as responsible for any crime.
              </div>
            </section>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/collections/hanging-death-investigations"
              className="rounded-2xl bg-[#C9A24A] px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90"
            >
              View the Collection
            </Link>
            <Link
              href="/pattern-intelligence"
              className="rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
            >
              Open Pattern Intelligence
            </Link>
          </div>

          <div className="mt-14 border-t border-white/10 pt-6">
            <div className="text-xs uppercase tracking-[0.25em] text-slate-500">Sources</div>
            <ul className="mt-3 space-y-1.5 text-xs text-slate-500">
              <li>
                <a
                  href="https://eji.org/reports/lynching-in-america/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-slate-300 hover:underline"
                >
                  Equal Justice Initiative, &ldquo;Lynching in America: Confronting the Legacy of
                  Racial Terror&rdquo;
                </a>
              </li>
              <li>
                <a
                  href="https://legacysites.eji.org/about/memorial/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-slate-300 hover:underline"
                >
                  Equal Justice Initiative, National Memorial for Peace and Justice
                </a>
              </li>
              <li>
                <a
                  href="https://www.theguardian.com/us-news/2018/apr/26/lynchings-memorial-us-south-montgomery-alabama"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-slate-300 hover:underline"
                >
                  The Guardian, on the opening of the National Memorial for Peace and Justice
                </a>
              </li>
              <li>
                <a
                  href="https://www.washingtonpost.com/nation/2021/08/08/modern-day-mississippi-lynchings/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-slate-300 hover:underline"
                >
                  The Washington Post, &ldquo;Lynchings in Mississippi never stopped&rdquo;
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
