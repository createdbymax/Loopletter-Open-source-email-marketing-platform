import { Metadata } from 'next';
import { ProtectedAdminRoute } from '@/components/protected-admin-route';
import { SystemTools } from '@/components/system-tools';

export const metadata: Metadata = {
  title: 'System Tools - Admin Dashboard',
  description: 'System maintenance and administrative tools',
};

export default function SystemToolsPage() {
  return (
    <ProtectedAdminRoute requiredPermission="view" fallbackPath="/dashboard">
      <SystemTools />
    </ProtectedAdminRoute>
  );
}