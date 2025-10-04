import { type DefaultSession } from 'next-auth'
import { UserRole } from '@prisma/client'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: UserRole
      entityId?: string | null
    } & DefaultSession['user']
  }

  interface User {
    id: string
    role: UserRole
    entityId?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: UserRole
    entityId?: string | null
  }
}
