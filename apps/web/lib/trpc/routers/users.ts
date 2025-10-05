import { z } from 'zod'
import { createTRPCRouter, adminProcedure, staffProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { UserRole, OrganizationRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

export const usersRouter = createTRPCRouter({
  list: staffProcedure
    .input(
      z.object({
        role: z.nativeEnum(UserRole).optional(),
        entityId: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { prisma } = ctx
      const { role, entityId, limit, cursor } = input

  const where: Record<string, unknown> = {}
      if (role) where.role = role
      if (entityId) where.entityId = entityId

      const users = await prisma.user.findMany({
        where,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      let nextCursor: typeof cursor | undefined = undefined
      if (users.length > limit) {
        const nextItem = users.pop()
        nextCursor = nextItem!.id
      }

      return { users, nextCursor }
    }),

  getById: staffProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { prisma } = ctx

      const user = await prisma.user.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          memberships: {
            include: {
              organization: {
                select: { id: true, name: true, slug: true }
              }
            }
          },
          createdAt: true,
          updatedAt: true,
        },
      })

      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' })
      }

      return user
    }),

  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(8),
        role: z.nativeEnum(UserRole),
        organizationId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { session, prisma } = ctx

      // Check if email exists
      const existing = await prisma.user.findUnique({
        where: { email: input.email },
      })

      if (existing) {
        throw new TRPCError({ code: 'CONFLICT', message: 'Email already exists' })
      }

      const hashedPassword = await bcrypt.hash(input.password, 10)

      const user = await prisma.user.create({
        data: {
          name: input.name,
          email: input.email,
          password: hashedPassword,
          role: input.role,
          memberships: input.organizationId ? {
            create: {
              organizationId: input.organizationId,
              role: OrganizationRole.USER
            }
          } : undefined
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          memberships: true
        },
      })

      await prisma.auditLog.create({
        data: {
          action: 'CREATE',
          resource: 'USER',
          resourceId: user.id,
          userId: session.user.id,
        },
      })

      return user
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        email: z.string().email().optional(),
        role: z.nativeEnum(UserRole).optional(),
        entityId: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { session, prisma } = ctx
      const { id, ...data } = input

      // If email is being updated, check uniqueness
      if (data.email) {
        const existing = await prisma.user.findFirst({
          where: {
            email: data.email,
            NOT: { id },
          },
        })

        if (existing) {
          throw new TRPCError({ code: 'CONFLICT', message: 'Email already exists' })
        }
      }

      const user = await prisma.user.update({
        where: { id },
        data,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          memberships: true,
        },
      })

      await prisma.auditLog.create({
        data: {
          action: 'UPDATE',
          resource: 'USER',
          resourceId: id,
          userId: session.user.id,
        },
      })

      return user
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { session, prisma } = ctx

      // Prevent self-deletion
      if (input.id === session.user.id) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot delete your own account',
        })
      }

      await prisma.user.delete({
        where: { id: input.id },
      })

      await prisma.auditLog.create({
        data: {
          action: 'DELETE',
          resource: 'USER',
          resourceId: input.id,
          userId: session.user.id,
        },
      })

      return { success: true }
    }),

  changePassword: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        newPassword: z.string().min(8),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { prisma } = ctx

      const hashedPassword = await bcrypt.hash(input.newPassword, 10)

      await prisma.user.update({
        where: { id: input.userId },
        data: { password: hashedPassword },
      })

      return { success: true }
    }),
})
