"use client";

import { useAnalytics } from '@/hooks/use-analytics';
import { Button } from '@/components/ui/button';

export function AnalyticsTest() {
  const { track, identify, page, isEnabled } = useAnalytics();

  const testTrack = () => {
    track('Test Event', {
      test_property: 'test_value',
      timestamp: new Date().toISOString(),
    });
    console.log('Test event tracked');
  };

  const testIdentify = () => {
    identify('test-user-123', {
      name: 'Test User',
      email: 'test@example.com',
      plan: 'starter',
    });
    console.log('Test user identified');
  };

  const testPage = () => {
    page('Test Page', {
      section: 'analytics-test',
      feature: 'testing',
    });
    console.log('Test page tracked');
  };

  if (process.env.NODE_ENV !== 'development') {
    return null; // Only show in development
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg p-4 shadow-lg z-50">
      <h3 className="text-sm font-semibold mb-2">Analytics Test</h3>
      <p className="text-xs text-gray-600 dark:text-neutral-400 mb-3">
        Status: {isEnabled() ? '✅ Enabled' : '❌ Disabled'}
      </p>
      <div className="space-y-2">
        <Button size="sm" onClick={testTrack} className="w-full">
          Test Track
        </Button>
        <Button size="sm" onClick={testIdentify} className="w-full">
          Test Identify
        </Button>
        <Button size="sm" onClick={testPage} className="w-full">
          Test Page
        </Button>
      </div>
    </div>
  );
}