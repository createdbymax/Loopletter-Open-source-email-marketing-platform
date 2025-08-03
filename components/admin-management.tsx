'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  UserPlus, 
  UserMinus, 
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface SuperAdmin {
  id: string;
  email: string;
  promotedAt?: string;
}

export function AdminManagement() {
  const [admins, setAdmins] = useState<SuperAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/manage-admins');
      
      if (!response.ok) {
        throw new Error('Failed to fetch admins');
      }
      
      const data = await response.json();
      setAdmins(data.admins || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handlePromoteUser = async () => {
    if (!newAdminEmail.trim()) {
      setMessage({ type: 'error', text: 'Please enter an email address' });
      return;
    }

    try {
      setProcessing(true);
      const response = await fetch('/api/admin/manage-admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newAdminEmail.trim(),
          action: 'promote'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        setNewAdminEmail('');
        await fetchAdmins(); // Refresh the list
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to promote user' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to promote user' });
    } finally {
      setProcessing(false);
    }
  };

  const handleDemoteUser = async (email: string) => {
    if (!confirm(`Are you sure you want to remove super admin status from ${email}?`)) {
      return;
    }

    try {
      setProcessing(true);
      const response = await fetch('/api/admin/manage-admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          action: 'demote'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        await fetchAdmins(); // Refresh the list
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to demote user' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to demote user' });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span>Loading admin management...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Error loading admin management: {error}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Super Admin Management
          </CardTitle>
          <CardDescription>
            Manage users who can access the admin review system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && (
            <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
              {message.type === 'success' ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          {/* Add New Admin */}
          <div className="space-y-2">
            <Label htmlFor="new-admin-email">Promote User to Super Admin</Label>
            <div className="flex gap-2">
              <Input
                id="new-admin-email"
                type="email"
                placeholder="Enter email address..."
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                disabled={processing}
              />
              <Button 
                onClick={handlePromoteUser}
                disabled={processing || !newAdminEmail.trim()}
                className="flex items-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                {processing ? 'Promoting...' : 'Promote'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              The user must already have an account on the platform
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Current Admins */}
      <Card>
        <CardHeader>
          <CardTitle>Current Super Admins ({admins.length})</CardTitle>
          <CardDescription>
            Users with access to the admin review system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {admins.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No super admins found
            </div>
          ) : (
            <div className="space-y-3">
              {admins.map((admin) => (
                <div
                  key={admin.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Shield className="h-4 w-4 text-blue-500" />
                    <div>
                      <div className="font-medium">{admin.email}</div>
                      {admin.promotedAt && (
                        <div className="text-xs text-muted-foreground">
                          Promoted: {new Date(admin.promotedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      Super Admin
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDemoteUser(admin.email)}
                      disabled={processing}
                      className="text-red-600 hover:text-red-700"
                    >
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={fetchAdmins} disabled={processing}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}