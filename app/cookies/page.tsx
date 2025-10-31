import { Metadata } from "next";
export const metadata: Metadata = {
    title: "Cookie Policy - Loopletter",
    description: "Learn about how Loopletter uses cookies and similar technologies.",
};
export default function CookiesPage() {
    return (<div className="min-h-screen bg-white text-gray-900">
      
      <header className="bg-gray-50 border-b">
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Cookie Policy
          </h1>
          <p className="mt-4 text-lg text-gray-600">Last updated: January 16, 2025</p>
        </div>
      </header>

      
      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="prose prose-lg max-w-none space-y-12">
          <section>
            <h2>What Are Cookies?</h2>
            <p>
              Cookies are small text files that are stored on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and improving our services.
            </p>
          </section>

          <section>
            <h2>How We Use Cookies</h2>
            <h3>Essential Cookies</h3>
            <ul>
              <li><strong>Authentication:</strong> Keep you logged in to your account</li>
              <li><strong>Security:</strong> Protect against fraud and unauthorized access</li>
              <li><strong>Session Management:</strong> Maintain your session across pages</li>
              <li><strong>Load Balancing:</strong> Distribute traffic across our servers</li>
            </ul>

            <h3>Analytics Cookies</h3>
            <ul>
              <li><strong>Usage Analytics:</strong> Track page views, user interactions, and feature usage</li>
              <li><strong>Performance Monitoring:</strong> Identify and fix technical issues</li>
              <li><strong>A/B Testing:</strong> Test different versions of our platform</li>
            </ul>

            <h3>Functional Cookies</h3>
            <ul>
              <li><strong>Preferences:</strong> Remember your settings and customizations</li>
              <li><strong>Language:</strong> Store your preferred language</li>
              <li><strong>Theme:</strong> Remember your display preferences</li>
            </ul>

            <h3>Marketing Cookies</h3>
            <ul>
              <li><strong>Advertising:</strong> Display relevant ads on other websites</li>
              <li><strong>Social Media:</strong> Enable social media sharing features</li>
              <li><strong>Campaign Tracking:</strong> Measure the effectiveness of our marketing</li>
            </ul>
          </section>

          <section>
            <h2>Third-Party Cookies</h2>
            <h3>Analytics Services</h3>
            <ul>
              <li><strong>Google Analytics:</strong> Website traffic and user behavior analysis</li>
              <li><strong>Mixpanel:</strong> Product analytics and user engagement tracking</li>
            </ul>

            <h3>Support Services</h3>
            <ul>
              <li><strong>Intercom:</strong> Customer support chat functionality</li>
              <li><strong>Zendesk:</strong> Help desk and support ticket management</li>
            </ul>

            <h3>Payment Processing</h3>
            <ul>
              <li><strong>Stripe:</strong> Secure payment processing</li>
            </ul>
          </section>

          <section>
            <h2>Managing Your Cookie Preferences</h2>
            <h3>Browser Settings</h3>
            <ul>
              <li>Block all cookies</li>
              <li>Block third-party cookies only</li>
              <li>Delete existing cookies</li>
              <li>Receive notifications when cookies are set</li>
            </ul>

            <h3>Opt-Out Options</h3>
            <ul>
              <li><strong>Google Analytics:</strong> <a href="https://tools.google.com/dlpage/gaoptout" className="text-blue-600 hover:underline">Google Analytics Opt-out</a></li>
              <li><strong>Advertising:</strong> <a href="http://www.aboutads.info/choices/" className="text-blue-600 hover:underline">Digital Advertising Alliance</a></li>
            </ul>
          </section>

          <section>
            <h2>Cookie Categories</h2>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3>Strictly Necessary</h3>
              <p className="text-sm text-gray-600 mb-4">These cookies cannot be disabled as they are essential for the website to function.</p>
              <ul className="text-sm">
                <li>Session cookies</li>
                <li>Authentication tokens</li>
                <li>Security cookies</li>
              </ul>
            </div>

            <div className="bg-blue-50 p-6 rounded-lg mt-4">
              <h3>Performance & Analytics</h3>
              <p className="text-sm text-gray-600 mb-4">These cookies help us improve our website performance.</p>
              <ul className="text-sm">
                <li>Google Analytics</li>
                <li>Error tracking</li>
                <li>Performance monitoring</li>
              </ul>
            </div>

            <div className="bg-green-50 p-6 rounded-lg mt-4">
              <h3>Functional</h3>
              <p className="text-sm text-gray-600 mb-4">These cookies enhance your user experience.</p>
              <ul className="text-sm">
                <li>User preferences</li>
                <li>Language settings</li>
                <li>Theme preferences</li>
              </ul>
            </div>

            <div className="bg-purple-50 p-6 rounded-lg mt-4">
              <h3>Marketing</h3>
              <p className="text-sm text-gray-600 mb-4">These cookies help us show you relevant content and ads.</p>
              <ul className="text-sm">
                <li>Advertising cookies</li>
                <li>Social media pixels</li>
                <li>Campaign tracking</li>
              </ul>
            </div>
          </section>

          <section>
            <h2>Mobile Apps</h2>
            <p>
              Our mobile applications may use similar technologies to cookies, including:
            </p>
            <ul>
              <li>Local storage</li>
              <li>Device identifiers</li>
              <li>SDK analytics</li>
            </ul>
          </section>

          <section>
            <h2>Updates to This Policy</h2>
            <p>
              We may update this Cookie Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the &quot;Last updated&quot; date.
            </p>
          </section>

          <section>
            <h2>Contact Us</h2>
            <ul>
              <li><strong>Email:</strong> <a href="mailto:privacy@loopletter.co" className="text-blue-600 hover:underline">privacy@loopletter.co</a></li>
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
