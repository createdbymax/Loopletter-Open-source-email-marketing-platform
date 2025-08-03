"use client";

import { useState } from "react";
import { Artist } from "@/lib/types";
import { Check, ArrowRight, Zap, Music, Heart } from "lucide-react";

interface SubscriptionFormProps {
  artist: Artist;
}

// Default settings if none are saved
const DEFAULT_SETTINGS = {
  theme: "gradient",
  colors: {
    primary: "#3b82f6",
    secondary: "#1d4ed8",
    accent: "#8b5cf6",
  },
  layout: "default",
  header: {
    title: "Join {artist_name}'s Inner Circle",
    subtitle:
      "Get exclusive updates, early access to new music, and personal messages",
    show_social_links: true,
    show_artist_image: false,
    artist_image_url: null,
  },
  form: {
    button_text: "Join the Family",
    button_style: "gradient",
    show_name_field: true,
    placeholder_email: "your@email.com",
    placeholder_name: "Your first name",
  },
  benefits: {
    show_benefits: true,
    custom_benefits: [
      "Early access to new releases",
      "Exclusive behind-the-scenes content",
      "Personal updates and stories",
      "Tour announcements and presale access",
    ],
  },
  success_message: {
    title: "Welcome to the family! 🎉",
    message:
      "You're now part of {artist_name}'s inner circle. Get ready for exclusive content, early access to new music, and behind-the-scenes updates.",
  },
};

