"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Shield, Eye, MousePointer, Mail, Bell, Globe } from 'lucide-react';

export default function PreferencesPage() {
  const searchParams = useSearchParams();
  const fanId = searchParams.get('fan_id');
  
  const [fan, setFan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  const [preferences, setPreferences] = useState({
    frequency: 'weekly' as 'daily' | 'weekly' | 'monthly',
    content_types: [] as string[],
    allow_open_tracking: true,
    allow_click_tracking: true,
  });

  useEffect(() => {
    async function fetchFanData() {
      if (!fanId) return;
      
      try {
        const response = await fetch(`/api/fans/${fanId}`);
        if (response.ok) {
          const fanData = await response.json();
          setFan(fanData);
          
          // Set current preferences
          setPreferences({
            frequency: fanData.preferences?.frequency || 'weekly',
            content_types: fanData.preferences?.content_types || [],
            allow_open_tracking: fanData.tracking_preferences?.allow_open_tracking ?? true,
            allow_click_tracking: fanData.tracking_preferences?.allow_click_tracking ?? true,
          });
        }
      } catch (error) {
        console.error('Error fetching fan data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchFanData();
  }, [fanId]);

  const handleSave = async () => {
    if (!fanId) return;
    
    setSaving(true);
    try {
      const response = await fetch(`/api/fans/${fanId}/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preferences: {
            frequency: preferences.frequency,
            content_types: preferences.content_types,
          },
          tracking_preferences: {
            allow_open_tracking: preferences.allow_open_tracking,
            allow_click_tracking: preferences.allow_click_tracking,
          },
        }),
      });
      
      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!fan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Invalid Link</h2>
              <p className="text-gray-600">
                This preferences link is invalid or has expired.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Email Preferences
          </h1>
          <p className="text-gray-600">
            Manage how you receive emails from {fan.artist?.name || 'this artist'}
          </p>
        </div>

        <div className="space-y-6">
          {/* Email Frequency */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Email Frequency
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {[
                  { value: 'daily', label: 'Daily', desc: 'Get emails every day' },
                  { value: 'weekly', label: 'Weekly', desc: 'Get emails once a week' },
                  { value: 'monthly', label: 'Monthly', desc: 'Get emails once a month' },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      preferences.frequency === option.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="frequency"
                      value={option.value}
                      checked={preferences.frequency === option.value}
                      onChange={(e) =>
                        setPreferences(prev => ({
                          ...prev,
                          frequency: e.target.value as any
                        }))
                      }
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-gray-600">{option.desc}</div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      preferences.frequency === option.value
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {preferences.frequency === option.value && (
                        <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Content Types */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Content Types
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { value: 'music_releases', label: 'Music Releases', desc: 'New songs, albums, and EPs' },
                { value: 'show_announcements', label: 'Show Announcements', desc: 'Concert and tour dates' },
                { value: 'merchandise', label: 'Merchandise', desc: 'New merch and special offers' },
                { value: 'newsletters', label: 'Newsletters', desc: 'General updates and news' },
              ].map((type) => (
                <div key={type.value} className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label htmlFor={type.value} className="font-medium">
                      {type.label}
                    </Label>
                    <p className="text-sm text-gray-600">{type.desc}</p>
                  </div>
                  <Switch
                    id={type.value}
                    checked={preferences.content_types.includes(type.value)}
                    onCheckedChange={(checked) => {
                      setPreferences(prev => ({
                        ...prev,
                        content_types: checked
                          ? [...prev.content_types, type.value]
                          : prev.content_types.filter(t => t !== type.value)
                      }));
                    }}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Privacy & Tracking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Privacy & Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label htmlFor="open-tracking" className="font-medium flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Email Open Tracking
                    </Label>
                    <p className="text-sm text-gray-600">
                      Allow us to know when you open our emails to improve our content
                    </p>
                  </div>
                  <Switch
                    id="open-tracking"
                    checked={preferences.allow_open_tracking}
                    onCheckedChange={(checked) =>
                      setPreferences(prev => ({
                        ...prev,
                        allow_open_tracking: checked
                      }))
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Label htmlFor="click-tracking" className="font-medium flex items-center gap-2">
                      <MousePointer className="w-4 h-4" />
                      Link Click Tracking
                    </Label>
                    <p className="text-sm text-gray-600">
                      Allow us to track which links you click to understand your interests
                    </p>
                  </div>
                  <Switch
                    id="click-tracking"
                    checked={preferences.allow_click_tracking}
                    onCheckedChange={(checked) =>
                      setPreferences(prev => ({
                        ...prev,
                        allow_click_tracking: checked
                      }))
                    }
                  />
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <Globe className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900 mb-1">
                      Why we use tracking
                    </p>
                    <p className="text-blue-800">
                      Tracking helps us understand what content you enjoy most, 
                      so we can send you more relevant emails and improve your experience. 
                      You can disable tracking at any time.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="px-8"
            >
              {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Preferences'}
            </Button>
          </div>

          {/* Unsubscribe Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              Don't want to receive any emails?
            </p>
            <a
              href={`/unsubscribe?fan_id=${fanId}`}
              className="text-sm text-red-600 hover:text-red-700 underline"
            >
              Unsubscribe from all emails
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}