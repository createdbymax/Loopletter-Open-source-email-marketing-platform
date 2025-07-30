import { Metadata } from "next";
import Link from "next/link";
import { Mail, MessageSquare, Clock, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us - Loopletter",
  description: "Get in touch with the Loopletter team. We&apos;d love to hear from you with questions, support, and feedback.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-xl text-gray-600">
            We&apos;re here to help. Reach out with questions, feedback, or just to say hello.
          </p>
        </div>
      </div>

      {/* Contact Options */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* General Support */}
            <div className="bg-gray-50 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                <HelpCircle className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">General Support</h3>
              <p className="text-gray-600 mb-6">
                Questions about your account, billing, or how to use Loopletter? We&apos;re here to help.
              </p>
              <div className="space-y-2">
                <p className="font-medium text-gray-900">support@loopletter.co</p>
                <p className="text-sm text-gray-600">Response within 24 hours</p>
              </div>
            </div>

            {/* Sales & Partnerships */}
            <div className="bg-gray-50 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Sales & Partnerships</h3>
              <p className="text-gray-600 mb-6">
                Interested in custom plans, partnerships, or enterprise solutions?
              </p>
              <div className="space-y-2">
                <p className="font-medium text-gray-900">sales@loopletter.co</p>
                <p className="text-sm text-gray-600">Let&apos;s talk about your needs</p>
              </div>
            </div>

            {/* Press & Media */}
            <div className="bg-gray-50 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Press & Media</h3>
              <p className="text-gray-600 mb-6">
                Media inquiries, press releases, and interview requests.
              </p>
              <div className="space-y-2">
                <p className="font-medium text-gray-900">press@loopletter.co</p>
                <p className="text-sm text-gray-600">Press kit available</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white border rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Send us a message</h2>
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Your first name"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Your last name"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a topic</option>
                    <option value="support">General Support</option>
                    <option value="billing">Billing Question</option>
                    <option value="feature">Feature Request</option>
                    <option value="bug">Bug Report</option>
                    <option value="partnership">Partnership Inquiry</option>
                    <option value="press">Press Inquiry</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tell us how we can help..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-black hover:bg-gray-800 text-white py-4 rounded-lg font-semibold transition-all"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Info */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12">
            {/* FAQ */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">How quickly do you respond to support requests?</h4>
                  <p className="text-gray-600">We aim to respond to all support requests within 24 hours during business days. Urgent issues are prioritized.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Do you offer phone support?</h4>
                  <p className="text-gray-600">Currently, we provide support via email and our in-app chat. This allows us to provide detailed, documented assistance.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Can I schedule a demo?</h4>
                  <p className="text-gray-600">Yes! Contact our sales team at sales@loopletter.co to schedule a personalized demo of Loopletter.</p>
                </div>
              </div>
            </div>

            {/* Support Hours */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Support Hours</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">Monday - Friday</p>
                    <p className="text-gray-600">9:00 AM - 6:00 PM PST</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">Weekend</p>
                    <p className="text-gray-600">Limited support via email</p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h4 className="font-semibold text-gray-900 mb-4">Other Ways to Get Help</h4>
                <div className="space-y-3">
                  <Link href="/help" className="flex items-center gap-3 text-blue-600 hover:text-blue-700">
                    <HelpCircle className="w-5 h-5" />
                    Help Center & Documentation
                  </Link>
                  <Link href="/community" className="flex items-center gap-3 text-blue-600 hover:text-blue-700">
                    <MessageSquare className="w-5 h-5" />
                    Community Forum
                  </Link>
                  <Link href="/status" className="flex items-center gap-3 text-blue-600 hover:text-blue-700">
                    <Clock className="w-5 h-5" />
                    Service Status
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}