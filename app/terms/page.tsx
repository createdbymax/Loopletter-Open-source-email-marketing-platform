import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service - Loopletter",
  description: "Terms and conditions for using Loopletter's email marketing platform.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="bg-gray-50 border-b">
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Terms of Service
          </h1>
          <p className="mt-4 text-lg text-gray-600">Last updated: January 16, 2025</p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="space-y-16">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
            <p className="text-gray-600 mb-6">Last updated: December 1, 2024. These terms govern your use of &quot;Loopletter&quot; (the &quot;Service&quot;) provided by Loopletter Inc. (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). By accessing or using our Service, you agree to be bound by these Terms.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p>
              Loopletter is an email marketing platform for independent artists. Users can create, send, and track email campaigns to engage with their fans and grow their audience.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>

            <h3 className="text-xl font-medium mt-6 mb-2">Account Creation</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>You must provide accurate and complete information.</li>
              <li>You must be at least 18 years old.</li>
              <li>Only one free account per person or legal entity.</li>
              <li>You are responsible for safeguarding your credentials.</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-2">Account Responsibilities</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>You are liable for activity under your account.</li>
              <li>Notify us immediately of any unauthorized access.</li>
              <li>We may suspend or terminate accounts that violate these Terms.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Acceptable Use Policy</h2>
            <p className="mb-2">You agree not to use Loopletter to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Send spam or unsolicited emails.</li>
              <li>Distribute viruses or malware.</li>
              <li>Break any laws or regulations.</li>
              <li>Violate intellectual property rights.</li>
              <li>Harass, abuse, or harm others.</li>
              <li>Impersonate individuals or misrepresent your identity.</li>
              <li>Disrupt our Service or infrastructure.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Email Marketing Compliance</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Comply with CAN-SPAM, GDPR, and other relevant laws.</li>
              <li>Send emails only to users who have explicitly opted in.</li>
              <li>Include a clear unsubscribe option in every message.</li>
              <li>Honor all unsubscribe requests within 10 business days.</li>
              <li>Use accurate headers, subject lines, and sender info.</li>
              <li>Maintain records of consent and subscriber data.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Content and Intellectual Property</h2>

            <h3 className="text-xl font-medium mt-6 mb-2">Your Content</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>You retain ownership of your uploaded content.</li>
              <li>You grant Loopletter a license to use your content for delivering the Service.</li>
              <li>You are solely responsible for the legality of your content.</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-2">Our IP</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Loopletter is protected by copyright, trademark, and other laws.</li>
              <li>You may not reproduce or reverse-engineer the platform.</li>
              <li>Use of our logos, trademarks, and branding is prohibited without written permission.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Payment Terms</h2>

            <h3 className="text-xl font-medium mt-6 mb-2">Billing</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Subscriptions are billed monthly or annually in advance.</li>
              <li>Fees are non-refundable except where required by law.</li>
              <li>We may change pricing with 30 days' notice.</li>
              <li>Accounts with overdue payments may be suspended.</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-2">Free Plan</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Free accounts are limited in features and usage.</li>
              <li>We reserve the right to modify or discontinue the free plan at any time.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Service Availability</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>We aim for 99.9% uptime but do not guarantee uninterrupted access.</li>
              <li>Maintenance may occur with or without notice.</li>
              <li>We are not liable for downtimes outside of our control.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Data and Privacy</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Your use of Loopletter is subject to our <Link href="/privacy" className="text-blue-600 underline">Privacy Policy</Link>.</li>
              <li>You are responsible for obtaining and managing your subscribers’ consent.</li>
              <li>We implement security measures but cannot guarantee absolute protection.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Termination</h2>

            <h3 className="text-xl font-medium mt-6 mb-2">By You</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>You may cancel your account at any time.</li>
              <li>Your subscription remains active through the paid billing cycle.</li>
              <li>You may export your data before termination.</li>
            </ul>

            <h3 className="text-xl font-medium mt-6 mb-2">By Us</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>We may suspend or terminate accounts that violate these Terms.</li>
              <li>We may terminate or change the Service with reasonable notice.</li>
              <li>We will offer data export options when feasible.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Disclaimers and Limitations</h2>

            <h3 className="text-xl font-medium mt-6 mb-2">Disclaimer</h3>
            <p>The Service is provided “as is” without any warranties of any kind, including fitness for a particular purpose or non-infringement.</p>

            <h3 className="text-xl font-medium mt-6 mb-2">Limitation of Liability</h3>
            <p>
              Our liability is limited to the amount paid by you in the 12 months prior to the claim. We are not liable for indirect, incidental, or consequential damages.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Indemnification</h2>
            <p>
              You agree to indemnify and hold Loopletter harmless from claims, liabilities, damages, or expenses arising from your use of the Service or violation of these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">13. Governing Law</h2>
            <p>
              These Terms are governed by the laws of the State of Wyoming, USA. Any legal action must be filed in courts located in Natrona County, Wyoming.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">14. Changes to Terms</h2>
            <p>
              We may revise these Terms periodically. We will notify you of material changes via email or in-app notice. Continued use of the Service constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">15. Contact Us</h2>
            <ul className="list-none pl-0">
              <li><strong>Email:</strong> <a href="mailto:legal@loopletter.co" className="text-blue-600 underline">legal@loopletter.co</a></li>
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
    </div>
  );
}