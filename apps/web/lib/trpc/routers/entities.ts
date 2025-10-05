import { z } from 'zod'
import { createTRPCRouter, adminProcedure, staffProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { OrganizationStatus, Prisma } from '@prisma/client'

export const entitiesRouter = createTRPCRouter({
  list: staffProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
        status: z.nativeEnum(OrganizationStatus).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { prisma } = ctx
      const { limit, cursor, status } = input

      const where = status ? { status } : {}

      const entities = await prisma.organization.findMany({
        where,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: { memberships: true, reports: true, cases: true },
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

      const entity = await prisma.organization.findUnique({
        where: { id: input.id },
        include: {
          memberships: {
            include: {
              user: {
                select: { id: true, name: true, email: true, role: true },
              },
            },
          },
          _count: {
            select: { reports: true, cases: true, reportSubmissions: true },
          },
        },
      })

      if (!entity) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Organization not found' })
      }

      return entity
    }),

  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        slug: z.string().min(1).max(100),
        uknfCode: z.string().optional(),
        lei: z.string().optional(),
        nip: z.string().optional(),
        krs: z.string().optional(),
        type: z.string().optional(),
        status: z.nativeEnum(OrganizationStatus).default(OrganizationStatus.ACTIVE),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { session, prisma } = ctx

      // Check if slug already exists
      const existing = await prisma.organization.findUnique({
        where: { slug: input.slug },
      })

      if (existing) {
        throw new TRPCError({ code: 'CONFLICT', message: 'Organization slug already exists' })
      }

      const entity = await prisma.organization.create({
        data: input,
      })

      await prisma.auditLog.create({
        data: {
          action: 'CREATE',
          resource: 'ORGANIZATION',
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
        status: z.nativeEnum(OrganizationStatus).optional(),
        uknfCode: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { session, prisma } = ctx
      const { id, ...data } = input

      try {
        const entity = await prisma.organization.update({
          where: { id },
          data,
        })

        await prisma.auditLog.create({
          data: {
            action: 'UPDATE',
            resource: 'ORGANIZATION',
            resourceId: entity.id,
            userId: session.user.id,
          },
        })

        return entity
      } catch (err) {
        // Map Prisma unique constraint error to TRPC conflict error
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
          // Determine which target caused the conflict if available
          const target = (err.meta as { target?: string[] })?.target || []
          const field = Array.isArray(target) && target.length ? target.join(', ') : 'field'
          throw new TRPCError({
            code: 'CONFLICT',
            message: `Unique constraint failed on ${field}`,
          })
        }

        // Re-throw as internal error for other cases
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Failed to update organization' })
      }
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { session, prisma } = ctx

      // Check if organization has memberships
      const membershipCount = await prisma.organizationMembership.count({
        where: { organizationId: input.id },
      })

      if (membershipCount > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot delete organization with associated members',
        })
      }

      await prisma.organization.delete({
        where: { id: input.id },
      })

      await prisma.auditLog.create({
        data: {
          action: 'DELETE',
          resource: 'ORGANIZATION',
          resourceId: input.id,
          userId: session.user.id,
        },
      })

      return { success: true }
    }),
})
