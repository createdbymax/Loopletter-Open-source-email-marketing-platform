import { TeamMember } from './types';
export type Permission = 'campaigns.view' | 'campaigns.create' | 'campaigns.edit' | 'campaigns.delete' | 'campaigns.send' | 'fans.view' | 'fans.create' | 'fans.edit' | 'fans.delete' | 'fans.import' | 'fans.export' | 'segments.view' | 'segments.create' | 'segments.edit' | 'segments.delete' | 'analytics.view' | 'analytics.export' | 'templates.view' | 'templates.create' | 'templates.edit' | 'templates.delete' | 'settings.view' | 'settings.edit' | 'domain.view' | 'domain.manage' | 'team.view' | 'team.invite' | 'team.edit' | 'team.remove' | 'billing.view' | 'billing.manage';
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
    owner: [
        'campaigns.view', 'campaigns.create', 'campaigns.edit', 'campaigns.delete', 'campaigns.send',
        'fans.view', 'fans.create', 'fans.edit', 'fans.delete', 'fans.import', 'fans.export',
        'segments.view', 'segments.create', 'segments.edit', 'segments.delete',
        'analytics.view', 'analytics.export',
        'templates.view', 'templates.create', 'templates.edit', 'templates.delete',
        'settings.view', 'settings.edit',
        'domain.view', 'domain.manage',
        'team.view', 'team.invite', 'team.edit', 'team.remove',
        'billing.view', 'billing.manage'
    ],
    admin: [
        'campaigns.view', 'campaigns.create', 'campaigns.edit', 'campaigns.delete', 'campaigns.send',
        'fans.view', 'fans.create', 'fans.edit', 'fans.delete', 'fans.import', 'fans.export',
        'segments.view', 'segments.create', 'segments.edit', 'segments.delete',
        'analytics.view', 'analytics.export',
        'templates.view', 'templates.create', 'templates.edit', 'templates.delete',
        'settings.view', 'settings.edit',
        'domain.view', 'domain.manage',
        'team.view', 'team.invite', 'team.edit', 'team.remove',
        'billing.view'
    ],
    editor: [
        'campaigns.view', 'campaigns.create', 'campaigns.edit', 'campaigns.send',
        'fans.view', 'fans.create', 'fans.edit', 'fans.import',
        'segments.view', 'segments.create', 'segments.edit',
        'analytics.view',
        'templates.view', 'templates.create', 'templates.edit',
        'settings.view',
        'domain.view'
    ],
    viewer: [
        'campaigns.view',
        'fans.view',
        'segments.view',
        'analytics.view',
        'templates.view',
        'settings.view',
        'domain.view'
    ]
};
function isValidPermission(permission: string): permission is Permission {
    const allPermissions = Object.values(ROLE_PERMISSIONS).flat();
    return allPermissions.includes(permission as Permission);
}
function toPermissions(permissions: string[]): Permission[] {
    return permissions.filter(isValidPermission);
}
export function hasPermission(member: TeamMember, permission: Permission): boolean {
    const rolePermissions = ROLE_PERMISSIONS[member.role] || [];
    if (rolePermissions.includes(permission)) {
        return true;
    }
    const customPermissions = toPermissions(member.permissions || []);
    if (customPermissions.includes(permission)) {
        return true;
    }
    return false;
}
export function getAllPermissions(member: TeamMember): Permission[] {
    const rolePermissions = ROLE_PERMISSIONS[member.role] || [];
    const customPermissions = toPermissions(member.permissions || []);
    return [...new Set([...rolePermissions, ...customPermissions])];
}
export function hasAnyPermission(member: TeamMember, permissions: Permission[]): boolean {
    return permissions.some(permission => hasPermission(member, permission));
}
export function hasAllPermissions(member: TeamMember, permissions: Permission[]): boolean {
    return permissions.every(permission => hasPermission(member, permission));
}
