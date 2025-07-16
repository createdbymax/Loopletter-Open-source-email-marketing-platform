'use client';

import { useState } from 'react';
import { Artist } from '@/lib/types';
import { 
  Palette, 
  Type, 
  Layout, 
  Image as ImageIcon,
  Settings,
  Eye,
  Save,
  RotateCcw,
  Sparkles,
  Heart,
  Star,
  Music,
  Users,
  Zap
} from 'lucide-react';

interface PageCustomizerProps {
  artist: Artist;
  onSave: (settings: any) => void;
}

// Predefined themes and styles
const THEMES = {
  gradient: {
    name: 'Gradient',
    preview: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    colors: { primary: '#3b82f6', secondary: '#1d4ed8', accent: '#8b5cf6' }
  },
  solid: {
    name: 'Solid',
    preview: '#1f2937',
    colors: { primary: '#1f2937', secondary: '#374151', accent: '#6b7280' }
  },
  vibrant: {
    name: 'Vibrant',
    preview: 'linear-gradient(135deg, #ec4899, #f59e0b)',
    colors: { primary: '#ec4899', secondary: '#f59e0b', accent: '#8b5cf6' }
  },
  purple: {
    name: 'Purple',
    preview: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
    colors: { primary: '#8b5cf6', secondary: '#3b82f6', accent: '#ec4899' }
  },
  green: {
    name: 'Green',
    preview: 'linear-gradient(135deg, #10b981, #059669)',
    colors: { primary: '#10b981', secondary: '#059669', accent: '#3b82f6' }
  },
  orange: {
    name: 'Orange',
    preview: 'linear-gradient(135deg, #f59e0b, #d97706)',
    colors: { primary: '#f59e0b', secondary: '#d97706', accent: '#ec4899' }
  },
  red: {
    name: 'Red',
    preview: 'linear-gradient(135deg, #ef4444, #dc2626)',
    colors: { primary: '#ef4444', secondary: '#dc2626', accent: '#8b5cf6' }
  },
  teal: {
    name: 'Teal',
    preview: 'linear-gradient(135deg, #14b8a6, #0d9488)',
    colors: { primary: '#14b8a6', secondary: '#0d9488', accent: '#3b82f6' }
  },
  pink: {
    name: 'Pink',
    preview: 'linear-gradient(135deg, #ec4899, #be185d)',
    colors: { primary: '#ec4899', secondary: '#be185d', accent: '#8b5cf6' }
  },
  dark: {
    name: 'Dark',
    preview: 'linear-gradient(135deg, #1f2937, #111827)',
    colors: { primary: '#1f2937', secondary: '#111827', accent: '#3b82f6' }
  }
};

const LAYOUTS = {
  default: { name: 'Default', description: 'Classic centered layout' },
  minimal: { name: 'Minimal', description: 'Clean and simple' },
  full: { name: 'Full Width', description: 'Edge-to-edge design' },
  card: { name: 'Card', description: 'Floating card style' }
};

