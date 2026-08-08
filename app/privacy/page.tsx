import Navbar from "../components/Navbar";

export const metadata = {
  title: "Privacy Policy | Royal Authority TV",
  description: "How Royal Authority TV collects, uses, and protects your information.",
};

export default function PrivacyPage() {
  return (
    <main className="relative min-h-screen bg-[#05070b] text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-[#05070b] via-[#08111d] to-black" />
      <div className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full bg-red-700/10 blur-[140px]" />
      <div className="absolute right-0 top-40 h-[450px] w-[450px] rounded-full bg-[#C9A24A]/10 blur-[140px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-6 lg:px-10">
        <Navbar breadcrumbs={[{ label: "Home", href: "/" }, { label: "Privacy Policy" }]} />

        <div className="mx-auto max-w-3xl py-10">
          <div className="text-xs uppercase tracking-[0.34em] text-[#E8D19A]">Legal</div>
          <h1 className="mt-3 font-serif text-4xl text-white">Privacy Policy</h1>
          <p className="mt-2 text-sm text-slate-500">Effective July 25, 2026</p>

          <div className="mt-8 space-y-8 text-sm leading-7 text-slate-300">
            <section>
              <h2 className="font-serif text-2xl text-white">1. Who We Are</h2>
              <p className="mt-3">
                Royal Authority TV (&quot;Royal Authority TV,&quot; &quot;we,&quot; &quot;us,&quot; or
                &quot;our&quot;) operates royalauthorityofficial.com (the &quot;Site&quot;), a
                subscription true-crime and investigative case tracking service. This Privacy Policy
                explains what information we collect from visitors and subscribers, how we use it, and
                the choices you have.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-white">2. Information We Collect</h2>
              <p className="mt-3">
                <span className="font-semibold text-white">Account information.</span> When you create
                an account, we collect your email address and a password, stored and authenticated
                through our identity provider, Supabase. We do not see or store your plaintext password.
              </p>
              <p className="mt-3">
                <span className="font-semibold text-white">Payment information.</span> Subscription
                payments are processed by Square. Royal Authority TV does not receive or store your full
                card number; Square handles that directly and provides us only with a payment status and
                a token needed to manage your subscription.
              </p>
              <p className="mt-3">
                <span className="font-semibold text-white">Content you create.</span> If you subscribe,
                anything you create on the Site is stored under your account: Investigation Board pins,
                strings, and notes; Playlists; case requests submitted through the Member Room; and any
                comments you post under a display name. Investigation Board content is private to your
                account and is never shown to other users. Comments you post under a display name are
                reviewed before becoming publicly visible.
              </p>
              <p className="mt-3">
                <span className="font-semibold text-white">Usage information.</span> Like most websites,
                our hosting and security providers automatically log basic technical information, such as
                IP address, browser type, and pages visited, for security and reliability purposes.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-white">3. How We Use Your Information</h2>
              <p className="mt-3">We use the information above to:</p>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>Create and maintain your account and authenticate your sign-ins</li>
                <li>Process and manage your subscription, including billing and cancellation</li>
                <li>Provide subscriber features such as the Investigation Board, Playlists, and the Member Room</li>
                <li>Respond to case requests, correction requests, and other messages you send us</li>
                <li>Maintain the security and integrity of the Site</li>
              </ul>
              <p className="mt-3">
                We do not sell your personal information, and we do not run third-party advertising
                trackers on the Site.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-white">4. Third-Party Service Providers</h2>
              <p className="mt-3">
                We rely on the following third parties to operate the Site, each of which processes
                certain information on our behalf under their own privacy policies:
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>
                  <span className="font-semibold text-white">Supabase</span>, for account authentication
                  and database storage
                </li>
                <li>
                  <span className="font-semibold text-white">Square</span>, for subscription payment
                  processing
                </li>
                <li>
                  <span className="font-semibold text-white">Google reCAPTCHA</span>, to help prevent
                  automated abuse of our forms
                </li>
                <li>
                  <span className="font-semibold text-white">Vercel</span>, for site hosting
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-white">5. Cookies</h2>
              <p className="mt-3">
                We use a cookie to keep you signed in between visits. We do not use cookies for
                third-party advertising or cross-site tracking.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-white">6. Data Retention and Deletion</h2>
              <p className="mt-3">
                We retain your account information for as long as your account is active. You may
                request deletion of your account and associated data at any time by contacting us at{" "}
                <a href="mailto:submissions@royalauthorityofficial.com" className="text-[#E8D19A] hover:underline">
                  submissions@royalauthorityofficial.com
                </a>
                . We may retain limited billing records where required by law, such as for tax or
                accounting purposes.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-white">7. Children&apos;s Privacy</h2>
              <p className="mt-3">
                The Site is not directed to, and is not intended for use by, children under 13, and we do
                not knowingly collect personal information from children under 13. This is separate from
                the Site&apos;s editorial content, which may report on cases involving minors as
                subjects of news coverage. If you believe a child has provided us with personal
                information, contact us and we will delete it.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-white">8. Your Rights</h2>
              <p className="mt-3">
                You may request access to, correction of, or deletion of your personal information at any
                time by contacting us. You may also update your Investigator Profile, cancel your
                subscription, or delete individual Playlists and Investigation Board items directly from
                your account.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-white">9. Changes to This Policy</h2>
              <p className="mt-3">
                We may update this Privacy Policy from time to time. Material changes will be reflected
                by updating the effective date above.
              </p>
            </section>

            <section>
              <h2 className="font-serif text-2xl text-white">10. Contact Us</h2>
              <p className="mt-3">
                Questions about this Privacy Policy can be sent to{" "}
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
