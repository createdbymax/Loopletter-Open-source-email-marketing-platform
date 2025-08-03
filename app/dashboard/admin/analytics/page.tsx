import { Metadata } from 'next';
import { ProtectedAdminRoute } from '@/components/protected-admin-route';
import { AdminAnalytics } from '@/components/admin-analytics';

export const metadata: Metadata = {
  title: 'Platform Analytics - Admin Dashboard',
  description: 'Comprehensive platform analytics and insights',
};

export default function AdminAnalyticsPage() {
  return (
    <ProtectedAdminRoute requiredPermission="view" fallbackPath="/dashboard">
      <AdminAnalytics />
    </ProtectedAdminRoute>
  );
}