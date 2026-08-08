import Navbar from "../components/Navbar";

export const metadata = {
  title: "Community Guidelines | Royal Authority TV",
  description: "The rules that govern comments and discussion on Royal Authority TV.",
};

export default function CommunityGuidelinesPage() {
  return (
    <main className="relative min-h-screen bg-[#05070b] text-white overflow-x-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#05070b] via-[#08111d] to-black" />
      <div className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full bg-red-700/10 blur-[140px]" />
      <div className="absolute right-0 top-40 h-[450px] w-[450px] rounded-full bg-[#C9A24A]/10 blur-[140px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-6 lg:px-10">
        <Navbar breadcrumbs={[{ label: "Home", href: "/" }, { label: "Community Guidelines" }]} />

        <div className="mx-auto max-w-3xl py-10">
          <div className="text-xs uppercase tracking-[0.34em] text-[#E8D19A]">Legal</div>
          <h1 className="mt-3 font-serif text-4xl text-white">Community Guidelines</h1>
          <p className="mt-2 text-sm text-slate-500">Effective July 26, 2026</p>

          <div className="mt-8 space-y-8 text-sm leading-7 text-slate-300">
            <section>
              <h2 className="font-serif text-2xl text-white">Why We&apos;re Here</h2>
              <p className="mt-3">
                Royal Authority TV exists to give real, sourced case coverage a place for readers to dig in,
                compare notes, and ask questions. These guidelines cover comments and discussion across the
                Site. By posting, you agree to follow them, along with our{" "}
                <a href="/terms" className="text-[#E8D19A] hover:underline">Terms of Service</a> and{" "}
                <a href="/privacy" className="text-[#E8D19A] hover:underline">Privacy Policy</a>. You must be
                at least 18 years old to comment.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-white">Choosing a Display Name</h2>
              <p className="mt-3">
                Your display name shows up next to everything you post. It should not include slurs or
                hateful language, threats or harassment directed at anyone, anyone else&apos;s personal
                information, profanity, references to drugs or self-harm, sexual content, or references to
                extremist groups or mass-casualty events. Getting creative with spelling, symbols, or emoji
                to sneak a name like this past review doesn&apos;t make it acceptable.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-white">Real People Are Not a Game</h2>
              <p className="mt-3">
                This is the one that matters most here. Every case on this Site involves real people, real
                victims, real families, real suspects who haven&apos;t been convicted of anything, real
                witnesses who came forward at real risk to themselves. Discussion and theories about the
                available record are welcome. Using this Site to harass, dox, threaten, or organize action
                against any real person connected to a case is not, and will get your account permanently
                removed on sight, no warning issued.
              </p>
              <p className="mt-3">
                This includes posting anyone&apos;s home address, phone number, workplace, school, or other
                identifying information not already a matter of public record; contacting people connected
                to a case through information found here; and stating unproven accusations as settled fact.
                Anyone described as a suspect or defendant has been accused, not convicted, unless a
                conviction is specifically reported.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-white">Hateful Conduct and Harassment</h2>
              <p className="mt-3">
                We don&apos;t allow attacks on people based on race, ethnicity, national origin, immigration
                status, sex, gender, gender identity, sexual orientation, religion, disability, or any other
                protected characteristic. This also covers personal attacks, insults, and pile-ons directed
                at other commenters, not just people connected to a case.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-white">Threats and Violence</h2>
              <p className="mt-3">
                No threats of harm, implied or explicit, against anyone, including other users, people
                connected to a case, or our staff. This covers wishing harm on someone, encouraging others to
                hurt someone, and sharing or threatening to share sexually explicit content of a real
                person. We report credible threats to law enforcement.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-white">Privacy and Sensitive Information</h2>
              <p className="mt-3">
                Do not post anyone&apos;s full home address, phone number, email, financial details, or
                government ID numbers, whether it&apos;s yours or someone else&apos;s. This protects
                everyone, including you.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-white">A Note on Self-Harm and Crisis Safety</h2>
              <p className="mt-3">
                Given the subject matter here, we know some threads touch on suicide, self-harm, and other
                difficult territory. We don&apos;t allow content that instructs, encourages, or glorifies
                self-harm. If you or someone you know is struggling or in crisis, call or text 988, or visit{" "}
                <a
                  href="https://988lifeline.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#E8D19A] hover:underline"
                >
                  988lifeline.org
                </a>
                , any time.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-white">Illegal Activity, Spam, and Impersonation</h2>
              <p className="mt-3">
                Don&apos;t use comments to sell or solicit anything illegal, to spam links or repetitive
                content, to impersonate another person or organization, or to attempt to circumvent
                moderation, including through multiple accounts.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-white">How Moderation Works</h2>
              <p className="mt-3">
                New comments are held for review before they appear publicly. We aim to review comments
                promptly, but this is a real, human process, not an instant one. Approving a comment isn&apos;t
                an endorsement of its content, it means it didn&apos;t violate these guidelines. We may
                remove any comment, at any time, and suspend accounts that repeatedly or seriously violate
                these rules, without further notice.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-white">Reporting a Problem</h2>
              <p className="mt-3">
                If you see something that concerns you, email us at{" "}
                <a href="mailto:submissions@royalauthorityofficial.com" className="text-[#E8D19A] hover:underline">
                  submissions@royalauthorityofficial.com
                </a>{" "}
                with a link or description of the comment. We take these reports seriously.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-white">Changes to These Guidelines</h2>
              <p className="mt-3">
                As the Site and its community grow, we may update these guidelines. Continuing to
                participate after a change means you accept the update.
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
