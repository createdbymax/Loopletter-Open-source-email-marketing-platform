import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { generateMarketingMetadata } from "@/lib/metadata";

export const metadata: Metadata = generateMarketingMetadata(
  "LoopLetter - Email Built for Independent Artists",
  "Build real, lasting relationships with your fans. No algorithms, no middlemen. Just your voice in their inbox.",
  "/",
  [
    "email for musicians",
    "independent artist tools",
    "musician newsletter",
    "fan engagement",
    "artist email",
    "music marketing",
    "direct fan communication",
  ]
);

import {
  Mail,
  Users,
  ArrowRight,
  Play,
  Heart,
  Music,
  Send,
  CheckCircle,
  Star,
  BarChart3,
  Zap,
  Target,
  TrendingUp,
  Calendar,
  MessageSquare,
  Globe,
  Shield,
  Clock,
  Award,
  Sparkles,
  ChevronRight,
  Headphones,
  Mic,
  Radio,
  Volume2,
  Eye,
  Plus,
  Settings,
  FileText,
  Monitor,
  Smartphone,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 lg:px-12 py-6 bg-white border-b border-gray-100 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <div className="flex items-center gap-8">
          <Image
            src="/loopletterlogo.svg"
            alt="LoopLetter"
            width={140}
            height={36}
            className="flex-shrink-0"
          />
        </div>

        <div className="flex items-center gap-4">
          <SignedOut>
            <SignInButton>
              <button className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton>
              <button className="bg-black hover:bg-gray-800 text-white px-6 py-2.5 rounded-lg font-medium transition-all">
                Get Started
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="bg-black hover:bg-gray-800 text-white px-6 py-2.5 rounded-lg font-medium transition-all"
            >
              Dashboard
            </Link>
            <UserButton />
          </SignedIn>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 lg:px-12 pt-20 pb-32 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium mb-8 animate-fade-in-up animation-delay-200">
                <Sparkles className="w-4 h-4 animate-pulse" />
                Built for Independent Artists
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-8 leading-tight animate-fade-in-up animation-delay-300">
                Own your fans,
                <br />
                not just your music
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed animate-fade-in-up animation-delay-400">
                Stop depending on algorithms. Build direct relationships with
                your fans through email—the only channel you truly own.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mb-8 animate-fade-in-up animation-delay-500">
                <div className="text-center group cursor-pointer">
                  <div className="text-2xl font-bold text-gray-900 group-hover:scale-110 transition-transform duration-200">
                    5k+
                  </div>
                  <div className="text-sm text-gray-600">Artists</div>
                </div>
                <div className="text-center group cursor-pointer">
                  <div className="text-2xl font-bold text-gray-900 group-hover:scale-110 transition-transform duration-200">
                    65%
                  </div>
                  <div className="text-sm text-gray-600">Open Rate</div>
                </div>
                <div className="text-center group cursor-pointer">
                  <div className="text-2xl font-bold text-gray-900 group-hover:scale-110 transition-transform duration-200">
                    Free
                  </div>
                  <div className="text-sm text-gray-600">Up to 500 fans</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up animation-delay-600">
                <SignedOut>
                  <SignUpButton>
                    <button className="bg-black hover:bg-gray-800 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all flex items-center gap-2 shadow-sm hover:shadow-md hover:scale-105 group">
                      Start Building Your Fanbase
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <Link
                    href="/dashboard"
                    className="bg-black hover:bg-gray-800 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all flex items-center gap-2 shadow-sm hover:shadow-md hover:scale-105 group"
                  >
                    Go to Dashboard
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </SignedIn>
                <button className="text-gray-600 hover:text-gray-900 font-medium text-lg transition-colors flex items-center gap-3 group">
                  <div className="w-12 h-12 bg-white group-hover:bg-gray-50 rounded-full flex items-center justify-center transition-all shadow-sm border border-gray-200 group-hover:shadow-md group-hover:scale-105">
                    <Play className="w-5 h-5 ml-0.5 group-hover:scale-110 transition-transform" />
                  </div>
                  Watch Demo
                </button>
              </div>
            </div>

            {/* Hero Visual - Real Dashboard Mockup */}
            <div className="relative animate-slide-in-right animation-delay-800">
              <div className="bg-white rounded-lg border shadow-xl overflow-hidden">
                {/* Dashboard Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b bg-white">
                  <div className="flex items-center gap-3">
                    <Image
                      src="/loopletterlogo.svg"
                      alt="LoopLetter"
                      width={100}
                      height={24}
                      className="flex-shrink-0"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      Send Campaign
                    </button>
                  </div>
                </div>

                {/* Dashboard Content */}
                <div className="p-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      Welcome back, Luna!
                    </h2>
                    <p className="text-gray-600">
                      Here's what's happening with your email marketing
                    </p>
                  </div>

                  {/* Metrics Cards */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg border">
                      <div className="flex items-center mb-2">
                        <Mail className="w-4 h-4 text-blue-600 mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          Total Campaigns
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">12</p>
                      <p className="text-sm text-gray-600">3 drafts, 9 sent</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border">
                      <div className="flex items-center mb-2">
                        <Users className="w-4 h-4 text-green-600 mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          Total Fans
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">1,247</p>
                      <p className="text-sm text-gray-600">
                        Active subscribers
                      </p>
                    </div>
                  </div>

                  {/* Recent Campaign */}
                  <div className="bg-white rounded-lg border">
                    <div className="p-4 border-b">
                      <h3 className="font-medium">Recent Campaigns</h3>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
                          <div>
                            <h4 className="font-medium">
                              🎵 "Midnight Dreams" is here!
                            </h4>
                            <p className="text-sm text-gray-600">
                              Sent 2 days ago
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Sent
                          </span>
                          <button className="p-1 hover:bg-gray-100 rounded">
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Analytics Card */}
              <div className="absolute -bottom-6 -right-6 bg-white rounded-lg border shadow-lg p-4 max-w-xs animate-float animation-delay-1000">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center animate-pulse-glow">
                    <BarChart3 className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      Campaign Performance
                    </div>
                    <div className="text-sm text-gray-600">Last 30 days</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Open Rate</span>
                    <span className="font-medium">67.2%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: "67%" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What is LoopLetter */}
      <section className="px-6 lg:px-12 py-32 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-8">
            What is LoopLetter?
          </h2>
          <div className="text-xl text-gray-700 leading-relaxed space-y-6">
            <p>
              LoopLetter is a simple, modern email platform made just for
              independent artists. It gives you a direct line to your fans — so
              you can share your music, your story, and your journey with the
              people who care most.
            </p>
            <p className="font-semibold text-gray-900">
              By building your own email list, you create a direct, permanent
              connection with your fans. No middlemen. No feed. Just your voice
              in their inbox.
            </p>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="px-6 lg:px-12 py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-8">
              The algorithm
              <br />
              <span className="text-gray-400">problem</span>
            </h2>
            <p className="text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto">
              You're building your career on rented land. Spotify playlists
              disappear. TikTok trends fade. Instagram reach drops. But your
              fans? They're forever—if you can reach them.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16 stagger-children">
            <div className="bg-white rounded-2xl p-8 text-center border shadow-sm hover-lift interactive-card">
              <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-6 hover-glow">
                <TrendingUp className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Algorithm Dependency
              </h3>
              <p className="text-gray-600">
                Your reach depends on platforms that change rules overnight. One
                update can kill your visibility.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 text-center border shadow-sm hover-lift interactive-card">
              <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-6 hover-glow">
                <Users className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                No Real Connection
              </h3>
              <p className="text-gray-600">
                Millions of streams but no way to talk to your listeners. You
                don't own your audience.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 text-center border shadow-sm hover-lift interactive-card">
              <div className="w-16 h-16 bg-yellow-100 rounded-xl flex items-center justify-center mx-auto mb-6 hover-glow">
                <Target className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Generic Tools
              </h3>
              <p className="text-gray-600">
                Email platforms built for businesses, not artists. Complex,
                expensive, and missing what you actually need.
              </p>
            </div>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg text-lg font-semibold">
              <Sparkles className="w-5 h-5" />
              LoopLetter changes everything
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 lg:px-12 py-32 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Everything you need to
              <br />
              connect with fans
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built specifically for musicians. Every feature designed to help
              you build lasting relationships with your audience.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-8 rounded-xl border hover:shadow-lg hover:scale-105 transition-all duration-300 group cursor-pointer">
              <Mail className="w-8 h-8 text-gray-600 mb-4 group-hover:text-blue-600 group-hover:scale-110 transition-all duration-200" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Beautiful email templates
              </h3>
              <p className="text-gray-600">
                Share your music, tour dates, stories, and more with templates
                designed for artists.
              </p>
            </div>

            <div className="bg-gray-50 p-8 rounded-xl border hover:shadow-lg hover:scale-105 transition-all duration-300 group cursor-pointer">
              <Users className="w-8 h-8 text-gray-600 mb-4 group-hover:text-green-600 group-hover:scale-110 transition-all duration-200" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Collect emails easily
              </h3>
              <p className="text-gray-600">
                Clean, personal sign-up pages that feel authentic to your brand.
              </p>
            </div>

            <div className="bg-gray-50 p-8 rounded-xl border hover:shadow-lg hover:scale-105 transition-all duration-300 group cursor-pointer">
              <BarChart3 className="w-8 h-8 text-gray-600 mb-4 group-hover:text-purple-600 group-hover:scale-110 transition-all duration-200" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Track fan engagement
              </h3>
              <p className="text-gray-600">
                See who opens, clicks, or replies. Know your most engaged fans.
              </p>
            </div>

            <div className="bg-gray-50 p-8 rounded-xl border hover:shadow-lg hover:scale-105 transition-all duration-300 group cursor-pointer">
              <Send className="w-8 h-8 text-gray-600 mb-4 group-hover:text-orange-600 group-hover:scale-110 transition-all duration-200" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Send instantly or schedule
              </h3>
              <p className="text-gray-600">
                Perfect timing for releases, announcements, or personal updates.
              </p>
            </div>

            <div className="bg-gray-50 p-8 rounded-xl border hover:shadow-lg hover:scale-105 transition-all duration-300 group cursor-pointer">
              <Zap className="w-8 h-8 text-gray-600 mb-4 group-hover:text-yellow-600 group-hover:scale-110 transition-all duration-200" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Release automation
              </h3>
              <p className="text-gray-600">
                Automatically notify fans when you drop new music or announce
                tours.
              </p>
            </div>

            <div className="bg-gray-50 p-8 rounded-xl border hover:shadow-lg hover:scale-105 transition-all duration-300 group cursor-pointer">
              <Shield className="w-8 h-8 text-gray-600 mb-4 group-hover:text-red-600 group-hover:scale-110 transition-all duration-200" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Own your list
              </h3>
              <p className="text-gray-600">
                Your fan list belongs to you forever. Export anytime, no
                lock-in.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="px-6 lg:px-12 py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Loved by artists
              <br />
              worldwide
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See how independent artists are using LoopLetter to build deeper
              connections with their fans and grow their careers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* Testimonial 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border">
              <div className="flex items-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <p className="text-gray-700 mb-6 text-lg leading-relaxed">
                "LoopLetter helped me turn casual listeners into real fans. My
                last release got 3x more streams because I could reach my
                audience directly."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Music className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Maya Chen</div>
                  <div className="text-sm text-gray-600">
                    Indie Pop Artist • 2.1k fans
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border">
              <div className="flex items-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <p className="text-gray-700 mb-6 text-lg leading-relaxed">
                "I sold out my first tour by emailing my LoopLetter fans first.
                The personal connection makes all the difference.&quot;
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Headphones className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    Jake Rodriguez
                  </div>
                  <div className="text-sm text-gray-600">
                    Folk Singer • 1.8k fans
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border">
              <div className="flex items-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <p className="text-gray-700 mb-6 text-lg leading-relaxed">
                &quot;Finally, a platform that gets musicians. My open rates are
                65% compared to 15% on social media.&quot;
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Mic className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Luna Rivers</div>
                  <div className="text-sm text-gray-600">
                    Electronic Artist • 3.2k fans
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="bg-white rounded-2xl p-12 shadow-sm border">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  5,000+
                </div>
                <div className="text-gray-600">Independent Artists</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-gray-900 mb-2">65%</div>
                <div className="text-gray-600">Average Open Rate</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-gray-900 mb-2">2M+</div>
                <div className="text-gray-600">Fan Connections Made</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-gray-900 mb-2">98%</div>
                <div className="text-gray-600">Artist Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="px-6 lg:px-12 py-28 bg-gradient-to-b from-white to-gray-50">
  <div className="max-w-7xl mx-auto">
    <div className="text-center mb-20">
      <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
        Flexible pricing for artists
        <br />
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
          at every stage
        </span>
      </h2>
      <p className="text-lg text-gray-600 mt-6 max-w-2xl mx-auto">
        Start for free. Upgrade as you grow. No contracts, no hidden fees.
      </p>
    </div>

    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
      {/* STARTER PLAN */}
      <div className="rounded-2xl p-8 shadow-md border bg-white border-gray-200 hover:shadow-xl flex flex-col justify-between transition-all duration-300">
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">🔓</div>
          <h3 className="text-2xl font-bold mb-2">Starter</h3>
          <p className="text-xl font-semibold">
            $0<span className="text-base font-normal ml-1">/month</span>
          </p>
          <p className="mt-2 text-sm opacity-70">Perfect for new artists and hobbyists</p>
        </div>
        <ul className="space-y-3 text-sm mb-8">
          <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-600" />1,000 fan limit</li>
          <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-600" />3,000 emails/month</li>
          <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-600" />Manual campaigns</li>
          <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-600" />Hosted signup page</li>
          <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-600" />Welcome auto-responder</li>
          <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-600" />Basic analytics</li>
          <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-600" />Fan tagging</li>
          <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-600" />LoopLetter branding</li>
          <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-green-600" />Community support</li>
        </ul>
        <div className="mt-auto">
          <SignedOut>
            <SignUpButton>
              <button className="w-full py-3 rounded-lg bg-gray-900 text-white font-medium hover:bg-black transition">
                Start Free Forever
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard" className="block text-center py-3 rounded-lg bg-gray-900 text-white font-medium hover:bg-black transition">
              Go to Dashboard
            </Link>
          </SignedIn>
        </div>
      </div>

      {/* INDEPENDENT PLAN */}
      <div className="rounded-2xl p-8 shadow-xl border text-white bg-gradient-to-br from-gray-900 to-black border-transparent scale-105 relative flex flex-col justify-between">
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="px-4 py-1 text-xs rounded-full font-medium shadow-sm bg-blue-600 text-white">Most Popular</span>
        </div>
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">🚀</div>
          <h3 className="text-2xl font-bold mb-2">Independent</h3>
          <p className="text-5xl font-semibold">$29<span className="text-base font-normal ml-2 text-gray-300">/month</span></p>
          <p className="mt-2 text-sm text-gray-300">Ideal for growing artists and indie labels</p>
        </div>
        <ul className="space-y-3 text-sm mb-8">
          <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-blue-400" />10,000 fan limit</li>
          <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-blue-400" />Email scheduling</li>
          <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-blue-400" />Advanced analytics</li>
          <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-blue-400" />Segmentation</li>
          <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-blue-400" />Unlimited automations</li>
          <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-blue-400" />Remove branding</li>
          <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-blue-400" />Custom signup domain</li>
          <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-blue-400" />Custom email design</li>
          <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-blue-400" />Premium support</li>
        </ul>
        <Link
  href="/dashboard"
  className="block text-center py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition shadow hover:shadow-lg"
