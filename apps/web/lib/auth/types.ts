import { type DefaultSession } from 'next-auth'
import { UserRole, OrganizationRole } from '@prisma/client'

export interface OrganizationMembership {
  orgId: string
  role: OrganizationRole
  orgName?: string
  orgSlug?: string
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: UserRole
      isSystemAccount?: boolean
      memberships: OrganizationMembership[]
      currentOrgId?: string | null
    } & DefaultSession['user']
  }

  interface User {
    id: string
    role: UserRole
    isSystemAccount?: boolean
    memberships?: OrganizationMembership[]
    currentOrgId?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: UserRole
    isSystemAccount?: boolean
    memberships: OrganizationMembership[]
    currentOrgId?: string | null
  }
}
