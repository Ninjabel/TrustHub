import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, adminProcedure } from '../trpc'

export const auditRouter = createTRPCRouter({
  // Get audit logs (admin only)
  list: adminProcedure
    .input(
      z.object({
        resource: z.string().optional(),
        resourceId: z.string().optional(),
        userId: z.string().optional(),
        limit: z.number().min(1).max(200).default(100),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor, resource, resourceId, userId } = input

      const where = {
        ...(resource && { resource }),
        ...(resourceId && { resourceId }),
        ...(userId && { userId }),
      }

      const logs = await ctx.prisma.auditLog.findMany({
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
            },
          },
        },
      })

      let nextCursor: typeof cursor | undefined = undefined
      if (logs.length > limit) {
        const nextItem = logs.pop()
        nextCursor = nextItem!.id
      }

      return {
        logs,
        nextCursor,
      }
    }),

  // Create audit log entry
  create: protectedProcedure
    .input(
      z.object({
        action: z.string(),
        resource: z.string(),
        resourceId: z.string().optional(),
        details: z.string().optional(),
        ipAddress: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const log = await ctx.prisma.auditLog.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
        },
      })

      return log
    }),

  // Get recent activity for dashboard
  recentActivity: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(10) }))
    .query(async ({ ctx, input }) => {
      const logs = await ctx.prisma.auditLog.findMany({
        take: input.limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      return logs
    }),
})
