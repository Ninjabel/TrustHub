import { UserRole } from '@prisma/client'

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  ADMIN: 4,
  STAFF: 3,
  ENTITY_ADMIN: 2,
  ENTITY_USER: 1,
}

export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
}

export function isAdmin(userRole: UserRole): boolean {
  return userRole === UserRole.ADMIN
}

export function isStaff(userRole: UserRole): boolean {
  return userRole === UserRole.ADMIN || userRole === UserRole.STAFF
}

export function isEntityAdmin(userRole: UserRole): boolean {
  return hasRole(userRole, UserRole.ENTITY_ADMIN)
}

export function canAccessEntity(
  userRole: UserRole,
  userEntityId: string | null | undefined,
  targetEntityId: string | null | undefined
): boolean {
  // Admins and staff can access all entities
  if (isStaff(userRole)) {
    return true
  }

  // Entity users can only access their own entity
  return userEntityId === targetEntityId
}
