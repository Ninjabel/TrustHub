import { prisma } from '@/lib/db'
import { UserRole } from '@prisma/client'

/**
 * Get the UKNF institutional account user object
 * 
 * @returns User object for the institutional account
 * @throws Error if account not found
 * 
 * @example
 * ```typescript
 * const systemUser = await getSystemUser()
 * console.log('System account ID:', systemUser.id)
 * ```
 */
export async function getSystemUser() {
  const systemUser = await prisma.user.findUnique({
    where: { email: 'system@uknf.gov.pl' },
  })

  if (!systemUser) {
    throw new Error('UKNF institutional account not found. Please run database seed.')
  }

  if (systemUser.role !== UserRole.UKNF_INSTITUTION) {
    throw new Error('Account exists but does not have UKNF_INSTITUTION role')
  }

  return systemUser
}

/**
 * Check if a user ID belongs to the system account
 * 
 * @param userId - User ID to check
 * @returns true if the user is the system account
 * 
 * @example
 * ```typescript
 * if (await isSystemUser(userId)) {
 *   console.log('This is a system-initiated action')
 * }
 * ```
 */
export async function isSystemUser(userId: string): Promise<boolean> {
  const systemUser = await prisma.user.findUnique({
    where: { email: 'system@uknf.gov.pl' },
    select: { id: true },
  })

  return systemUser?.id === userId
}

/**
 * Create a mock session for the system account
 * Used for creating system-level operations
 * 
 * @returns Session object for system account
 * 
 * @example
 * ```typescript
 * const systemSession = await createSystemSession()
 * // Use this session to create a context for system operations
 * ```
 */
export async function createSystemSession() {
  const systemUser = await getSystemUser()

  return {
    user: {
      id: systemUser.id,
      email: systemUser.email,
      name: systemUser.name,
      role: systemUser.role,
      isSystemAccount: true,
      memberships: [],
      currentOrgId: null,
    },
    expires: new Date(Date.now() + 1000 * 60 * 60).toISOString(), // 1 hour
  }
}
