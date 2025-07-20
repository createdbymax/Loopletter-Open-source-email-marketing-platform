"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { getOrCreateArtistByClerkId } from "@/lib/db";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription } from '@/components/ui/card';
import { AlertTriangle, Shield, CheckCircle, ArrowRight, Lock } from "lucide-react";
import Link from "next/link";
import type { Artist } from "@/lib/types";
import { canAccessFeature } from "@/lib/subscription";

interface DomainCheckProps {
  onValidationComplete: (isValid: boolean) => void;
}

export function DomainCheck({ onValidationComplete }: DomainCheckProps) {
  const { user, isLoaded } = useUser();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchArtist() {
      if (!user) return;
      try {
        const a = await getOrCreateArtistByClerkId(
          user.id,
          user.primaryEmailAddress?.emailAddress || '',
          user.fullName || user.username || "Artist"
        );
        setArtist(a);
        onValidationComplete(a.ses_domain_verified || false);
      } catch (error) {
        console.error('Error fetching artist:', error);
        onValidationComplete(false);
      } finally {
        setLoading(false);
      }
    }
    if (isLoaded) fetchArtist();
  }, [user, isLoaded, onValidationComplete]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (!artist?.ses_domain) {
    // Check if user has access to custom domain feature
    const hasCustomDomainAccess = artist ? canAccessFeature(artist, 'customSignupDomain') : false;
    
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-3">
            <p>
              <strong>Domain Setup Required:</strong> You need to configure a sending domain before creating campaigns.
            </p>
            {hasCustomDomainAccess ? (
              <Link href="/dashboard/domain">
                <Button size="sm">
                  <Shield className="w-4 h-4 mr-2" />
                  Set Up Domain
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            ) : (
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mt-2">
                <div className="flex items-center gap-2 mb-2">
                  <Lock className="h-4 w-4 text-blue-600" />
                  <h4 className="text-sm font-medium text-blue-800">Custom Domain Feature</h4>
                </div>
                <p className="text-xs text-blue-700 mb-3">
                  Custom domain setup is available on the Independent and Label plans.
                  Upgrade to use your own domain for better deliverability and branding.
                </p>
                <Link href="/dashboard/settings?tab=subscription&feature=customSignupDomain">
                  <Button size="sm" variant="default">
                    Upgrade Plan
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (!artist.ses_domain_verified) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-3">
            <p>
              <strong>Domain Verification Pending:</strong> Your domain &quot;{artist.ses_domain}&quot; needs to be verified before you can send campaigns.
            </p>
            <div className="flex gap-2">
              <Link href="/dashboard/domain">
                <Button size="sm" variant="outline">
                  Complete Verification
                </Button>
              </Link>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => window.location.reload()}
              >
                Check Status
              </Button>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="border-green-200 bg-green-50">
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <div>
            <p className="font-medium text-green-900">Domain Verified</p>
            <p className="text-sm text-green-700">
              Ready to send from {artist.ses_domain}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}