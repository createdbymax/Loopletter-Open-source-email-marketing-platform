import { useEffect, useState } from 'react';
import { TeamMember } from '@/lib/types';
import { Permission, hasPermission, hasAnyPermission, hasAllPermissions } from '@/lib/rbac';

export function usePermissions() {
  const [currentMember, setCurrentMember] = useState<TeamMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCurrentMember() {
      try {
        setLoading(true);
        const response = await fetch('/api/team/me');
        
        if (!response.ok) {
          if (response.status === 403) {
            // User is not a team member, they're the owner
            setCurrentMember({
              id: 'owner',
              artist_id: '',
              email: '',
              name: 'Owner',
              role: 'owner',
              permissions: [],
              invited_at: '',
              status: 'active'
            });
            return;
          }
          throw new Error('Failed to fetch team member data');
        }
        
        const data = await response.json();
        setCurrentMember(data);
      } catch (error) {
        console.error('Error fetching team member data:', error);
        setError('Could not load permissions');
      } finally {
        setLoading(false);
      }
    }
    
    fetchCurrentMember();
  }, []);
  
  const can = (permission: Permission): boolean => {
    if (!currentMember) return false;
    return hasPermission(currentMember, permission);
  };
  
  const canAny = (permissions: Permission[]): boolean => {
    if (!currentMember) return false;
    return hasAnyPermission(currentMember, permissions);
  };
  
  const canAll = (permissions: Permission[]): boolean => {
    if (!currentMember) return false;
    return hasAllPermissions(currentMember, permissions);
  };
  
  const isOwner = (): boolean => {
    return currentMember?.role === 'owner';
  };
  
  const isAdmin = (): boolean => {
    return currentMember?.role === 'owner' || currentMember?.role === 'admin';
  };
  
  return {
    currentMember,
    loading,
    error,
    can,
    canAny,
    canAll,
    isOwner,
    isAdmin
  };
}