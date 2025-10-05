import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const accessRequestsRouter = createTRPCRouter({
  // Get all access requests with filters
  list: protectedProcedure
    .input(
      z.object({
        status: z.enum(['PENDING', 'IN_PROGRESS', 'APPROVED', 'REJECTED', 'BLOCKED']).optional(),
        organizationId: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor, status, organizationId } = input

      const where = {
        ...(status && { status }),
        ...(organizationId && { organizationId }),
      }

      const requests = await ctx.prisma.accessRequest.findMany({
        where,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              pesel: true,
            },
          },
          organization: {
            select: {
              id: true,
              name: true,
              uknfCode: true,
            },
          },
        },
      })

      let nextCursor: typeof cursor | undefined = undefined
      if (requests.length > limit) {
        const nextItem = requests.pop()
        nextCursor = nextItem!.id
      }

      return {
        requests,
        nextCursor,
      }
    }),

  // Get single access request by ID
  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const request = await ctx.prisma.accessRequest.findUnique({
        where: { id: input.id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              pesel: true,
            },
          },
          organization: {
            select: {
              id: true,
              name: true,
              uknfCode: true,
              nip: true,
              krs: true,
            },
          },
        },
      })

      if (!request) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Access request not found',
        })
      }

      return request
    }),

  // Create new access request
  create: protectedProcedure
    .input(
      z.object({
        organizationId: z.string(),
        requestedRole: z.enum(['ADMIN', 'USER']).optional(),
        permissions: z.array(z.string()),
        justification: z.string().min(10),
        attachments: z.array(z.string()).default([]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const request = await ctx.prisma.accessRequest.create({
        data: {
          userId: ctx.session.user.id,
          organizationId: input.organizationId,
          requestedRole: input.requestedRole,
          permissions: input.permissions,
          justification: input.justification,
          attachments: input.attachments,
          status: 'PENDING',
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      // Create audit log
      await ctx.prisma.auditLog.create({
        data: {
          action: 'CREATE',
          resource: 'AccessRequest',
          resourceId: request.id,
          details: `Created access request for ${input.organizationId ? 'organization' : 'system access'}`,
          userId: ctx.session.user.id,
        },
      })

      return request
    }),

  // Update access request status (UKNF Admin only)
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(['PENDING', 'IN_PROGRESS', 'APPROVED', 'REJECTED', 'BLOCKED']),
        uknfComment: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is UKNF Admin
      if (ctx.session.user.role !== 'UKNF_ADMIN' && ctx.session.user.role !== 'UKNF_EMPLOYEE') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only UKNF staff can update access request status',
        })
      }

      const request = await ctx.prisma.accessRequest.update({
        where: { id: input.id },
        data: {
          status: input.status,
          uknfComment: input.uknfComment,
          reviewedById: ctx.session.user.id,
          reviewedAt: new Date(),
        },
        include: {
          user: true,
          organization: true,
        },
      })

      // If approved, create organization membership
      if (input.status === 'APPROVED' && request.organizationId && request.requestedRole) {
        await ctx.prisma.organizationMembership.create({
          data: {
            userId: request.userId,
            organizationId: request.organizationId,
            role: request.requestedRole,
          },
        })
      }

      // Create audit log
      await ctx.prisma.auditLog.create({
        data: {
          action: 'UPDATE',
          resource: 'AccessRequest',
          resourceId: request.id,
          details: `Updated status to ${input.status}`,
          userId: ctx.session.user.id,
        },
      })

      return request
    }),

  // Get stats for dashboard
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const [total, pending, inProgress, approved, rejected] = await Promise.all([
      ctx.prisma.accessRequest.count(),
      ctx.prisma.accessRequest.count({ where: { status: 'PENDING' } }),
      ctx.prisma.accessRequest.count({ where: { status: 'IN_PROGRESS' } }),
      ctx.prisma.accessRequest.count({ where: { status: 'APPROVED' } }),
      ctx.prisma.accessRequest.count({ where: { status: 'REJECTED' } }),
    ])

    return {
      total,
      pending,
      inProgress,
      approved,
      rejected,
    }
  }),
})
