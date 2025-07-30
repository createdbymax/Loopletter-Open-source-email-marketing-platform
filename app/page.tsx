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
  "Loopletter - Own Your Audience. Transform Your Career.",
  "Stop chasing algorithms. Start building a fanbase that actually belongs to you. The email platform that turns streams into sold-out shows.",
  "/",
  [
    "music marketing",
    "artist fanbase",
    "email marketing for musicians",
    "independent artist growth",
    "fan engagement",
    "music career growth",
    "artist audience building",
  ]
);

import {
  Mail,
  Users,
  ArrowRight,
  Music,
  Send,
  CheckCircle,
  Star,
  BarChart3,
  Zap,
  Target,
  Shield,
  Sparkles,
  Headphones,
  Mic,
  Eye,
} from "lucide-react";
import { ThemeToggleSimple } from "@/components/ui/theme-toggle";
import { HomePageWrapper } from "@/components/home-page-wrapper";

export default function Home() {
  return (
    <HomePageWrapper>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            // Prevent SSR execution
            if (typeof window === 'undefined') return;
            
            // Wait for full page load and React hydration
            window.addEventListener('load', function() {
              // Additional delay to ensure React hydration is complete
              setTimeout(function() {
              // Particle System
              function createParticleSystem() {
                if (typeof window === 'undefined' || typeof document === 'undefined') return;
                const canvas = document.getElementById('particle-canvas');
                if (!canvas) return;
                
                const particles = [];
                const particleCount = 50;
                
                for (let i = 0; i < particleCount; i++) {
                  const particle = document.createElement('div');
                  particle.className = 'absolute w-1 h-1 bg-blue-400 rounded-full opacity-20';
                  particle.style.left = Math.random() * 100 + '%';
                  particle.style.top = Math.random() * 100 + '%';
                  particle.style.animationDelay = Math.random() * 5 + 's';
                  particle.style.animation = 'float-particle 10s linear infinite';
                  canvas.appendChild(particle);
                  particles.push(particle);
                }
                
                // Mouse interaction with particles
                canvas.addEventListener('mousemove', (e) => {
                  const rect = canvas.getBoundingClientRect();
                  const mouseX = e.clientX - rect.left;
                  const mouseY = e.clientY - rect.top;
                  
                  particles.forEach(particle => {
                    const particleRect = particle.getBoundingClientRect();
                    const particleX = particleRect.left - rect.left;
                    const particleY = particleRect.top - rect.top;
                    
                    const distance = Math.sqrt(
                      Math.pow(mouseX - particleX, 2) + Math.pow(mouseY - particleY, 2)
                    );
                    
                    if (distance < 100) {
                      const force = (100 - distance) / 100;
                      const angle = Math.atan2(particleY - mouseY, particleX - mouseX);
                      const moveX = Math.cos(angle) * force * 20;
                      const moveY = Math.sin(angle) * force * 20;
                      
                      particle.style.transform = 'translate(' + moveX + 'px, ' + moveY + 'px)';
                      particle.style.opacity = 0.8;
                    } else {
                      particle.style.transform = 'translate(0, 0)';
                      particle.style.opacity = 0.2;
                    }
                  });
                });
              }
              
              // Magnetic Cursor Effect
              function initMagneticCursor() {
                if (typeof window === 'undefined' || typeof document === 'undefined') return;
                const magneticElements = document.querySelectorAll('.magnetic-element
                
                magneticElements.forEach(element => {
                  element.addEventListener('mousemove', (e) => {
                    const rect = element.getBoundingClientRect();
                    const x = e.clientX - rect.left - rect.width / 2;
                    const y = e.clientY - rect.top - rect.height / 2;
                    
                    element.style.transform = 'translate(' + x * 0.1 + 'px, ' + y * 0.1 + 'px)';
                  });
                  
                  element.addEventListener('mouseleave', () => {
                    element.style.transform = 'translate(0, 0)';
                  });
                });
              }
              
              // Initialize effects
              createParticleSystem();
              initMagneticCursor();
              
              // Navbar scroll animation
              function initNavbarScrollAnimation() {
                // Double-check we're on client side
                if (typeof window === 'undefined' || typeof document === 'undefined') return;
                
                const navbarContainer = document.getElementById('navbar-container');
                const navbar = document.getElementById('navbar');
                
                // Ensure elements exist before proceeding
                if (!navbarContainer || !navbar) {
                  console.warn('Navbar elements not found, retrying...');
                  setTimeout(initNavbarScrollAnimation, 200);
                  return;
                }
                
                function handleScroll() {
                  const scrollY = window.scrollY;
                  const maxScroll = 100; // Distance over which to animate
                  const progress = Math.min(scrollY / maxScroll, 1); // 0 to 1
                  
                  // Smooth interpolation function
                  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
                  const smoothProgress = easeOut(progress);
                  
                  // Interpolate values
                  const topValue = 16 * (1 - smoothProgress); // 16px to 0px (1rem to 0)
                  const borderRadius = 16 * (1 - smoothProgress); // 16px to 0px (1rem to 0)
                  const containerPadding = window.innerWidth >= 1024 ? 48 * (1 - smoothProgress) : 24 * (1 - smoothProgress); // 3rem/1.5rem to 0
                  const maxWidth = 72 + (100 - 72) * smoothProgress; // 72rem to 100% (represented as large number)
                  
                  // Apply smooth transitions
                  navbarContainer.style.top = topValue + 'px';
                  navbarContainer.style.paddingLeft = containerPadding + 'px';
                  navbarContainer.style.paddingRight = containerPadding + 'px';
                  
                  if (smoothProgress > 0.9) {
                    navbar.style.maxWidth = 'none';
                    navbar.style.marginLeft = '0';
                    navbar.style.marginRight = '0';
                  } else {
                    navbar.style.maxWidth = '72rem';
                    navbar.style.marginLeft = 'auto';
                    navbar.style.marginRight = 'auto';
                  }
                  
                  navbar.style.borderRadius = borderRadius + 'px';
                  
                  // Adjust internal padding smoothly
                  const isLargeScreen = window.innerWidth >= 1024;
                  const basePadding = 24; // 1.5rem
                  const largePadding = isLargeScreen ? 48 : 24; // 3rem or 1.5rem
                  const currentPadding = basePadding + (largePadding - basePadding) * smoothProgress;
                  
                  navbar.style.paddingLeft = currentPadding + 'px';
                  navbar.style.paddingRight = currentPadding + 'px';
                }
                
                // Add scroll listener with throttling
                let ticking = false;
                window.addEventListener('scroll', () => {
                  if (!ticking) {
                    requestAnimationFrame(() => {
                      handleScroll();
                      ticking = false;
                    });
                    ticking = true;
                  }
                });
                
                // Initial check
                handleScroll();
              }
              
              // Wait for React hydration to complete before initializing navbar animation
              if (typeof window !== 'undefined' && typeof document !== 'undefined') {
                // Use a longer timeout to ensure React hydration is complete
                setTimeout(() => {
                  initNavbarScrollAnimation();
                }, 100);
              }
              
              // Add custom styles for navbar animation
              const style = document.createElement('style');
              style.textContent = \`
                @media (min-width: 1024px) {
                  #navbar-container {
                    padding-left: 3rem;
                    padding-right: 3rem;
                  }
                }
              \`;
              document.head.appendChild(style);
              
              // Liquid Glass Interactive Effect
              const cards = document.querySelectorAll('.liquid-glass-card');
              
              cards.forEach(card => {
                const liquidLight = card.querySelector('.liquid-light');
                
                card.addEventListener('mousemove', (e) => {
                  const rect = card.getBoundingClientRect();
                  const x = ((e.clientX - rect.left) / rect.width) * 100;
                  const y = ((e.clientY - rect.top) / rect.height) * 100;
                  
                  card.style.setProperty('--mouse-x', x + '%');
                  card.style.setProperty('--mouse-y', y + '%');
                });
                
                card.addEventListener('mouseleave', () => {
                  card.style.setProperty('--mouse-x', '50%');
                  card.style.setProperty('--mouse-y', '50%');
                });
                
                // Ripple effect on click
                card.addEventListener('click', (e) => {
                  const rect = card.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  
                  card.style.setProperty('--ripple-x', x + 'px');
                  card.style.setProperty('--ripple-y', y + 'px');
                  
                  card.classList.remove('ripple-active');
                  void card.offsetWidth; // Trigger reflow
                  card.classList.add('ripple-active');
                  
                  setTimeout(() => {
                    card.classList.remove('ripple-active');
                  }, 600);
                });
              });
              
              // Enhanced inter-card lighting effect
              const container = document.getElementById('liquid-glass-container');
              if (container) {
                container.addEventListener('mousemove', (e) => {
                  cards.forEach(card => {
                    const rect = card.getBoundingClientRect();
                    const containerRect = container.getBoundingClientRect();
                    
                    const cardCenterX = rect.left + rect.width / 2;
                    const cardCenterY = rect.top + rect.height / 2;
                    
                    const distance = Math.sqrt(
                      Math.pow(e.clientX - cardCenterX, 2) + 
                      Math.pow(e.clientY - cardCenterY, 2)
                    );
                    
                    const maxDistance = 300;
                    const influence = Math.max(0, 1 - distance / maxDistance);
                    
                    if (influence > 0) {
                      const relativeX = ((e.clientX - rect.left) / rect.width) * 100;
                      const relativeY = ((e.clientY - rect.top) / rect.height) * 100;
                      
                      card.style.setProperty('--mouse-x', relativeX + '%');
                      card.style.setProperty('--mouse-y', relativeY + '%');
                      
                      const lightElement = card.querySelector('.liquid-light');
                      if (lightElement) {
                        lightElement.style.opacity = influence * 0.6;
                      }
                    }
                  });
                });
                
                container.addEventListener('mouseleave', () => {
                  cards.forEach(card => {
                    const lightElement = card.querySelector('.liquid-light');
                    if (lightElement) {
                      lightElement.style.opacity = '0';
                    }
                  });
                });
              }
              }, 1000); // Wait 1 second after page load for hydration
            });
          `,
        }}
      />
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
        {/* Navigation */}
        <div
          id="navbar-container"
          className="sticky top-4 z-50 px-6 lg:px-12 transition-all duration-700 ease-out"
        >
          <nav
            id="navbar"
            className="flex items-center justify-between px-6 py-4 bg-white/90 dark:bg-neutral-900/80 backdrop-blur-md rounded-2xl shadow-lg dark:shadow-2xl dark:shadow-blue-500/10 max-w-6xl mx-auto transition-all duration-700 ease-out"
          >
            <div className="flex items-center gap-8">
              <div className="relative group cursor-pointer">
                <Image
                  src="/newlogo.svg"
                  alt="Loopletter"
                  width={140}
                  height={36}
                  className="flex-shrink-0 dark:invert"
                />
                <Send className="absolute -bottom-1 -right-1 w-3 h-3 text-blue-500 opacity-70 transition-all duration-500 ease-in-out group-hover:opacity-100 group-hover:translate-x-2 group-hover:-translate-y-2 group-hover:rotate-12 group-hover:scale-110" />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <ThemeToggleSimple />
              <SignedOut>
                <SignInButton>
                  <button className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 font-medium transition-colors">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton>
                  <button className="bg-black hover:bg-neutral-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all dark:shadow-lg dark:shadow-blue-500/25 hover:scale-105 magnetic-element">
                    Get Started
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/dashboard"
                  className="bg-black hover:bg-neutral-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-all dark:shadow-lg dark:shadow-blue-500/25 hover:scale-105"
                >
                  Dashboard
                </Link>
                <UserButton />
              </SignedIn>
            </div>
          </nav>
        </div>

        {/* Hero Section */}
        <section className="px-6 lg:px-12 pt-20 pb-32 bg-neutral-50 dark:bg-gradient-to-br dark:from-neutral-950 dark:to-neutral-950 dark:to-blue-950 overflow-hidden relative">
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 dark:opacity-5 opacity-0">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                linear-gradient(rgba(59, 130, 246, 0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(59, 130, 246, 0.03) 1px, transparent 1px)
              `,
                backgroundSize: "80px 80px",
              }}
            ></div>
          </div>

          {/* Minimal Ambient Lighting */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/3 rounded-full blur-3xl dark:block hidden"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/3 rounded-full blur-3xl dark:block hidden"></div>
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="animate-fade-in-up">
                <div className="inline-flex items-center gap-2 bg-neutral-100 dark:bg-gradient-to-r dark:from-neutral-950 dark:to-neutral-950 dark:border dark:border-blue-500/20 text-neutral-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-8 animate-fade-in-up animation-delay-200 dark:shadow-lg dark:shadow-blue-500/10">
                  <Sparkles className="w-4 h-4 animate-pulse text-blue-500" />
                  The moment everything changes
                </div>
                <h1 className="text-5xl lg:text-6xl font-bold text-neutral-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:via-blue-100 dark:to-purple-200 mb-8 leading-tight animate-fade-in-up animation-delay-300 holographic-text">
                  <span data-text="Turn streams into">Turn streams into</span>
                  <br />
                  <span data-text="sold-out shows">sold-out shows</span>
                </h1>
                <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-8 leading-relaxed animate-fade-in-up animation-delay-400">
                  Stop chasing algorithms that don't care about your music.
                  Build a fanbase that shows up, buys tickets, and streams your
                  songs because they genuinely love what you create.
                </p>

                {/* Results Stats */}
                <div className="grid grid-cols-3 gap-6 mb-8 animate-fade-in-up animation-delay-500">
                  <div className="text-center group cursor-pointer terminal-stat">
                    <div className="text-2xl font-bold text-neutral-900 dark:text-green-500 group-hover:scale-110 transition-transform duration-200 font-mono">
                      <span className="typing-effect">3x</span>
                    </div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">
                      More ticket sales
                    </div>
                  </div>
                  <div className="text-center group cursor-pointer terminal-stat">
                    <div className="text-2xl font-bold text-neutral-900 dark:text-green-500 group-hover:scale-110 transition-transform duration-200 font-mono">
                      <span className="typing-effect">67%</span>
                    </div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">
                      Open every email
                    </div>
                  </div>
                  <div className="text-center group cursor-pointer terminal-stat">
                    <div className="text-2xl font-bold text-neutral-900 dark:text-green-500 group-hover:scale-110 transition-transform duration-200 font-mono">
                      <span
                        className="typing-effect"
                        style={{ animationDelay: "1s" }}
                      >
                        $0
                      </span>
                    </div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">
                      To start growing
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up animation-delay-600">
                  <SignedOut>
                    <SignUpButton>
                      <button className="bg-black hover:bg-neutral-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all flex items-center gap-2 shadow-sm hover:shadow-md group dark:shadow-xl dark:shadow-blue-500/25 dark:border dark:border-blue-500/20">
                        Own Your Audience. Start Today.
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </SignUpButton>
                    <button
                      data-waitlist-trigger
                      className="bg-white hover:bg-neutral-50 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-100 px-8 py-4 rounded-lg font-semibold text-lg transition-all flex items-center gap-2 shadow-sm hover:shadow-md group border border-neutral-200 dark:border-neutral-600"
                    >
                      Join Waitlist
                      <Mail className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </button>
                  </SignedOut>
                  <SignedIn>
                    <Link
                      href="/dashboard"
                      className="bg-black hover:bg-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-950 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all flex items-center gap-2 shadow-sm hover:shadow-md group dark:shadow-xl dark:shadow-blue-500/25 dark:border dark:border-blue-500/20"
                    >
                      Go to Dashboard
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </SignedIn>
                </div>
              </div>

              {/* Hero Visual - Success Story */}
              {/* Hero Visual - Real Dashboard Mockup */}
              <div className="relative animate-slide-in-right animation-delay-800">
                <div className="bg-white dark:bg-gradient-to-br dark:from-neutral-800 dark:to-neutral-900 rounded-lg border dark:border-blue-500/20 shadow-xl dark:shadow-2xl dark:shadow-blue-500/10 overflow-hidden relative">
                  {/* Tech glow effect */}
                  <div className="absolute inset-0 dark:bg-gradient-to-r dark:from-blue-500/5 dark:to-purple-500/5 dark:opacity-50"></div>
                  {/* Dashboard Header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b dark:border-neutral-700 bg-white dark:bg-neutral-800">
                    <div className="flex items-center gap-3">
                      <Image
                        src="/loopletterlogo.svg"
                        alt="Loopletter"
                        width={100}
                        height={24}
                        className="flex-shrink-0 dark:invert"
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
                      <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                        Welcome back, Luna!
                      </h2>
                      <p className="text-neutral-600 dark:text-neutral-400">
                        Here&apos;s what&apos;s happening with your email
                        marketing
                      </p>
                    </div>

                    {/* Metrics Cards */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-white dark:bg-neutral-700 p-4 rounded-lg border dark:border-neutral-600">
                        <div className="flex items-center mb-2">
                          <Mail className="w-4 h-4 text-blue-600 mr-2" />
                          <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                            Total Campaigns
                          </span>
                        </div>
                        <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                          12
                        </p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          3 drafts, 9 sent
                        </p>
                      </div>
                      <div className="bg-white dark:bg-neutral-700 p-4 rounded-lg border dark:border-neutral-600">
                        <div className="flex items-center mb-2">
                          <Users className="w-4 h-4 text-green-600 mr-2" />
                          <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                            Total Fans
                          </span>
                        </div>
                        <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                          1,247
                        </p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          Active subscribers
                        </p>
                      </div>
                    </div>

                    {/* Recent Campaign */}
                    <div className="bg-white dark:bg-neutral-700 rounded-lg border dark:border-neutral-600">
                      <div className="p-4 border-b">
                        <h3 className="font-medium">Recent Campaigns</h3>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
                            <div>
                              <h4 className="font-medium">
                                🎵 &quot;Midnight Dreams&quot; is here!
                              </h4>
                              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                Sent 2 days ago
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Sent
                            </span>
                            <button className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-600 rounded">
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Analytics Card */}
                <div className="absolute -bottom-6 -right-6 bg-white dark:bg-gradient-to-br dark:from-neutral-800 dark:to-neutral-900 rounded-lg border dark:border-blue-500/30 shadow-lg dark:shadow-xl dark:shadow-blue-500/20 p-4 max-w-xs animate-float animation-delay-1000 dark:backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center animate-pulse-glow">
                      <BarChart3 className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                        Campaign Performance
                      </div>
                      <div className="text-sm text-neutral-600 dark:text-neutral-400">
                        Last 30 days
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Open Rate
                      </span>
                      <span className="font-medium">67.2%</span>
                    </div>
                    <div className="w-full bg-neutral-200 dark:bg-neutral-600 rounded-full h-2">
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

        {/* Problem Before Loopletter */}
        <section className="px-6 lg:px-12 py-32 bg-white dark:bg-neutral-950">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl lg:text-5xl font-bold text-neutral-900 dark:text-neutral-100 mb-8">
              You're building someone else's empire
            </h2>
            <div className="text-xl text-neutral-700 dark:text-neutral-300 leading-relaxed space-y-8 mb-16">
              <p>
                Every stream, every like, every follow—you're pouring your heart
                into platforms that could change their rules tomorrow and make
                you invisible.
              </p>
              <p>
                Your biggest fans might never see your new release because an
                algorithm decided it wasn't "engaging" enough. Your tour
                announcement gets buried. Your music video reaches 12% of your
                followers.
              </p>
              <p className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
                You don't own your audience. They do.
              </p>
            </div>

            {/* Pain Points Grid */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="bg-red-50 dark:bg-red-900/10 p-8 rounded-xl border border-red-200 dark:border-red-800/30">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Target className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                  Algorithm Roulette
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Your posts reach 3% of your followers. New releases get
                  buried. Years of building an audience, wasted on algorithmic
                  whims.
                </p>
              </div>

              <div className="bg-orange-50 dark:bg-orange-900/10 p-8 rounded-xl border border-orange-200 dark:border-orange-800/30">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Shield className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                  Platform Dependency
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Account suspended? Algorithm change? Platform dies? Your
                  entire fanbase disappears overnight. No backup plan.
                </p>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/10 p-8 rounded-xl border border-yellow-200 dark:border-yellow-800/30">
                <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center mb-4 mx-auto">
                  <Zap className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                  Scattered Attention
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Your fans are distracted by endless feeds. Your important
                  announcements get lost in the noise. No direct connection.
                </p>
              </div>
            </div>

            <div className="bg-neutral-100 dark:bg-neutral-800 p-8 rounded-xl">
              <p className="text-xl text-neutral-700 dark:text-neutral-300 italic">
                "I had 50k followers but couldn't sell 100 tickets. I realized I
                was building their audience, not mine."
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-3">
                — Every independent artist's wake-up call
              </p>
            </div>
          </div>
        </section>

        {/* Transformation Section */}
        <section className="px-6 lg:px-12 py-32 bg-neutral-50 dark:bg-gradient-to-br dark:from-neutral-950 dark:to-neutral-950">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-neutral-900 dark:text-neutral-100 mb-8">
                What changes when you own your audience
              </h2>
              <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
                Email is the only channel you truly control. No algorithms. No
                middlemen. Just your voice, directly in their inbox, every
                single time.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
              <div>
                <h3 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
                  Your releases actually reach your fans
                </h3>
                <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8">
                  67% of your fans open every email. Compare that to the 3% who
                  see your social posts. When you drop new music, your true fans
                  know immediately.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-neutral-700 dark:text-neutral-300">
                      100% delivery rate to your audience
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-neutral-700 dark:text-neutral-300">
                      No algorithm deciding who sees your content
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-neutral-700 dark:text-neutral-300">
                      Direct line to your most engaged fans
                    </span>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-neutral-800 p-8 rounded-xl shadow-lg dark:shadow-2xl dark:shadow-blue-500/10">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
                    New Release Campaign
                  </h4>
                  <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-3 py-1 rounded-full text-sm">
                    Sent
                  </span>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-neutral-600 dark:text-neutral-400">
                      Delivered
                    </span>
                    <span className="font-semibold">2,847 fans</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600 dark:text-neutral-400">
                      Opened
                    </span>
                    <span className="font-semibold text-green-600">
                      1,908 (67%)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600 dark:text-neutral-400">
                      Clicked to stream
                    </span>
                    <span className="font-semibold text-blue-600">
                      743 (26%)
                    </span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between">
                      <span className="text-neutral-600 dark:text-neutral-400">
                        Result
                      </span>
                      <span className="font-semibold text-purple-600">
                        +2,100 streams in 24h
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1">
                <div className="bg-white dark:bg-neutral-800 p-8 rounded-xl shadow-lg dark:shadow-2xl dark:shadow-blue-500/10">
                  <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-6">
                    Tour Announcement Results
                  </h4>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-neutral-600 dark:text-neutral-400">
                          Email sent
                        </span>
                        <span className="text-sm text-neutral-500">Day 1</span>
                      </div>
                      <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded">
                        <span className="font-semibold text-blue-800 dark:text-blue-300">
                          847 tickets sold
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-neutral-600 dark:text-neutral-400">
                          Social media posts
                        </span>
                        <span className="text-sm text-neutral-500">
                          Day 2-7
                        </span>
                      </div>
                      <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded">
                        <span className="font-semibold text-gray-600 dark:text-gray-400">
                          23 tickets sold
                        </span>
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <div className="text-center">
                        <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                          SOLD OUT
                        </span>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                          97% from email alone
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <h3 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
                  Sell out shows before you even announce them
                </h3>
                <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8">
                  Your email list becomes your secret weapon. One message to
                  your fans sells more tickets than weeks of social media
                  promotion. They're waiting to hear from you.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-neutral-700 dark:text-neutral-300">
                      Instant ticket sales from announcement
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-neutral-700 dark:text-neutral-300">
                      Pre-sell to your most dedicated fans
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-neutral-700 dark:text-neutral-300">
                      Build demand before going public
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Results Artists Are Seeing */}
        <section className="px-6 lg:px-12 py-32 bg-white dark:bg-neutral-950">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold text-neutral-900 dark:text-neutral-100 mb-8">
                Real artists. Real results.
              </h2>
              <p className="text-xl text-neutral-600 dark:text-neutral-400">
                These aren't vanity metrics. These are career-changing outcomes.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-8 rounded-xl border border-green-200 dark:border-green-800/30">
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                    3x
                  </div>
                  <div className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                    More Ticket Sales
                  </div>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                    Artists see 3x higher conversion from email announcements vs
                    social media
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-8 rounded-xl border border-blue-200 dark:border-blue-800/30">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    67%
                  </div>
                  <div className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                    Open Rate
                  </div>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                    Average open rate across all Loopletter artists (industry
                    average: 21%)
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-8 rounded-xl border border-purple-200 dark:border-purple-800/30">
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                    $47k
                  </div>
                  <div className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
                    Average Revenue
                  </div>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                    Additional annual revenue generated by artists using email
                    marketing
                  </p>
                </div>
              </div>
            </div>

            {/* Success Stories */}
            {/* <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-neutral-50 dark:bg-neutral-800 p-8 rounded-xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <Headphones className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                      Marcus Chen
                    </div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">
                      Electronic Producer
                    </div>
                  </div>
                </div>
                <blockquote className="text-lg text-neutral-700 dark:text-neutral-300 mb-4 italic">
                  "My email list of 1,200 fans generates more revenue than my
                  45k Instagram followers. It's not even close."
                </blockquote>
                <div className="flex items-center gap-4 text-sm">
                  <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-3 py-1 rounded-full">
                    +340% revenue growth
                  </span>
                </div>
              </div>

              <div className="bg-neutral-50 dark:bg-neutral-800 p-8 rounded-xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center">
                    <Mic className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                      Sarah Williams
                    </div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">
                      Singer-Songwriter
                    </div>
                  </div>
                </div>
                <blockquote className="text-lg text-neutral-700 dark:text-neutral-300 mb-4 italic">
                  "I went from playing coffee shops to headlining festivals. My
                  email list made the difference."
                </blockquote>
                <div className="flex items-center gap-4 text-sm">
                  <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full">
                    Sold out 12-city tour
                  </span>
                </div>
              </div>
            </div> */}
          </div>
        </section>

        {/* Why Loopletter is Different */}
        <section className="px-6 lg:px-12 py-32 bg-white dark:bg-gradient-to-b dark:from-neutral-950 dark:to-neutral-950 relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl lg:text-5xl font-bold text-neutral-900 dark:text-neutral-100 mb-8">
                Why Loopletter works when everything else fails
              </h2>
              <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
                We're not another generic email tool. We're built by musicians,
                for musicians, with one goal: turn your passion into a
                sustainable career.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
              <div>
                <h3 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
                  Built for artists, not businesses
                </h3>
                <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8">
                  Every feature is designed around how musicians actually work.
                  Share new releases, announce tours, tell your story—all in
                  ways that feel authentic to your brand.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Music className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                        Music-first templates
                      </h4>
                      <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                        Designed for releases, tours, and fan updates—not
                        corporate newsletters
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Users className="w-3 h-3 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                        Fan-focused analytics
                      </h4>
                      <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                        Track engagement that matters: who's your biggest fans,
                        what content resonates
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Zap className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                        Release automation
                      </h4>
                      <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                        Automatically notify fans when you drop new music or
                        announce shows
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-8 rounded-xl border border-blue-200 dark:border-blue-800/30">
                <div className="text-center mb-6">
                  <div className="text-4xl mb-4">🎵</div>
                  <h4 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                    The Loopletter Difference
                  </h4>
                </div>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-600 dark:text-neutral-400">
                      Generic email tools
                    </span>
                    <span className="text-red-600 dark:text-red-400">
                      ❌ Complex, expensive
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600 dark:text-neutral-400">
                      Social media
                    </span>
                    <span className="text-red-600 dark:text-red-400">
                      ❌ Algorithm dependent
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600 dark:text-neutral-400">
                      Loopletter
                    </span>
                    <span className="text-green-600 dark:text-green-400">
                      ✅ Simple, direct, yours
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-8 rounded-xl border border-green-200 dark:border-green-800/30">
                  <h4 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-6">
                    What Artists Say
                  </h4>
                  <blockquote className="text-lg text-neutral-700 dark:text-neutral-300 italic mb-4">
                    "Other platforms felt like I was shouting into the void.
                    With Loopletter, I'm having real conversations with people
                    who actually care about my music."
                  </blockquote>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                      <Music className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                        Alex Rivera
                      </div>
                      <div className="text-sm text-neutral-600 dark:text-neutral-400">
                        Indie Rock Artist
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <h3 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
                  Your success is our only metric
                </h3>
                <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8">
                  We don't make money unless you succeed. No hidden fees, no
                  feature gates that hurt your growth. When your fanbase grows,
                  we grow together.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-neutral-700 dark:text-neutral-300">
                      Free forever for up to 1,000 fans
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-neutral-700 dark:text-neutral-300">
                      No contracts or long-term commitments
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-neutral-700 dark:text-neutral-300">
                      Export your list anytime—it's yours
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Pricing Section */}
        <section
          id="pricing"
          className="px-6 lg:px-12 py-28 bg-gradient-to-b from-white to-gray-50 dark:from-neutral-950 dark:to-neutral-950"
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-neutral-100 leading-tight">
                The investment that pays for itself
                <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-neutral-100 dark:to-neutral-400">
                  in one show
                </span>
              </h2>
              <p className="text-lg text-gray-600 dark:text-neutral-400 mt-6 max-w-3xl mx-auto">
                Artists using Loopletter see an average of $47k additional
                revenue per year. One sold-out show pays for years of email
                marketing.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
              {/* STARTER PLAN */}
              <div className="rounded-2xl p-8 shadow-md border bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700 hover:shadow-xl flex flex-col justify-between transition-all duration-300">
                <div className="text-center mb-8">
                  <div className="text-4xl mb-4">🔓</div>
                  <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-neutral-100">
                    Starter
                  </h3>
                  <p className="text-xl font-semibold text-gray-900 dark:text-neutral-100">
                    $0<span className="text-base font-normal ml-1">/month</span>
                  </p>
                  <p className="mt-2 text-sm opacity-70 text-gray-600 dark:text-neutral-400">
                    Perfect for new artists and hobbyists
                  </p>
                </div>
                <ul className="space-y-3 text-sm mb-8 text-gray-700 dark:text-neutral-300">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    1,000 fan limit
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    3,000 emails/month
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Manual campaigns
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Hosted signup page
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Welcome auto-responder
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Basic analytics
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Fan tagging
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Loopletter branding
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Community support
                  </li>
                </ul>
                <div className="mt-auto">
                  <SignedOut>
                    <SignUpButton>
                      <button className="w-full py-3 rounded-lg bg-gray-900 dark:bg-white dark:text-black text-white font-medium hover:bg-black dark:hover:bg-neutral-200 transition">
                        Start Free Forever
                      </button>
                    </SignUpButton>
                  </SignedOut>
                  <SignedIn>
                    <Link
                      href="/dashboard"
                      className="block text-center py-3 rounded-lg bg-gray-900 dark:bg-white dark:text-black text-white font-medium hover:bg-black dark:hover:bg-neutral-200 transition"
                    >
                      Go to Dashboard
                    </Link>
                  </SignedIn>
                </div>
              </div>

              {/* INDEPENDENT PLAN */}
              <div className="rounded-2xl p-8 shadow-xl border text-white bg-gradient-to-br from-gray-900 to-black dark:from-neutral-950 dark:to-neutral-950 border-transparent scale-105 relative flex flex-col justify-between dark:shadow-2xl dark:shadow-blue-500/20 dark:border dark:border-blue-500/30">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="px-4 py-1 text-xs rounded-full font-medium shadow-sm bg-blue-600 dark:bg-blue-600 text-white dark:shadow-lg dark:shadow-blue-500/25">
                    Most Popular
                  </span>
                </div>
                <div className="text-center mb-8">
                  <div className="text-4xl mb-4">🚀</div>
                  <h3 className="text-2xl font-bold mb-2">Independent</h3>
                  <p className="text-5xl font-semibold">
                    $29
                    <span className="text-base font-normal ml-2 text-gray-300">
                      /month
                    </span>
                  </p>
                  <p className="mt-2 text-sm text-gray-300">
                    Ideal for growing artists and indie labels
                  </p>
                </div>
                <ul className="space-y-3 text-sm mb-8">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-400" />
                    10,000 fan limit
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-400" />
                    Email scheduling
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-400" />
                    Advanced analytics
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-400" />
                    Segmentation
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-400" />
                    Unlimited automations
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-400" />
                    Remove branding
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-400" />
                    Custom signup domain
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-400" />
                    Custom email design
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-400" />
                    Premium support
                  </li>
                </ul>
                <Link
                  href="/dashboard"
                  className="block text-center py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition shadow hover:shadow-lg"
                >
                  Start 14-Day Free Trial
                </Link>
              </div>

              {/* LABEL/AGENCY PLAN */}
              <div className="rounded-2xl p-8 shadow-md border bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700 hover:shadow-xl flex flex-col justify-between transition-all duration-300">
                <div className="text-center mb-8">
                  <div className="text-4xl mb-4">👥</div>
                  <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-neutral-100">
                    Label/Agency
                  </h3>
                  <p className="text-xl font-semibold text-gray-900 dark:text-neutral-100">
                    $99
                    <span className="text-base font-normal ml-1">/month</span>
                  </p>
                  <p className="mt-2 text-sm opacity-70 text-gray-600 dark:text-neutral-400">
                    Built for teams managing multiple artists
                  </p>
                </div>
                <ul className="space-y-3 text-sm mb-8 text-gray-700 dark:text-neutral-300">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    50,000 fan limit
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    Manage multiple artists
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    Multi-user access
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    White-labeling
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    Priority support
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    Onboarding help
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    Monetization tools
                  </li>
                </ul>
                <a
                  href="#contact"
                  className="block text-center py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
                >
                  Contact for Team Plan
                </a>
              </div>
            </div>

            <div className="text-center mt-24">
              <h4 className="text-2xl font-bold text-gray-900 dark:text-neutral-100 mb-4">
                Optional Add-ons
              </h4>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                {[
                  "Extra user seats & monetization tools",
                  "SMS campaigns ($10/month)",
                  "API/Zapier integrations",
                ].map((item) => (
                  <div
                    key={item}
                    className="bg-white dark:bg-neutral-800 p-6 rounded-xl border border-gray-200 dark:border-neutral-700 shadow-sm hover:shadow-md transition"
                  >
                    <CheckCircle className="w-5 h-5 text-blue-600 mb-2" />
                    <p className="text-gray-700 dark:text-neutral-300 text-sm text-center">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
              <button className="mt-8 px-6 py-3 bg-gray-900 dark:bg-white dark:text-black text-white rounded-lg font-medium hover:bg-black dark:hover:bg-neutral-200 transition inline-flex items-center gap-2">
                Contact us for custom pricing <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="px-6 py-32 bg-neutral-100 dark:bg-neutral-950 text-black dark:text-white">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-5xl lg:text-6xl font-bold mb-8 text-gray-900 dark:text-neutral-100">
              Own your audience. Start today.
            </h2>
            <p className="text-xl lg:text-2xl mb-12 text-gray-600 dark:text-neutral-400 max-w-3xl mx-auto">
              Stop building someone else's empire. Your fans are waiting to hear
              from you directly. This is the moment everything changes.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
              <SignedOut>
                <SignUpButton>
                  <button className="bg-black dark:bg-blue-600 text-white hover:bg-gray-800 dark:hover:bg-blue-700 px-10 py-5 rounded-lg font-bold text-xl transition-all shadow-lg hover:shadow-xl dark:shadow-2xl dark:shadow-blue-500/25 dark:border dark:border-blue-500/20">
                    Start Free Forever
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/dashboard"
                  className="bg-black dark:bg-gradient-to-r dark:from-neutral-600 dark:to-neutral-600 text-white hover:bg-gray-800 px-10 py-5 rounded-lg font-bold text-xl transition-all shadow-lg hover:shadow-xl inline-block dark:shadow-2xl dark:shadow-blue-500/25 dark:border dark:border-blue-500/20"
                >
                  Go to Dashboard
                </Link>
              </SignedIn>
              <div className="text-gray-600 dark:text-neutral-400">
                <div className="text-sm">✨ No credit card required</div>
                <div className="text-sm">🚀 Setup in under 5 minutes</div>
              </div>
            </div>

            {/* Final Stats */}
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div className="bg-white dark:bg-neutral-700 shadow-sm rounded-lg p-6 border border-gray-200 dark:border-neutral-600">
                <div className="text-3xl font-bold mb-2 text-gray-900 dark:text-neutral-100">
                  5,000+
                </div>
                <div className="text-gray-600 dark:text-neutral-400">
                  Artists Trust Us
                </div>
              </div>
              <div className="bg-white dark:bg-neutral-700 shadow-sm rounded-lg p-6 border border-gray-200 dark:border-neutral-600">
                <div className="text-3xl font-bold mb-2 text-gray-900 dark:text-neutral-100">
                  2M+
                </div>
                <div className="text-gray-600 dark:text-neutral-400">
                  Fan Connections
                </div>
              </div>
              <div className="bg-white dark:bg-neutral-700 shadow-sm rounded-lg p-6 border border-gray-200 dark:border-neutral-600">
                <div className="text-3xl font-bold mb-2 text-gray-900 dark:text-neutral-100">
                  65%
                </div>
                <div className="text-gray-600 dark:text-neutral-400">
                  Avg Open Rate
                </div>
              </div>
              <div className="bg-white dark:bg-neutral-700 shadow-sm rounded-lg p-6 border border-gray-200 dark:border-neutral-600">
                <div className="text-3xl font-bold mb-2 text-gray-900 dark:text-neutral-100">
                  Free
                </div>
                <div className="text-gray-600 dark:text-neutral-400">
                  Up to 500 Fans
                </div>
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
                  alt="Loopletter"
                  width={140}
                  height={36}
                  className="mb-4 invert"
                />
                <p className="text-gray-400 mb-6 max-w-sm">
                  Email marketing built specifically for independent artists.
                  Own your fanbase, grow your career.
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
                  &copy; 2025 Loopletter. All rights reserved.
                </div>
              </div>

              {/* Compliance Notice */}
              <div className="mt-6 pt-6 border-t border-gray-800">
                <p className="text-xs text-gray-500 text-center max-w-4xl mx-auto">
                  Loopletter is committed to protecting your privacy and
                  ensuring compliance with email marketing regulations including
                  CAN-SPAM Act, GDPR, and CCPA. We provide tools to help artists
                  maintain compliant email practices and respect subscriber
                  preferences.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </HomePageWrapper>
  );
}
