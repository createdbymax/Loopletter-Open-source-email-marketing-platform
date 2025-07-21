"use client";

import { useState } from "react";
import { Artist } from "@/lib/types";
import { Mail, CheckCircle, Loader2, Music, Heart, Star } from "lucide-react";

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
      <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {replaceArtistName(mergedSettings.success_message.title)}
        </h2>
        <p className="text-gray-600 mb-6">
          {replaceArtistName(mergedSettings.success_message.message)}
        </p>
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-sm text-gray-500">
            Check your email for a welcome message from {artist.name}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div
        className="p-8 text-white text-center"
        style={{
          background: mergedSettings.colors.primary
            ? `linear-gradient(135deg, ${mergedSettings.colors.primary}, ${mergedSettings.colors.secondary || mergedSettings.colors.primary})`
            : "linear-gradient(135deg, #3b82f6, #1d4ed8)",
        }}
      >
        {mergedSettings.header.show_artist_image &&
        mergedSettings.header.artist_image_url ? (
          <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 border-4 border-white/20">
            <img
              src={mergedSettings.header.artist_image_url}
              alt={artist.name}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Music className="w-10 h-10" />
          </div>
        )}
        <h1 className="text-3xl font-bold mb-2">
          {replaceArtistName(mergedSettings.header.title)}
        </h1>
        <p className="text-white/90">
          {replaceArtistName(mergedSettings.header.subtitle)}
        </p>

        {/* Social Links */}
        {mergedSettings.header.show_social_links &&
          artist.settings?.social_links && (
            <div className="flex justify-center gap-4 mt-6">
              {artist.settings.social_links.spotify && (
                <a
                  href={artist.settings.social_links.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  🎵 Spotify
                </a>
              )}
              {artist.settings.social_links.instagram && (
                <a
                  href={`https://instagram.com/${artist.settings.social_links.instagram.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  📸 Instagram
                </a>
              )}
              {artist.settings.social_links.website && (
                <a
                  href={artist.settings.social_links.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  🌐 Website
                </a>
              )}
            </div>
          )}
      </div>

      {/* Form */}
      <div className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all"
                onFocus={(e) => {
                  e.target.style.borderColor =
                    artist.settings?.brand_colors?.primary || "#8b5cf6";
                  e.target.style.boxShadow = `0 0 0 3px ${artist.settings?.brand_colors?.primary || "#8b5cf6"}20`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#d1d5db";
                  e.target.style.boxShadow = "none";
                }}
                placeholder={mergedSettings.form.placeholder_email}
              />
            </div>
          </div>

          {mergedSettings.form.show_name_field && (
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                First Name (optional)
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:border-transparent outline-none transition-all"
                placeholder={mergedSettings.form.placeholder_name}
                onFocus={(e) => {
                  e.target.style.borderColor =
                    mergedSettings.colors.primary || "#8b5cf6";
                  e.target.style.boxShadow = `0 0 0 3px ${mergedSettings.colors.primary || "#8b5cf6"}20`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#d1d5db";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !email}
            className="w-full text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: mergedSettings.colors.primary
                ? `linear-gradient(135deg, ${mergedSettings.colors.primary}, ${mergedSettings.colors.secondary || mergedSettings.colors.primary})`
                : "linear-gradient(135deg, #8b5cf6, #3b82f6)",
              filter: isLoading || !email ? "brightness(0.7)" : "brightness(1)",
            }}
            onMouseEnter={(e) => {
              if (!isLoading && email) {
                e.currentTarget.style.filter = "brightness(1.1)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading && email) {
                e.currentTarget.style.filter = "brightness(1)";
              }
            }}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Joining...
              </>
            ) : (
              <>
                <Heart className="w-5 h-5" />
                {mergedSettings.form.button_text}
              </>
            )}
          </button>
        </form>

        {/* Benefits */}
        {mergedSettings.benefits.show_benefits && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              What you&apos;ll get:
            </h3>
            <div className="space-y-3">
              {mergedSettings.benefits.custom_benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </div>
    </div>
  );
}