const BUTTON_STYLES = {
  gradient: { name: 'Gradient', preview: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' },
  solid: { name: 'Solid', preview: '#3b82f6' },
  outline: { name: 'Outline', preview: 'transparent' },
  rounded: { name: 'Rounded', preview: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }
};

const HEADER_TITLES = [
  "Join {artist_name}'s Inner Circle",
  "Join {artist_name}'s Family",
  "Subscribe to {artist_name}",
  "Get VIP Access",
  "Join the Movement",
  "Stay Connected",
  "Join My List",
  "Get Exclusive Updates",
  "Be Part of the Journey",
  "Join the Community"
];

const BUTTON_TEXTS = [
  "Join the Family",
  "Subscribe Now",
  "Get VIP Access",
  "Join Now",
  "Count Me In",
  "Sign Me Up",
  "Let's Go",
  "I'm In",
  "Subscribe",
  "Join the Movement"
];

const DEFAULT_BENEFITS = [
  "Early access to new releases",
  "Exclusive behind-the-scenes content",
  "Personal updates and stories", 
  "Tour announcements and presale access",
  "Monthly voice messages",
  "Studio session videos",
  "Exclusive merchandise drops",
  "Live stream notifications",
  "Fan-only contests and giveaways",
  "Direct messages from the artist"
];

export default function PageCustomizer({ artist, onSave }: PageCustomizerProps) {
  const [activeTab, setActiveTab] = useState<'theme' | 'content' | 'layout' | 'preview'>('theme');
  const [settings, setSettings] = useState({
    theme: 'gradient',
    colors: THEMES.gradient.colors,
    layout: 'default',
    header: {
      title: "Join {artist_name}'s Inner Circle",
      subtitle: "Get exclusive updates, early access to new music, and personal messages",
      show_social_links: true,
      show_artist_image: false,
      artist_image_url: null
    },
    form: {
      button_text: "Join the Family",
      button_style: "gradient",
      show_name_field: true,
      placeholder_email: "your@email.com",
      placeholder_name: "Your first name"
    },
    benefits: {
      show_benefits: true,
      custom_benefits: DEFAULT_BENEFITS.slice(0, 4)
    },
    success_message: {
      title: "Welcome to the family! 🎉",
      message: "You're now part of {artist_name}'s inner circle. Get ready for exclusive content, early access to new music, and behind-the-scenes updates."
    }
  });

  const updateSettings = (path: string, value: any) => {
    setSettings(prev => {
      const newSettings = { ...prev };
      const keys = path.split('.');
      let current = newSettings;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  const handleSave = () => {
    onSave(settings);
  };

  const resetToDefaults = () => {
    setSettings({
      theme: 'gradient',
      colors: THEMES.gradient.colors,
      layout: 'default',
      header: {
        title: "Join {artist_name}'s Inner Circle",
        subtitle: "Get exclusive updates, early access to new music, and personal messages",
        show_social_links: true,
        show_artist_image: false,
        artist_image_url: null
      },
      form: {
        button_text: "Join the Family",
        button_style: "gradient",
        show_name_field: true,
        placeholder_email: "your@email.com",
        placeholder_name: "Your first name"
      },
      benefits: {
        show_benefits: true,
        custom_benefits: DEFAULT_BENEFITS.slice(0, 4)
      },
      success_message: {
        title: "Welcome to the family! 🎉",
        message: "You're now part of {artist_name}'s inner circle. Get ready for exclusive content, early access to new music, and behind-the-scenes updates."
      }
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Palette className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Customize Subscription Page</h2>
              <p className="text-gray-600">Personalize your fan signup experience</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={resetToDefaults}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex">
          {[
            { id: 'theme', label: 'Theme & Colors', icon: Palette },
            { id: 'content', label: 'Content', icon: Type },
            { id: 'layout', label: 'Layout', icon: Layout },
            { id: 'preview', label: 'Preview', icon: Eye }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600 bg-purple-50'
                  : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'theme' && (
          <div className="space-y-8">
            {/* Theme Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose a Theme</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(THEMES).map(([key, theme]) => (
                  <button
                    key={key}
                    onClick={() => {
                      updateSettings('theme', key);
                      updateSettings('colors', theme.colors);
                    }}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      settings.theme === key
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div 
                      className="w-full h-12 rounded-lg mb-2"
                      style={{ background: theme.preview }}
                    />
                    <div className="text-sm font-medium text-gray-900">{theme.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Colors */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Custom Colors</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Primary Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={settings.colors.primary}
                      onChange={(e) => updateSettings('colors.primary', e.target.value)}
                      className="w-12 h-10 rounded-lg border border-gray-300"
                    />
                    <input
                      type="text"
                      value={settings.colors.primary}
                      onChange={(e) => updateSettings('colors.primary', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={settings.colors.secondary}
                      onChange={(e) => updateSettings('colors.secondary', e.target.value)}
                      className="w-12 h-10 rounded-lg border border-gray-300"
                    />
                    <input
                      type="text"
                      value={settings.colors.secondary}
                      onChange={(e) => updateSettings('colors.secondary', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Accent Color</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={settings.colors.accent}
                      onChange={(e) => updateSettings('colors.accent', e.target.value)}
                      className="w-12 h-10 rounded-lg border border-gray-300"
                    />
                    <input
                      type="text"
                      value={settings.colors.accent}
                      onChange={(e) => updateSettings('colors.accent', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="space-y-8">
            {/* Header Content */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Header Content</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <select
                    value={settings.header.title}
                    onChange={(e) => updateSettings('header.title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    {HEADER_TITLES.map(title => (
                      <option key={title} value={title}>{title.replace('{artist_name}', artist.name)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                  <textarea
                    value={settings.header.subtitle}
                    onChange={(e) => updateSettings('header.subtitle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    rows={2}
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.header.show_social_links}
                      onChange={(e) => updateSettings('header.show_social_links', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">Show social links</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.header.show_artist_image}
                      onChange={(e) => updateSettings('header.show_artist_image', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">Show artist image</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Form Content */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Form Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Button Text</label>
                  <select
                    value={settings.form.button_text}
                    onChange={(e) => updateSettings('form.button_text', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    {BUTTON_TEXTS.map(text => (
                      <option key={text} value={text}>{text}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Button Style</label>
                  <div className="grid grid-cols-4 gap-3">
                    {Object.entries(BUTTON_STYLES).map(([key, style]) => (
                      <button
                        key={key}
                        onClick={() => updateSettings('form.button_style', key)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          settings.form.button_style === key
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div 
                          className="w-full h-8 rounded mb-2"
                          style={{ background: style.preview }}
                        />
                        <div className="text-xs font-medium text-gray-900">{style.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.form.show_name_field}
                      onChange={(e) => updateSettings('form.show_name_field', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">Show name field</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Benefits Section</h3>
              <div className="space-y-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.benefits.show_benefits}
                    onChange={(e) => updateSettings('benefits.show_benefits', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Show benefits section</span>
                </label>
                {settings.benefits.show_benefits && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Benefits (Choose 4)</label>
                    <div className="grid md:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                      {DEFAULT_BENEFITS.map(benefit => (
                        <label key={benefit} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                          <input
                            type="checkbox"
                            checked={settings.benefits.custom_benefits.includes(benefit)}
                            onChange={(e) => {
                              const current = settings.benefits.custom_benefits;
                              if (e.target.checked && current.length < 4) {
                                updateSettings('benefits.custom_benefits', [...current, benefit]);
                              } else if (!e.target.checked) {
                                updateSettings('benefits.custom_benefits', current.filter(b => b !== benefit));
                              }
                            }}
                            disabled={!settings.benefits.custom_benefits.includes(benefit) && settings.benefits.custom_benefits.length >= 4}
                            className="rounded"
                          />
                          <span className="text-sm text-gray-700">{benefit}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'layout' && (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Page Layout</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(LAYOUTS).map(([key, layout]) => (
                  <button
                    key={key}
                    onClick={() => updateSettings('layout', key)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      settings.layout === key
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900 mb-1">{layout.name}</div>
                    <div className="text-sm text-gray-600">{layout.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Live Preview</h3>
              <a
                href={`/${artist.slug}/subscribe`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Eye className="w-4 h-4" />
                Open Full Page
              </a>
            </div>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <iframe
                src={`/${artist.slug}/subscribe?preview=true`}
                className="w-full h-96"
                title="Subscription Page Preview"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}