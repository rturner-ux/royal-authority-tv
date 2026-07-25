import Navbar from "../components/Navbar";

export const metadata = {
  title: "Terms of Service | Royal Authority TV",
  description: "The terms that govern your use of Royal Authority TV.",
};

export default function TermsPage() {
  return (
    <main className="relative min-h-screen bg-[#05070b] text-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#05070b] via-[#08111d] to-black" />
      <div className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full bg-red-700/10 blur-[140px]" />
      <div className="absolute right-0 top-40 h-[450px] w-[450px] rounded-full bg-[#C9A24A]/10 blur-[140px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-6 lg:px-10">
        <Navbar breadcrumbs={[{ label: "Home", href: "/" }, { label: "Terms of Service" }]} />

        <div className="mx-auto max-w-3xl py-10">
          <div className="text-xs uppercase tracking-[0.34em] text-[#E8D19A]">Legal</div>
          <h1 className="mt-3 font-serif text-4xl text-white">Terms of Service</h1>
          <p className="mt-2 text-sm text-slate-500">Effective July 25, 2026</p>

          <div className="mt-8 space-y-8 text-sm leading-7 text-slate-300">
            <section>
              <h2 className="font-serif text-2xl text-white">1. Acceptance of Terms</h2>
              <p className="mt-3">
                These Terms of Service (&quot;Terms&quot;) govern your use of royalauthorityofficial.com
                (the &quot;Site&quot;), operated by Royal Authority TV (&quot;we,&quot; &quot;us,&quot; or
                &quot;our&quot;). By accessing or using the Site, or by subscribing to our paid
                membership, you agree to these Terms. If you do not agree, do not use the Site.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-white">2. What Royal Authority TV Is</h2>
              <p className="mt-3">
                Royal Authority TV publishes investigative case coverage of true-crime, missing-persons,
                and related matters, sourced from public reporting, official statements, court records,
                and other publicly available material. Every reported claim on the Site is labeled by
                claim type, confirmed fact, official statement, family claim, disputed allegation, or
                unconfirmed report, so readers can judge how solid the underlying source is.
              </p>
              <p className="mt-3">
                <span className="font-semibold text-white">Presumption of innocence.</span> Any person
                described as a suspect, defendant, or person of interest in connection with a crime has
                only been accused, not convicted, unless a conviction is specifically reported. Content
                on the Site is not a legal or factual determination of guilt.
              </p>
              <p className="mt-3">
                <span className="font-semibold text-white">Corrections.</span> If you believe something
                reported on the Site about you or anyone else is inaccurate, contact us at{" "}
                <a href="mailto:submissions@royalauthorityofficial.com" className="text-[#E8D19A] hover:underline">
                  submissions@royalauthorityofficial.com
                </a>{" "}
                with the case, the claim, and supporting information. We will review the request and
                correct or clarify the record where warranted.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-white">3. Accounts</h2>
              <p className="mt-3">
                You must provide accurate information when creating an account and are responsible for
                keeping your login credentials secure. You are responsible for all activity that occurs
                under your account.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-white">4. Subscriptions and Billing</h2>
              <p className="mt-3">
                A paid subscription costs $4.99 per month, billed through Square, and automatically
                renews each month until canceled. You may cancel at any time from your account page;
                cancellation takes effect at the end of the current billing period, and you will retain
                subscriber access until then. Except where required by law, payments already made are
                non-refundable, including for partial billing periods.
              </p>
              <p className="mt-3">We may change subscription pricing going forward with notice on the Site.</p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-white">5. Acceptable Use</h2>
              <p className="mt-3">You agree not to use the Site to:</p>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>Harass, threaten, dox, or target any real person named on the Site, including suspects, victims, witnesses, or family members</li>
                <li>Post content that is defamatory, knowingly false, or intended to incite harassment</li>
                <li>Scrape, mass-download, or republish Site content without our permission</li>
                <li>Attempt to circumvent subscription paywalls or access controls</li>
                <li>Use automated tools to access the Site outside of normal, individual browsing</li>
              </ul>
              <p className="mt-3">
                The Investigation Board and Playlists are private tools for your own personal use in
                organizing and analyzing publicly reported information. They are not a platform for
                publishing accusations, and using them to harass or target a real person is a violation of
                these Terms.
              </p>
              <p className="mt-3">
                We may suspend or terminate your account, without refund, for violating this section.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-white">6. User-Submitted Content</h2>
              <p className="mt-3">
                Comments, case requests, and other content you submit remain yours, but by submitting
                them you grant Royal Authority TV a license to display, store, and moderate that content
                on the Site. Submitted comments are reviewed before appearing publicly and may be removed
                or rejected at our discretion.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-white">7. Intellectual Property</h2>
              <p className="mt-3">
                The Site&apos;s case files, articles, images, and design are owned by Royal Authority TV
                or licensed from their respective sources, and may not be copied, scraped, or republished
                without our written permission.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-white">8. Disclaimer of Warranties</h2>
              <p className="mt-3">
                The Site is provided &quot;as is&quot; without warranties of any kind. We do not guarantee
                the Site will be uninterrupted, error-free, or that any particular case content will
                remain available indefinitely, since ongoing investigations and legal proceedings can
                change.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-white">9. Limitation of Liability</h2>
              <p className="mt-3">
                To the maximum extent permitted by law, Royal Authority TV will not be liable for any
                indirect, incidental, or consequential damages arising from your use of the Site.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-white">10. Governing Law</h2>
              <p className="mt-3">
                These Terms are governed by the laws of the State of Texas, without regard to its
                conflict-of-law principles.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-white">11. Changes to These Terms</h2>
              <p className="mt-3">
                We may update these Terms from time to time. Continuing to use the Site after a change
                takes effect constitutes acceptance of the revised Terms.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-white">12. Contact Us</h2>
              <p className="mt-3">
                Questions about these Terms can be sent to{" "}
                <a href="mailto:submissions@royalauthorityofficial.com" className="text-[#E8D19A] hover:underline">
                  submissions@royalauthorityofficial.com
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
