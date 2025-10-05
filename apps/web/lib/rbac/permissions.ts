import { UserRole, OrganizationRole } from '@prisma/client'

// Permission strings
export type Permission = 
  // Reports
  | 'reports:submit'
  | 'reports:review'
  | 'reports:validate'
  // Cases
  | 'cases:create'
  | 'cases:handle'
  | 'cases:view_all'
  // Messages
  | 'messages:send'
  | 'messages:reply'
  | 'messages:view_all'
  // Bulletins (Komunikaty)
  | 'bulletin:publish'
  | 'bulletin:view'
  // Library
  | 'library:manage'
  | 'library:view'
  // Entities/Organizations
  | 'entities:view'
  | 'entity:manage_own'
  // Users
  | 'users:manage_all'
  | 'users:manage_own'

// Role → Permissions mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  UKNF_ADMIN: [
    'reports:submit',
    'reports:review',
    'reports:validate',
    'cases:create',
    'cases:handle',
    'cases:view_all',
    'messages:send',
    'messages:reply',
    'messages:view_all',
    'bulletin:publish',
    'bulletin:view',
    'library:manage',
    'library:view',
    'entities:view',
    'entity:manage_own',
    'users:manage_all',
    'users:manage_own',
  ],
  UKNF_EMPLOYEE: [
    'reports:review',
    'cases:handle',
    'cases:view_all',
    'messages:reply',
    'messages:view_all',
    'bulletin:publish',
    'bulletin:view',
    'library:manage',
    'library:view',
    'entities:view',
  ],
  UKNF_INSTITUTION: [
    'reports:review',
    'cases:handle',
    'cases:view_all',
    'messages:reply',
    'messages:view_all',
    'bulletin:publish',
    'bulletin:view',
    'library:manage',
    'library:view',
    'entities:view',
  ],
  ENTITY_ADMIN: [
    'reports:submit',
    'cases:create',
    'messages:send',
    'bulletin:view',
    'library:view',
    'entity:manage_own',
    'users:manage_own',
  ],
  ENTITY_USER: [
    'reports:submit',
    'cases:create',
    'messages:send',
    'bulletin:view',
    'library:view',
  ],
}

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  UKNF_ADMIN: 4,
  UKNF_EMPLOYEE: 3,
  UKNF_INSTITUTION: 3,
  ENTITY_ADMIN: 2,
  ENTITY_USER: 1,
}

export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
}

export function hasPermission(userRole: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[userRole].includes(permission)
}

export function isUKNF(userRole: UserRole): boolean {
  return userRole === UserRole.UKNF_ADMIN || userRole === UserRole.UKNF_EMPLOYEE
}

export function isEntityRole(userRole: UserRole): boolean {
  return userRole === UserRole.ENTITY_ADMIN || userRole === UserRole.ENTITY_USER
}

export function getDefaultDashboard(userRole: UserRole): string {
  return isUKNF(userRole) ? '/dashboard/uknf' : '/dashboard/entity'
}

export function canAccessEntity(
  userRole: UserRole,
  userMemberships: { orgId: string; role: OrganizationRole }[],
  targetOrgId: string | null | undefined
): boolean {
  // UKNF can access all entities
  if (isUKNF(userRole)) {
    return true
  }

  // Entity users can only access their own organizations
  if (!targetOrgId) return false
  return userMemberships.some(m => m.orgId === targetOrgId)
}
