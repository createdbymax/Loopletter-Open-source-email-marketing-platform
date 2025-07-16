'use client';

import { useState } from 'react';
import { Artist } from '@/lib/types';
import { 
  Link as LinkIcon, 
  Edit3, 
  Check, 
  X, 
  AlertCircle,
  Copy,
  CheckCircle,
  RefreshCw
} from 'lucide-react';

interface SlugManagerProps {
  artist: Artist;
  onSlugUpdate: (newSlug: string) => void;
}

export default function SlugManager({ artist, onSlugUpdate }: SlugManagerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newSlug, setNewSlug] = useState(artist.slug || '');
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const currentUrl = `${baseUrl}/f/${artist.slug}/subscribe`;
  const previewUrl = `${baseUrl}/f/${newSlug}/subscribe`;

  // Clean and validate slug
  const cleanSlug = (input: string) => {
    return input
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
      .slice(0, 50); // Limit length
  };

  const checkSlugAvailability = async (slug: string) => {
    if (!slug || slug === artist.slug) {
      setIsAvailable(null);
      return;
    }

    setIsChecking(true);
    try {
      const response = await fetch(`/api/check-slug?slug=${encodeURIComponent(slug)}`);
      const data = await response.json();
      setIsAvailable(data.available);
    } catch (error) {
      console.error('Error checking slug:', error);
      setIsAvailable(false);
    } finally {
      setIsChecking(false);
    }
  };

  const handleSlugChange = (value: string) => {
    const cleaned = cleanSlug(value);
    setNewSlug(cleaned);
    
    // Debounce the availability check
    setTimeout(() => {
      checkSlugAvailability(cleaned);
    }, 500);
  };

  const handleSave = async () => {
    if (!newSlug || !isAvailable) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/update-slug', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slug: newSlug }),
      });

      if (response.ok) {
        onSlugUpdate(newSlug);
        setIsEditing(false);
        alert('Slug updated successfully!');
      } else {
        const data = await response.json();
        alert(`Failed to update slug: ${data.error}`);
      }
    } catch (error) {
      console.error('Error updating slug:', error);
      alert('Error updating slug');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setNewSlug(artist.slug || '');
    setIsEditing(false);
    setIsAvailable(null);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const generateSuggestions = () => {
    const name = artist.name.toLowerCase();
    const suggestions = [
      cleanSlug(name),
      cleanSlug(`${name}-music`),
      cleanSlug(`${name}-official`),
      cleanSlug(`${name}-artist`),
      cleanSlug(`${name}-band`)
    ].filter(s => s && s !== artist.slug);
    
    return [...new Set(suggestions)].slice(0, 3);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <LinkIcon className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Your Subscription URL</h2>
          <p className="text-gray-600">Customize your fan signup link</p>
        </div>
      </div>

      {/* Current URL Display */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current URL
          </label>
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <code className="flex-1 text-sm text-gray-700 break-all">
              {currentUrl}
            </code>
            <button
              onClick={() => copyToClipboard(currentUrl)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              title="Copy URL"
            >
              {copied ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Slug Editor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Customize Your Slug
          </label>
          
          {!isEditing ? (
            <div className="flex items-center gap-3 p-4 border border-gray-300 rounded-lg">
              <span className="text-gray-500">{baseUrl}/f/</span>
              <span className="font-medium text-gray-900">{artist.slug}</span>
              <span className="text-gray-500">/subscribe</span>
              <button
                onClick={() => setIsEditing(true)}
                className="ml-auto p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Edit slug"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-4 border border-gray-300 rounded-lg">
                <span className="text-gray-500 text-sm">{baseUrl}/f/</span>
                <input
                  type="text"
                  value={newSlug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  className="flex-1 bg-transparent outline-none font-medium text-gray-900"
                  placeholder="your-slug"
                  maxLength={50}
                />
                <span className="text-gray-500 text-sm">/subscribe</span>
                
                {/* Status Indicator */}
                <div className="flex items-center gap-2">
                  {isChecking && <RefreshCw className="w-4 h-4 text-gray-400 animate-spin" />}
                  {!isChecking && isAvailable === true && <Check className="w-4 h-4 text-green-600" />}
                  {!isChecking && isAvailable === false && <X className="w-4 h-4 text-red-600" />}
                </div>
              </div>

              {/* Availability Status */}
              {!isChecking && isAvailable !== null && (
                <div className={`flex items-center gap-2 text-sm ${
                  isAvailable ? 'text-green-600' : 'text-red-600'
                }`}>
                  {isAvailable ? (
                    <>
                      <Check className="w-4 h-4" />
                      This slug is available!
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4" />
                      This slug is already taken
                    </>
                  )}
                </div>
              )}

              {/* Preview URL */}
              {newSlug && isAvailable && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-sm text-green-800 mb-1">Preview URL:</div>
                  <code className="text-sm text-green-700">{previewUrl}</code>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={!newSlug || !isAvailable || isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Slug Suggestions */}
        {!isEditing && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Suggestions
            </label>
            <div className="flex flex-wrap gap-2">
              {generateSuggestions().map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setNewSlug(suggestion);
                    setIsEditing(true);
                    checkSlugAvailability(suggestion);
                  }}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Guidelines */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Slug Guidelines</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Use lowercase letters, numbers, and hyphens only</li>
                <li>• Keep it short and memorable (max 50 characters)</li>
                <li>• Avoid special characters and spaces</li>
                <li>• Choose something that represents your brand</li>
                <li>• Once changed, update any existing links you've shared</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}