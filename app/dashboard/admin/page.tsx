import { Metadata } from 'next';
import { ProtectedAdminRoute } from '@/components/protected-admin-route';
import { AdminDashboard } from '@/components/admin-dashboard';
export const metadata: Metadata = {
    title: 'Admin Dashboard - Super Admin',
    description: 'Comprehensive admin dashboard for platform management',
};
export default function AdminPage() {
    console.log('AdminPage component rendered - this should be the dashboard, not reviews');
    return (<ProtectedAdminRoute requiredPermission="view" fallbackPath="/dashboard">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded mb-4">
        <p className="text-blue-800 font-medium">
          ✅ Admin Dashboard Loaded Successfully - You're on /dashboard/admin
        </p>
      </div>
      <AdminDashboard />
    </ProtectedAdminRoute>);
}