>
  Start 14-Day Free Trial
</Link>
      </div>

      {/* LABEL/AGENCY PLAN */}
      <div className="rounded-2xl p-8 shadow-md border bg-white border-gray-200 hover:shadow-xl flex flex-col justify-between transition-all duration-300">
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">👥</div>
          <h3 className="text-2xl font-bold mb-2">Label/Agency</h3>
          <p className="text-xl font-semibold">
            $99<span className="text-base font-normal ml-1">/month</span>
          </p>
          <p className="mt-2 text-sm opacity-70">Built for teams managing multiple artists</p>
        </div>
        <ul className="space-y-3 text-sm mb-8">
          <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-blue-600" />50,000 fan limit</li>
          <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-blue-600" />Manage multiple artists</li>
          <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-blue-600" />Multi-user access</li>
          <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-blue-600" />White-labeling</li>
          <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-blue-600" />Priority support</li>
          <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-blue-600" />Onboarding help</li>
          <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-blue-600" />Monetization tools</li>
        </ul>
        <a href="#contact" className="block text-center py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition">
          Contact for Team Plan
        </a>
      </div>
    </div>

    <div className="text-center mt-24">
      <h4 className="text-2xl font-bold text-gray-900 mb-4">Optional Add-ons</h4>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {["Extra user seats & monetization tools", "SMS campaigns ($10/month)", "API/Zapier integrations"]
          .map((item) => (
            <div key={item} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition">
              <CheckCircle className="w-5 h-5 text-blue-600 mb-2" />
              <p className="text-gray-700 text-sm text-center">{item}</p>
            </div>
        ))}
      </div>
      <button className="mt-8 px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-black transition inline-flex items-center gap-2">
        Contact us for custom pricing <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  </div>
