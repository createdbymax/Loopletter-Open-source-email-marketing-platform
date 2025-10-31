import React from 'react';
import { usePermissions } from '@/hooks/use-permissions';
import { Permission as PermissionType } from '@/lib/rbac';
interface PermissionProps {
    permission: PermissionType | PermissionType[];
    fallback?: React.ReactNode;
    children: React.ReactNode;
    requireAll?: boolean;
}
export function Permission({ permission, fallback = null, children, requireAll = false }: PermissionProps) {
    const { loading, can, canAll, canAny } = usePermissions();
    if (loading) {
        return null;
    }
    if (Array.isArray(permission)) {
        const hasPermission = requireAll
            ? canAll(permission)
            : canAny(permission);
        return hasPermission ? <>{children}</> : <>{fallback}</>;
    }
    return can(permission) ? <>{children}</> : <>{fallback}</>;
}
