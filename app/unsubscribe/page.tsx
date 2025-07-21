"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Mail, Settings } from "lucide-react";

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [fanEmail, setFanEmail] = useState('');

  useEffect(() => {
    async function handleUnsubscribe() {
      const fanId = searchParams.get('fan_id');
      const campaignId = searchParams.get('campaign_id');

      if (!fanId) {
        setStatus('error');
        return;
      }

      try {
        const response = await fetch('/api/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ fan_id: fanId, campaign_id: campaignId }),
        });

        if (response.ok) {
          const data = await response.json();
          setFanEmail(data.email);
          setStatus('success');
        } else {
          setStatus('error');
        }
      } catch (error) {
        console.error('Unsubscribe error:', error);
        setStatus('error');
      }
    }

    handleUnsubscribe();
  }, [searchParams]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <Mail className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-semibold mb-2">Unsubscribe Failed</h1>
            <p className="text-gray-600">We&apos;re sorry to see you go! You&apos;ve been unsubscribed from future emails. Please try again or contact support.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <CardTitle className="text-xl">Successfully Unsubscribed</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">You&apos;ve been successfully unsubscribed from all future emails. {fanEmail} has been removed from this mailing list.</p>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Want more control?</h3>
            <p className="text-sm text-gray-600 mb-3">
              Instead of unsubscribing completely, you can manage your email preferences 
              to receive only the content you want.
            </p>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Manage Preferences
            </Button>
          </div>

          <div className="text-xs text-gray-500">
            <p>You can resubscribe at any time by visiting the artist's website.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <UnsubscribeContent />
    </Suspense>
  );
}