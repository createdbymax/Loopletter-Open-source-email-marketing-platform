import { TeamMember } from './types';

// Define permission types
export type Permission = 
  // Campaign permissions
  | 'campaigns.view'
  | 'campaigns.create'
  | 'campaigns.edit'
  | 'campaigns.delete'
  | 'campaigns.send'
  // Fan/audience permissions
  | 'fans.view'
  | 'fans.create'
  | 'fans.edit'
  | 'fans.delete'
  | 'fans.import'
  | 'fans.export'
  // Segment permissions
  | 'segments.view'
  | 'segments.create'
  | 'segments.edit'
  | 'segments.delete'
  // Analytics permissions
  | 'analytics.view'
  | 'analytics.export'
  // Template permissions
  | 'templates.view'
  | 'templates.create'
  | 'templates.edit'
  | 'templates.delete'
  // Settings permissions
  | 'settings.view'
  | 'settings.edit'
  // Domain permissions
  | 'domain.view'
  | 'domain.manage'
  // Team permissions
  | 'team.view'
  | 'team.invite'
  | 'team.edit'
  | 'team.remove'
  // Billing permissions
  | 'billing.view'
  | 'billing.manage';

// Define role-based permissions
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  owner: [
    // Owner has all permissions
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
    // Admin has all permissions except billing management
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
    // Editor can manage content but not settings or team
    'campaigns.view', 'campaigns.create', 'campaigns.edit', 'campaigns.send',
    'fans.view', 'fans.create', 'fans.edit', 'fans.import',
    'segments.view', 'segments.create', 'segments.edit',
    'analytics.view',
    'templates.view', 'templates.create', 'templates.edit',
    'settings.view',
    'domain.view'
  ],
  viewer: [
    // Viewer can only view content
    'campaigns.view',
    'fans.view',
    'segments.view',
    'analytics.view',
    'templates.view',
    'settings.view',
    'domain.view'
  ]
};

// Type guard to check if a string is a valid permission
function isValidPermission(permission: string): permission is Permission {
  const allPermissions = Object.values(ROLE_PERMISSIONS).flat();
  return allPermissions.includes(permission as Permission);
}

// Helper function to safely convert string[] to Permission[]
function toPermissions(permissions: string[]): Permission[] {
  return permissions.filter(isValidPermission);
}

// Check if a team member has a specific permission
export function hasPermission(member: TeamMember, permission: Permission): boolean {
  // Get base permissions from role
  const rolePermissions = ROLE_PERMISSIONS[member.role] || [];
  
  // Check if the permission is in the role's permissions
  if (rolePermissions.includes(permission)) {
    return true;
  }
  
  // Check if the permission is in the member's custom permissions
  const customPermissions = toPermissions(member.permissions || []);
  if (customPermissions.includes(permission)) {
    return true;
  }
  
  return false;
}

// Get all permissions for a team member
export function getAllPermissions(member: TeamMember): Permission[] {
  const rolePermissions = ROLE_PERMISSIONS[member.role] || [];
  const customPermissions = toPermissions(member.permissions || []);
  
  // Combine and deduplicate permissions
  return [...new Set([...rolePermissions, ...customPermissions])];
}

// Check if a team member has any of the specified permissions
export function hasAnyPermission(member: TeamMember, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(member, permission));
}

// Check if a team member has all of the specified permissions
export function hasAllPermissions(member: TeamMember, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(member, permission));
}