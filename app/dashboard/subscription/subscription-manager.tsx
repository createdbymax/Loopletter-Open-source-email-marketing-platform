'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Artist } from '@/lib/types';
import { 
  Copy, 
  ExternalLink, 
  Code, 
  Eye, 
  Palette,
  Monitor,
  Smartphone,
  CheckCircle,
  Link as LinkIcon,
  Users,
  Mail,
  BarChart3,
  AlertTriangle,
  RefreshCw,
  Settings
} from 'lucide-react';
import PageCustomizer from './page-customizer';
import SlugManager from './slug-manager';

interface SubscriptionManagerProps {
  artist: Artist;
}

export default function SubscriptionManager({ artist }: SubscriptionManagerProps) {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [widgetTheme, setWidgetTheme] = useState<'light' | 'dark'>('light');
  const [widgetSize, setWidgetSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [isFixingSlug, setIsFixingSlug] = useState(false);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [currentArtist, setCurrentArtist] = useState(artist);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  
  // Use the current artist's slug
  const artistSlug = currentArtist.slug || 'artist';
  const subscriptionUrl = `${baseUrl}/f/${artistSlug}/subscribe`;
  const widgetUrl = `${baseUrl}/api/widget?artist=${artistSlug}&theme=${widgetTheme}&size=${widgetSize}`;
  const mobileWidgetUrl = `${baseUrl}/api/widget/mobile?artist=${artistSlug}&theme=${widgetTheme}`;

  const copyToClipboard = async (text: string, item: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(item);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const widgetEmbedCode = `<iframe 
  src="${widgetUrl}" 
  width="100%" 
  height="400" 
  frameborder="0" 
  style="border-radius: 12px; max-width: 400px;">
</iframe>`;

  const widgetScriptCode = `<div id="loopletter-widget-${artistSlug}"></div>
<script>
  (function() {
    var iframe = document.createElement('iframe');
    iframe.src = '${widgetUrl}';
    iframe.width = '100%';
    iframe.height = '400';
    iframe.frameBorder = '0';
    iframe.style.borderRadius = '12px';
    iframe.style.maxWidth = '400px';
    document.getElementById('loopletter-widget-${artistSlug}').appendChild(iframe);
  })();
</script>`;

  const mobileWidgetCode = `<iframe 
  src="${mobileWidgetUrl}" 
  width="100%" 
  height="300" 
  frameborder="0" 
  style="border-radius: 12px; max-width: 320px;">
</iframe>`;

  return (
    <div className="space-y-8">
      {/* Slug Issue Warning */}
      {(artist.slug === 'sign-in' || artist.slug === 'signin' || !artist.slug) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-yellow-900 mb-2">Slug Issue Detected</h3>
              <p className="text-yellow-800 text-sm mb-4">
                Your artist slug is set to &quot;{artist.slug || 'none'}&quot; which causes issues with your subscription page. 
                Click the button below to fix this automatically.
              </p>
              <button
                onClick={async () => {
                  setIsFixingSlug(true);
                  try {
                    const response = await fetch('/api/fix-artist-slug', {
                      method: 'POST',
                    });
                    const data = await response.json();
                    if (data.success) {
                      alert(`Success! Your slug has been updated to: ${data.artist.slug}`);
                      window.location.reload();
                    } else {
                      alert('Failed to fix slug: ' + data.error);
                    }
                  } catch (error) {
                    alert('Error fixing slug: ' + error);
                  } finally {
                    setIsFixingSlug(false);
                  }
                }}
                disabled={isFixingSlug}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
              >
                {isFixingSlug ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Fixing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Fix Slug Now
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Page Link */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <LinkIcon className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Subscription Page</h2>
            <p className="text-gray-600">Share this link to let fans subscribe to your updates</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <code className="flex-1 text-sm text-gray-700 break-all">
              {subscriptionUrl}
            </code>
            <div className="flex gap-2">
              <button
                onClick={() => copyToClipboard(subscriptionUrl, 'subscription-url')}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                title="Copy link"
              >
                {copiedItem === 'subscription-url' ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
              <a
                href={subscriptionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                title="Open in new tab"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="flex gap-3">
            <a
              href={subscriptionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Eye className="w-4 h-4" />
              Preview Page
            </a>
            <button
              onClick={() => setShowCustomizer(!showCustomizer)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Customize Page
            </button>
          </div>
        </div>
      </div>

      {/* Slug Manager */}
      <SlugManager 
        artist={currentArtist} 
        onSlugUpdate={(newSlug) => {
          setCurrentArtist(prev => ({ ...prev, slug: newSlug }));
        }}
      />

      {/* Widget Embed */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Code className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Embeddable Widget</h2>
            <p className="text-gray-600">Add a subscription form to any website</p>
          </div>
        </div>

        {/* Widget Customization */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Theme
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setWidgetTheme('light')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  widgetTheme === 'light'
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Monitor className="w-4 h-4" />
                Light
              </button>
              <button
                onClick={() => setWidgetTheme('dark')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  widgetTheme === 'dark'
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Palette className="w-4 h-4" />
                Dark
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Size
            </label>
            <div className="flex gap-3">
              {(['small', 'medium', 'large'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => setWidgetSize(size)}
                  className={`px-4 py-2 rounded-lg border transition-colors capitalize ${
                    widgetSize === size
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Widget Preview */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Preview
          </label>
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <iframe
              src={widgetUrl}
              width="100%"
              height="400"
              frameBorder="0"
              className="rounded-lg max-w-sm mx-auto"
              title="Widget Preview"
            />
          </div>
        </div>

        {/* Embed Codes */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">
                Desktop Widget (Recommended)
              </label>
              <button
                onClick={() => copyToClipboard(widgetEmbedCode, 'iframe-code')}
                className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {copiedItem === 'iframe-code' ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <code className="text-green-400 text-sm whitespace-pre">
                {widgetEmbedCode}
              </code>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                Mobile-Optimized Widget
              </label>
              <button
                onClick={() => copyToClipboard(mobileWidgetCode, 'mobile-code')}
                className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {copiedItem === 'mobile-code' ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <code className="text-green-400 text-sm whitespace-pre">
                {mobileWidgetCode}
              </code>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">
                JavaScript Embed
              </label>
              <button
                onClick={() => copyToClipboard(widgetScriptCode, 'script-code')}
                className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {copiedItem === 'script-code' ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <code className="text-green-400 text-sm whitespace-pre">
                {widgetScriptCode}
              </code>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">How to use:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Copy the iframe code and paste it into your website&apos;s HTML</li>
            <li>• The widget will automatically match your customization settings</li>
            <li>• Fans can subscribe directly from your website</li>
            <li>• All subscriptions will appear in your fans dashboard</li>
          </ul>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">0</div>
            <div className="text-sm text-gray-600">Total Subscribers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">0</div>
            <div className="text-sm text-gray-600">This Week</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">0</div>
            <div className="text-sm text-gray-600">From Widget</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">0</div>
            <div className="text-sm text-gray-600">From Page</div>
          </div>
        </div>
      </div>

      {/* Page Customizer */}
      {showCustomizer && (
        <PageCustomizer 
          artist={artist} 
          onSave={async (settings) => {
            try {
              const response = await fetch('/api/subscription-page-settings', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ settings }),
              });
              
              if (response.ok) {
                alert('Page customization saved successfully!');
                setShowCustomizer(false);
              } else {
                alert('Failed to save customization settings');
              }
            } catch (error) {
              console.error('Error saving settings:', error);
              alert('Error saving settings');
            }
          }}
        />
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <Link
            href="/dashboard/fans"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">Manage Fans</div>
              <div className="text-sm text-gray-600">View and manage your audience</div>
            </div>
          </Link>
          
          <Link
            href="/dashboard/campaigns/create"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">Send Campaign</div>
              <div className="text-sm text-gray-600">Email your subscribers</div>
            </div>
          </Link>

          <Link
            href="/dashboard/analytics"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
          >
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">View Analytics</div>
              <div className="text-sm text-gray-600">Track performance</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}