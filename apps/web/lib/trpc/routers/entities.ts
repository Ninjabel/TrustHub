import { z } from 'zod'
import { createTRPCRouter, adminProcedure, staffProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const entitiesRouter = createTRPCRouter({
  list: staffProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { prisma } = ctx
      const { limit, cursor } = input

      const entities = await prisma.entity.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: { users: true, reports: true, cases: true },
          },
        },
      })

      let nextCursor: typeof cursor | undefined = undefined
      if (entities.length > limit) {
        const nextItem = entities.pop()
        nextCursor = nextItem!.id
      }

      return { entities, nextCursor }
    }),

  getById: staffProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { prisma } = ctx

      const entity = await prisma.entity.findUnique({
        where: { id: input.id },
        include: {
          users: {
            select: { id: true, name: true, email: true, role: true },
          },
          _count: {
            select: { reports: true, cases: true },
          },
        },
      })

      if (!entity) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Entity not found' })
      }

      return entity
    }),

  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        code: z.string().min(1).max(20),
        description: z.string().optional(),
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { session, prisma } = ctx

      // Check if code already exists
      const existing = await prisma.entity.findUnique({
        where: { code: input.code },
      })

      if (existing) {
        throw new TRPCError({ code: 'CONFLICT', message: 'Entity code already exists' })
      }

      const entity = await prisma.entity.create({
        data: input,
      })

      await prisma.auditLog.create({
        data: {
          action: 'CREATE',
          resource: 'ENTITY',
          resourceId: entity.id,
          userId: session.user.id,
        },
      })

      return entity
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { session, prisma } = ctx
      const { id, ...data } = input

      const entity = await prisma.entity.update({
        where: { id },
        data,
      })

      await prisma.auditLog.create({
        data: {
          action: 'UPDATE',
          resource: 'ENTITY',
          resourceId: entity.id,
          userId: session.user.id,
        },
      })

      return entity
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { session, prisma } = ctx

      // Check if entity has users
      const userCount = await prisma.user.count({
        where: { entityId: input.id },
      })

      if (userCount > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot delete entity with associated users',
        })
      }

      await prisma.entity.delete({
        where: { id: input.id },
      })

      await prisma.auditLog.create({
        data: {
          action: 'DELETE',
          resource: 'ENTITY',
          resourceId: input.id,
          userId: session.user.id,
        },
      })

      return { success: true }
    }),
})
