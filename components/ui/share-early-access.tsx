'use client';

import { useState } from 'react';
import { Copy, Check, Share2, Twitter, Facebook, Linkedin, Mail } from 'lucide-react';
import { generateEarlyAccessUrl, shareUrls, socialShareUrls, copyEarlyAccessUrl } from '@/lib/share-utils';

interface ShareEarlyAccessProps {
  className?: string;
  variant?: 'button' | 'card' | 'inline';
}

export function ShareEarlyAccess({ className = '', variant = 'button' }: ShareEarlyAccessProps) {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleCopy = async () => {
    const success = await copyEarlyAccessUrl({
      utm_source: 'share_component',
      utm_medium: 'direct',
      utm_campaign: 'early_access'
    });

    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSocialShare = (platform: 'twitter' | 'facebook' | 'linkedin') => {
    let url = '';
    switch (platform) {
      case 'twitter':
        url = socialShareUrls.twitter();
        break;
      case 'facebook':
        url = socialShareUrls.facebook();
        break;
      case 'linkedin':
        url = socialShareUrls.linkedin();
        break;
    }
    window.open(url, '_blank', 'width=600,height=400');
  };

  if (variant === 'button') {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all"
        >
          <Share2 className="w-4 h-4" />
          Share Early Access
        </button>

        {isOpen && (
          <div className="absolute top-full mt-2 right-0 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg p-4 min-w-64 z-50">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-3">
              Share Early Access
            </h3>
            
            <div className="space-y-2">
              <button
                onClick={handleCopy}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors text-left"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 text-neutral-600" />
                )}
                <span className="text-sm">
                  {copied ? 'Copied!' : 'Copy Link'}
                </span>
              </button>

              <button
                onClick={() => handleSocialShare('twitter')}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors text-left"
              >
                <Twitter className="w-4 h-4 text-blue-500" />
                <span className="text-sm">Share on Twitter</span>
              </button>

              <button
                onClick={() => handleSocialShare('facebook')}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors text-left"
              >
                <Facebook className="w-4 h-4 text-blue-600" />
                <span className="text-sm">Share on Facebook</span>
              </button>

              <button
                onClick={() => handleSocialShare('linkedin')}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors text-left"
              >
                <Linkedin className="w-4 h-4 text-blue-700" />
                <span className="text-sm">Share on LinkedIn</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
          Share Early Access
        </h3>
        <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-4">
          Help spread the word about Loopletter and give others instant access to request early access.
        </p>
        
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={generateEarlyAccessUrl()}
              readOnly
              className="flex-1 px-3 py-2 bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg text-sm"
            />
            <button
              onClick={handleCopy}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleSocialShare('twitter')}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              <Twitter className="w-4 h-4" />
              <span className="text-sm">Twitter</span>
            </button>
            <button
              onClick={() => handleSocialShare('facebook')}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Facebook className="w-4 h-4" />
              <span className="text-sm">Facebook</span>
            </button>
            <button
              onClick={() => handleSocialShare('linkedin')}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-colors"
            >
              <Linkedin className="w-4 h-4" />
              <span className="text-sm">LinkedIn</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Inline variant
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={handleCopy}
        className="flex items-center gap-2 px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-lg text-sm transition-colors"
      >
        {copied ? (
          <>
            <Check className="w-3 h-3 text-green-600" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="w-3 h-3" />
            Copy Link
          </>
        )}
      </button>
      
      <button
        onClick={() => handleSocialShare('twitter')}
        className="p-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-blue-500 rounded-lg transition-colors"
      >
        <Twitter className="w-3 h-3" />
      </button>
    </div>
  );
}