export default function SubscriptionForm({ artist }: SubscriptionFormProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  // Get customization settings from artist data or use defaults
  const settings =
    artist.settings?.subscription_page_settings || DEFAULT_SETTINGS;

  // Make sure all required settings are present by merging with defaults
  const mergedSettings = {
    ...DEFAULT_SETTINGS,
    ...settings,
    colors: {
      ...DEFAULT_SETTINGS.colors,
      ...(settings?.colors || {}),
    },
    header: {
      ...DEFAULT_SETTINGS.header,
      ...(settings?.header || {}),
    },
    form: {
      ...DEFAULT_SETTINGS.form,
      ...(settings?.form || {}),
    },
    benefits: {
      ...DEFAULT_SETTINGS.benefits,
      custom_benefits:
        settings?.benefits?.custom_benefits ||
        DEFAULT_SETTINGS.benefits.custom_benefits,
    },
    success_message: {
      ...DEFAULT_SETTINGS.success_message,
      ...(settings?.success_message || {}),
    },
  };

  // Replace placeholders in text with artist name
  const replaceArtistName = (text: string) => {
    return text.replace("{artist_name}", artist.name);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          name: name || undefined,
          artist_slug: artist.slug,
          source: "subscription_page",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to subscribe");
      }

      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-md w-full text-center relative z-10">
        {/* Background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        
        <div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/25">
          <Check className="w-10 h-10 text-white" />
        </div>
        
        <h2 className="text-3xl font-light text-white mb-4">
          {replaceArtistName(mergedSettings.success_message.title)}
        </h2>
        
        <p className="text-gray-400 mb-10 leading-relaxed text-lg">
          {replaceArtistName(mergedSettings.success_message.message)}
        </p>
        
        <div className="space-y-4">
          {mergedSettings.benefits.custom_benefits.slice(0, 3).map((benefit, index) => (
            <div key={index} className="flex items-center justify-center gap-4 text-gray-300">
              <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"></div>
              <span className="text-sm">{benefit}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg w-full">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-6">
          <Zap className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-blue-300 font-medium">Exclusive Access</span>
        </div>
        
        <h1 className="text-5xl font-light text-white mb-4 tracking-tight">
          Join {artist.name}'s
          <span className="block bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Inner Circle
          </span>
        </h1>
        
        <p className="text-xl text-gray-400 leading-relaxed max-w-md mx-auto">
          {replaceArtistName(mergedSettings.header.subtitle)}
        </p>

        {/* Social Links */}
        {mergedSettings.header.show_social_links &&
          artist.settings?.social_links && (
            <div className="flex justify-center gap-6 mt-8">
              {artist.settings.social_links.spotify && (
                <a
                  href={artist.settings.social_links.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    >
                <path d="M28.3411,3.813c-13.5932,0-24.613,11.019-24.613,24.6122s11.0198,24.6129,24.613,24.6129  c13.5936,0,24.6133-11.0197,24.6133-24.6129S41.9346,3.813,28.3411,3.813z M38.3264,40.0396c-0.3979,0-0.6699-0.138-1.0418-0.3646  c-3.5675-2.158-8.015-3.2921-12.7356-3.2921c-2.6336,0-5.2842,0.3374-7.7634,0.8533c-0.403,0.0876-0.9103,0.2436-1.2132,0.2436  c-0.9347,0-1.558-0.7431-1.558-1.5468c0-1.0348,0.5966-1.549,1.3389-1.691c3.04-0.6927,6.0676-1.0883,9.2123-1.0883  c5.3857,0,10.1859,1.2357,14.3165,3.7111c0.6147,0.3591,0.975,0.7253,0.975,1.6359C39.8572,39.388,39.1359,40.0396,38.3264,40.0396z   M41.0084,33.5251c-0.5341,0-0.8704-0.2156-1.233-0.4266c-4.0038-2.376-9.5529-3.9546-15.6295-3.9546  c-3.1168,0-5.8066,0.436-8.0333,1.0294c-0.4798,0.1318-0.749,0.2738-1.1977,0.2738c-1.0585,0-1.9226-0.8626-1.9226-1.9296  c0-1.0465,0.5073-1.7671,1.5309-2.0557c2.767-0.7598,5.5921-1.3459,9.7045-1.3459c6.4427,0,12.6751,1.6046,17.5749,4.5368  c0.8215,0.4716,1.124,1.0689,1.124,1.9454C42.9268,32.6641,42.0781,33.5251,41.0084,33.5251z M44.062,25.9488  c-0.5011,0-0.7986-0.1218-1.2683-0.379c-4.4549-2.6711-11.3684-4.1423-18.0547-4.1423c-3.3375,0-6.7274,0.3394-9.8325,1.1818  c-0.3576,0.09-0.8094,0.2692-1.2621,0.2692c-1.3129,0-2.3201-1.0386-2.3201-2.3515c0-1.3378,0.8289-2.0886,1.7232-2.3528  c3.5085-1.0336,7.4247-1.5153,11.6823-1.5153c7.2273,0,14.8312,1.4866,20.3857,4.7489c0.7485,0.424,1.2683,1.0635,1.2683,2.2352  C46.3837,24.9846,45.3051,25.9488,44.062,25.9488z"/>
                </svg>
                </a>
              )}
              {artist.settings.social_links.instagram && (
                <a
                  href={`https://instagram.com/${artist.settings.social_links.instagram.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-400 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              )}
              {artist.settings.social_links.website && (
                <a
                  href={artist.settings.social_links.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-400 transition-colors text-sm"
                >
                  🌐 Website
                </a>
              )}
            </div>
          )}
      </div>

      {/* Form Card */}
      <div className="bg-gray-900/50 border-gray-800/50 backdrop-blur-xl shadow-2xl rounded-xl">
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {mergedSettings.form.show_name_field && (
              <div className="space-y-3">
                <label htmlFor="name" className="text-sm font-medium text-gray-300">
                  First Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={mergedSettings.form.placeholder_name}
                  className="h-14 w-full bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-500 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/25 rounded-xl px-4 outline-none transition-all"
                />
              </div>
            )}

            <div className="space-y-3">
              <label htmlFor="email" className="text-sm font-medium text-gray-300">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={mergedSettings.form.placeholder_email}
                required
                className="h-14 w-full bg-gray-800/50 border-gray-700/50 text-white placeholder:text-gray-500 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/25 rounded-xl px-4 outline-none transition-all border"
              />
            </div>

            {error && (
              <div className="bg-red-900/50 border border-red-700/50 rounded-xl p-4">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !email}
              className="w-full h-14 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center gap-3 justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Connecting...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3 justify-center">
                  <span>{mergedSettings.form.button_text}</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </button>
          </form>

          {/* Features */}
          {mergedSettings.benefits.show_benefits && (
            <div className="mt-8 pt-8 border-t border-gray-800/50">
              <div className="grid gap-6">
                {mergedSettings.benefits.custom_benefits.slice(0, 3).map((benefit, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/20 flex items-center justify-center mt-1">
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-medium text-white text-sm mb-1">
                        {benefit.split(' ').slice(0, 2).join(' ')}
                      </h4>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        {benefit}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-800/30">
            <p className="text-xs text-gray-500 text-center leading-relaxed">
              Secure and private. Unsubscribe anytime.
              <br />
<a href="https://loopletter.co" target="_blank" rel="noopener noreferrer" className="hover:text-gray-400 transition-colors">Loopletter</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
