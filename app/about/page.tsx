import { Metadata } from "next";
import Link from "next/link";
import { Music, Heart, Users, Zap } from "lucide-react";
export const metadata: Metadata = {
    title: "About Us - Loopletter",
    description: "Learn about Loopletter's mission to help independent artists build lasting relationships with their fans.",
};
export default function AboutPage() {
    return (<div className="min-h-screen bg-white">
      
      <section className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Email built for independent artists
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            We believe every artist deserves a direct line to their fans.
            Loopletter helps independent musicians build real, lasting
            relationships without depending on algorithms or social media
            platforms.
          </p>
        </div>
      </section>

      
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                The music industry has changed. Streaming platforms control
                discovery, social media algorithms decide who sees your posts,
                and artists are building their careers on rented land.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                We created Loopletter to give artists back control. Email is the
                one channel you truly own— no algorithm can hide your message,
                no platform can take away your audience.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Our mission is simple: help independent artists build direct,
                lasting relationships with their fans.
              </p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Music className="w-6 h-6 text-blue-600"/>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">5,000+</div>
                  <div className="text-sm text-gray-600">Artists Served</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6 text-green-600"/>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">2M+</div>
                  <div className="text-sm text-gray-600">Fan Connections</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Heart className="w-6 h-6 text-purple-600"/>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">65%</div>
                  <div className="text-sm text-gray-600">Avg Open Rate</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Zap className="w-6 h-6 text-orange-600"/>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">98%</div>
                  <div className="text-sm text-gray-600">
                    Artist Satisfaction
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">
            Our Story
          </h2>
          <div className="prose prose-lg max-w-none">
            <p>
              Loopletter was born from frustration. As musicians ourselves, we
              watched talented artists struggle to reach their own fans. Posts
              got buried in feeds, streaming algorithms favored major labels,
              and artists had no way to communicate directly with the people who
              loved their music.
            </p>
            <p>
              We tried existing email platforms, but they were built for
              businesses selling products—not artists sharing their passion. The
              templates looked corporate, the features were overwhelming, and
              the pricing was designed for companies with marketing budgets, not
              independent musicians.
            </p>
            <p>
              So we built something different. Loopletter is designed
              specifically for artists, with templates that feel authentic,
              features that matter to musicians, and pricing that works for
              independent creators.
            </p>
            <p>
              Today, thousands of artists use Loopletter to share new releases,
              announce tours, and build genuine connections with their fans.
              Every email sent through our platform represents an artist taking
              control of their relationship with their audience.
            </p>
          </div>
        </div>
      </section>

      
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
            Our Values
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Music className="w-8 h-8 text-blue-600"/>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Artist-First
              </h3>
              <p className="text-gray-600">
                Every decision we make is guided by what&apos;s best for independent
                artists. We&apos;re not just building software—we&apos;re supporting
                creative careers.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-green-600"/>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Authentic Connection
              </h3>
              <p className="text-gray-600">
                We believe in real relationships between artists and fans. Our
                tools help create genuine connections, not just marketing
                metrics.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-purple-600"/>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Ownership
              </h3>
              <p className="text-gray-600">
                Artists should own their audience relationships. We provide the
                tools, but your fan list belongs to you—forever.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-orange-600"/>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Simplicity
              </h3>
              <p className="text-gray-600">
                Great tools should be easy to use. We focus on the features that
                matter and keep everything else out of the way.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-red-600"/>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Transparency
              </h3>
              <p className="text-gray-600">
                No hidden fees, no vendor lock-in, no surprises. We&apos;re
                upfront about our pricing, policies, and practices.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-indigo-600"/>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Community
              </h3>
              <p className="text-gray-600">
                We&apos;re building more than a platform—we&apos;re fostering a
                community of independent artists who support each other&apos;s
                success.
              </p>
            </div>
          </div>
        </div>
      </section>

      
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">
            Built by Musicians
          </h2>
          <p className="text-lg text-gray-600 text-center mb-12">
            Our team combines deep music industry experience with world-class
            technical expertise. We understand the challenges independent
            artists face because we&apos;ve lived them.
          </p>
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              We&apos;re a small, dedicated team focused on solving real
              problems for independent artists.
            </p>
            <p className="text-gray-600">
              Want to join us?{" "}
              <Link href="/careers" className="text-blue-600 hover:underline">
                We&apos;re hiring
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">
            Get in Touch
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Have questions about Loopletter? Want to share your story? We&apos;d
            love to hear from you.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                General Inquiries
              </h3>
              <p className="text-gray-600">hello@loopletter.co</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Support</h3>
              <p className="text-gray-600">support@loopletter.co</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Press</h3>
              <p className="text-gray-600">press@loopletter.co</p>
            </div>
          </div>
        </div>
      </section>
    </div>);
}
