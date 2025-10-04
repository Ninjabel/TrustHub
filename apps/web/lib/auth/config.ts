import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'
import type { OrganizationMembership } from './types'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { 
            memberships: {
              include: {
                organization: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                  }
                }
              }
            }
          },
        })

        if (!user) {
          throw new Error('Invalid credentials')
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error('Invalid credentials')
        }

        const memberships: OrganizationMembership[] = user.memberships.map(m => ({
          orgId: m.organizationId,
          role: m.role,
          orgName: m.organization.name,
          orgSlug: m.organization.slug,
        }))

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          memberships,
          currentOrgId: memberships[0]?.orgId || null,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.memberships = user.memberships || []
        token.currentOrgId = user.currentOrgId || null
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.memberships = token.memberships
        session.user.currentOrgId = token.currentOrgId
      }
      return session
    },
  },
  pages: {
    signIn: '/signin',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
}
