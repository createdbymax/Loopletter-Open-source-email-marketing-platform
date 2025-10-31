import React from 'react';
import Link from 'next/link';
import { Lock } from 'lucide-react';
import { Artist } from '@/lib/types';
import { canAccessFeature, getUpgradeUrlForFeature, FEATURE_NAMES, FeatureAccess } from '@/lib/subscription';
interface FeatureGateProps {
    feature: keyof FeatureAccess;
    artist: Artist;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}
export function FeatureGate({ feature, artist, children, fallback }: FeatureGateProps) {
    const hasAccess = canAccessFeature(artist, feature);
    if (hasAccess) {
        return <>{children}</>;
    }
    if (fallback) {
        return <>{fallback}</>;
    }
    return (<div className="relative">
      <div className="blur-sm pointer-events-none opacity-60">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center flex-col bg-gray-50/80 rounded-md">
        <Lock className="h-5 w-5 text-gray-500 mb-2"/>
        <p className="text-sm font-medium text-gray-700 mb-2">
          Upgrade to access {FEATURE_NAMES[feature]}
        </p>
        <Link href={getUpgradeUrlForFeature(feature)} className="text-xs px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          Upgrade Plan
        </Link>
      </div>
    </div>);
}
export function useFeatureAccess(artist: Artist) {
    return {
        canAccess: (feature: keyof FeatureAccess) => canAccessFeature(artist, feature),
        getUpgradeUrl: getUpgradeUrlForFeature,
    };
}
export function FeatureLockIcon({ feature }: {
    feature: keyof FeatureAccess;
}) {
    return (<div className="inline-flex items-center" title={`Upgrade to access ${FEATURE_NAMES[feature]}`}>
      <Lock className="h-3.5 w-3.5 text-gray-400"/>
    </div>);
}
export function FeatureBadge({ feature, artist }: {
    feature: keyof FeatureAccess;
    artist: Artist;
}) {
    const hasAccess = canAccessFeature(artist, feature);
    return (<span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${hasAccess
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'}`}>
      {hasAccess ? (FEATURE_NAMES[feature]) : (<span className="flex items-center gap-1">
          <Lock className="h-3 w-3"/>
          {FEATURE_NAMES[feature]}
        </span>)}
    </span>);
}
export function UpgradeButton({ feature }: {
    feature: keyof FeatureAccess;
}) {
    return (<Link href={getUpgradeUrlForFeature(feature)} className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
      <Lock className="h-4 w-4 mr-1.5"/>
      Upgrade to Access
    </Link>);
}
