import React from 'react';
import { usePermissions } from '@/hooks/use-permissions';
import { Permission as PermissionType } from '@/lib/rbac';

interface PermissionProps {
  permission: PermissionType | PermissionType[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
  requireAll?: boolean;
}

export function Permission({
  permission,
  fallback = null,
  children,
  requireAll = false
}: PermissionProps) {
  const { loading, can, canAll, canAny } = usePermissions();
  
  if (loading) {
    // Optional: Return a loading state or null
    return null;
  }
  
  // Check if permission is an array
  if (Array.isArray(permission)) {
    // If requireAll is true, check if user has all permissions
    // Otherwise, check if user has any of the permissions
    const hasPermission = requireAll 
      ? canAll(permission)
      : canAny(permission);
      
    return hasPermission ? <>{children}</> : <>{fallback}</>;
  }
  
  // Single permission check
  return can(permission) ? <>{children}</> : <>{fallback}</>;
}