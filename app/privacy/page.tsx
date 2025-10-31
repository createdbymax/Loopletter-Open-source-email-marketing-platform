import { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = {
    title: "Privacy Policy - Loopletter",
    description: "Learn how Loopletter protects your privacy and handles your data.",
};
export default function PrivacyPage() {
    return (<div className="min-h-screen bg-white text-gray-900">
      
      <header className="bg-gray-50 border-b">
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Last updated: January 16, 2025
          </p>
        </div>
      </header>

      
      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="space-y-16">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p>
              This Privacy Policy applies to Loopletter, a service provided by Lost Hills LLC ("Company," "we," "us," or "our"). We respect your privacy and are committed to protecting your personal information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>

            <h3 className="text-xl font-medium mt-6 mb-2">2.1 Information You Provide</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Account Information:</strong> Name, email address, password, and artist profile details.</li>
              <li><strong>Billing Information:</strong> Address and payment details (processed via third-party providers).</li>
              <li><strong>Email Content:</strong> Newsletters, campaigns, and subscriber data you create or upload.</li>
              <li><strong>Support Messages:</strong> Feedback, bug reports, and inquiries you submit.</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-2">2.2 Information Collected Automatically</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Device Info:</strong> IP address, browser type, operating system, and device identifiers.</li>
              <li><strong>Usage Data:</strong> Interactions with the app, pages visited, and session duration.</li>
              <li><strong>Cookies:</strong> Used to remember your preferences and enhance functionality.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Legal Bases for Processing</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Consent</li>
              <li>Contractual necessity</li>
              <li>Legal obligations</li>
              <li>Legitimate interests</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Operate, maintain, and improve Loopletter</li>
              <li>Send transactional or service-related communications</li>
              <li>Facilitate payments and billing</li>
              <li>Provide customer support</li>
              <li>Analyze usage patterns and improve features</li>
              <li>Comply with applicable laws</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Campaign & Subscriber Analytics</h2>
            <p className="mb-2">
              When sending emails through Loopletter, we collect:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Delivery, open, click, unsubscribe, and bounce metrics</li>
              <li>Subscriber engagement for analytics purposes</li>
            </ul>
            <p className="mt-2">
              This helps improve your email campaigns and provides audience insights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Data Sharing and Disclosure</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Vendors:</strong> Payment processors, hosting providers, and analytics tools.</li>
              <li><strong>Compliance:</strong> Legal requests or enforcement needs.</li>
              <li><strong>Business Transfers:</strong> In mergers, acquisitions, or asset sales.</li>
              <li><strong>With Consent:</strong> Only with your explicit permission.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. International Data Transfers</h2>
            <p>
              Your data may be stored or processed outside your country. We implement appropriate safeguards for such transfers (e.g., Standard Contractual Clauses).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Data Security</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>HTTPS and encryption of data in transit and at rest</li>
              <li>Strict access controls</li>
              <li>Regular audits and security reviews</li>
              <li>Employee training on best practices</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Your Rights</h2>
            <p className="mb-2">Depending on your location, you may have the right to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Access and correct your data</li>
              <li>Delete your account and personal information</li>
              <li>Opt out of marketing emails</li>
              <li>Export your data</li>
              <li>Submit complaints to a data authority</li>
            </ul>
            <p className="mt-2">
              Contact us at <a href="mailto:privacy@loopletter.co" className="text-blue-600 underline">privacy@loopletter.co</a> to exercise your rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Retention Policy</h2>
            <p>
              We keep your data only as long as necessary to operate the service and comply with legal obligations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Children's Privacy</h2>
            <p>
              We do not knowingly collect information from anyone under 13 years old. If we learn we have, we will delete it.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. California Privacy Rights (CCPA)</h2>
            <p>
              California residents can request to view, delete, or opt out of the sale of their personal data. We do not sell user data. Requests can be sent to <a href="mailto:privacy@loopletter.co" className="text-blue-600 underline">privacy@loopletter.co</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">13. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy periodically. Material changes will be communicated via email or in-app notifications.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">14. Contact Us</h2>
            <ul className="list-none pl-0">
              <li><strong>Email:</strong> <a href="mailto:privacy@loopletter.co" className="text-blue-600 underline">privacy@loopletter.co</a></li>
              <li className="mt-2"><strong>Mailing Address:</strong><br />
                LOST HILLS LLC<br />
                5830 E 2nd St, Ste 7000 #21352<br />
                Casper, WY 82609<br />
                United States
              </li>
            </ul>
          </section>
        </div>
      </main>
    </div>);
}
