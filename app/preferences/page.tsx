"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Mail, CheckCircle, XCircle } from 'lucide-react';

function PreferencesContent() {
  const searchParams = useSearchParams();
  const fanId = searchParams.get('fan_id') || searchParams.get('fan');
  
  const [fan, setFan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  const [isSubscribed, setIsSubscribed] = useState(true);

  useEffect(() => {
    async function fetchFanData() {
      if (!fanId) return;
      
      try {
        const response = await fetch(`/api/fans/${fanId}`);
        if (response.ok) {
          const fanData = await response.json();
          setFan(fanData);
          
          // Set current subscription status
          setIsSubscribed(fanData.status === 'subscribed');
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
          status: isSubscribed ? 'subscribed' : 'unsubscribed',
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
          <p className="text-sm text-gray-500 mt-2">
            Email: {fan.email}
          </p>
          {saved && (
            <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-lg inline-block">
              ✓ Your preferences have been saved successfully!
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Simple Subscription Toggle */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Email Subscription
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor="subscription" className="font-medium flex items-center gap-2">
                    {isSubscribed ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                    {isSubscribed ? 'Subscribed' : 'Unsubscribed'}
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    {isSubscribed 
                      ? `You'll receive emails from ${fan.artist?.name || 'this artist'}`
                      : `You won't receive any emails from ${fan.artist?.name || 'this artist'}`
                    }
                  </p>
                </div>
                <Switch
                  id="subscription"
                  checked={isSubscribed}
                  onCheckedChange={setIsSubscribed}
                />
              </div>

              {!isSubscribed && (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> You can resubscribe at any time by toggling this switch back on.
                  </p>
                </div>
              )}
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
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}

export default function PreferencesPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PreferencesContent />
    </Suspense>
  );
}