</section>


      {/* Final CTA Section */}
      <section className="px-6 py-32 bg-neutral-100 text-black">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-5xl lg:text-6xl font-bold mb-8 text-gray-900">
            Ready to own your fanbase?
          </h2>
          <p className="text-xl lg:text-2xl mb-12 text-gray-600 max-w-3xl mx-auto">
            Join thousands of independent artists who&apos;ve taken control of
            their fan relationships. Start building real connections today.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <SignedOut>
              <SignUpButton>
                <button className="bg-black text-white hover:bg-gray-800 px-10 py-5 rounded-lg font-bold text-xl transition-all shadow-lg hover:shadow-xl">
                  Start Free Forever
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="bg-black text-white hover:bg-gray-800 px-10 py-5 rounded-lg font-bold text-xl transition-all shadow-lg hover:shadow-xl inline-block"
              >
                Go to Dashboard
              </Link>
            </SignedIn>
            <div className="text-gray-600">
              <div className="text-sm">✨ No credit card required</div>
              <div className="text-sm">🚀 Setup in under 5 minutes</div>
            </div>
          </div>

          {/* Final Stats */}
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
              <div className="text-3xl font-bold mb-2 text-gray-900">
                5,000+
              </div>
              <div className="text-gray-600">Artists Trust Us</div>
            </div>
            <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
              <div className="text-3xl font-bold mb-2 text-gray-900">2M+</div>
              <div className="text-gray-600">Fan Connections</div>
            </div>
            <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
              <div className="text-3xl font-bold mb-2 text-gray-900">65%</div>
              <div className="text-gray-600">Avg Open Rate</div>
            </div>
            <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
              <div className="text-3xl font-bold mb-2 text-gray-900">Free</div>
              <div className="text-gray-600">Up to 500 Fans</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <Image
                src="/loopletterlogo.svg"
                alt="LoopLetter"
                width={140}
                height={36}
                className="mb-4 invert"
              />
              <p className="text-gray-400 mb-6 max-w-sm">
                Email marketing built specifically for independent artists. Own
                your fanbase, grow your career.
              </p>
              <div className="flex items-center gap-4">
                <a
                  href="https://twitter.com/loopletter"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a
                  href="https://instagram.com/loopletter"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.004 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.418-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.928.875 1.418 2.026 1.418 3.323s-.49 2.448-1.418 3.244c-.875.807-2.026 1.297-3.323 1.297zm7.83-9.781c-.315 0-.612-.123-.833-.344-.221-.221-.344-.518-.344-.833 0-.315.123-.612.344-.833.221-.221.518-.344.833-.344s.612.123.833.344c.221.221.344.518.344.833 0 .315-.123.612-.344.833-.221.221-.518.344-.833.344z" />
                  </svg>
                </a>
                <a
                  href="https://youtube.com/@loopletter"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <h3 className="font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li>
                  <a
                    href="#features"
                    className="hover:text-white transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="hover:text-white transition-colors"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <Link
                    href="/templates"
                    className="hover:text-white transition-colors"
                  >
                    Templates
                  </Link>
                </li>
                <li>
                  <Link
                    href="/integrations"
                    className="hover:text-white transition-colors"
                  >
                    Integrations
                  </Link>
                </li>
                <li>
                  <Link
                    href="/api"
                    className="hover:text-white transition-colors"
                  >
                    API
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="font-semibold text-white mb-4">Resources</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li>
                  <Link
                    href="/help"
                    className="hover:text-white transition-colors"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="hover:text-white transition-colors"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/guides"
                    className="hover:text-white transition-colors"
                  >
                    Artist Guides
                  </Link>
                </li>
                <li>
                  <Link
                    href="/community"
                    className="hover:text-white transition-colors"
                  >
                    Community
                  </Link>
                </li>
                <li>
                  <Link
                    href="/status"
                    className="hover:text-white transition-colors"
                  >
                    Status
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li>
                  <Link
                    href="/about"
                    className="hover:text-white transition-colors"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-white transition-colors"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    href="/careers"
                    className="hover:text-white transition-colors"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="/press"
                    className="hover:text-white transition-colors"
                  >
                    Press Kit
                  </Link>
                </li>
                <li>
                  <Link
                    href="/partners"
                    className="hover:text-white transition-colors"
                  >
                    Partners
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400">
                <Link
                  href="/privacy"
                  className="hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/terms"
                  className="hover:text-white transition-colors"
                >
                  Terms of Service
                </Link>
                <Link
                  href="/cookies"
                  className="hover:text-white transition-colors"
                >
                  Cookie Policy
                </Link>
                <Link
                  href="/gdpr"
                  className="hover:text-white transition-colors"
                >
                  GDPR
                </Link>
                <Link
                  href="/can-spam"
                  className="hover:text-white transition-colors"
                >
                  CAN-SPAM
                </Link>
                <Link
                  href="/security"
                  className="hover:text-white transition-colors"
                >
                  Security
                </Link>
              </div>
              <div className="text-sm text-gray-400">
                &copy; 2025 LoopLetter. All rights reserved.
              </div>
            </div>

            {/* Compliance Notice */}
            <div className="mt-6 pt-6 border-t border-gray-800">
              <p className="text-xs text-gray-500 text-center max-w-4xl mx-auto">
                LoopLetter is committed to protecting your privacy and ensuring
                compliance with email marketing regulations including CAN-SPAM
                Act, GDPR, and CCPA. We provide tools to help artists maintain
                compliant email practices and respect subscriber preferences.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
