import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { BulletinPriority, BulletinRecipientType } from '@prisma/client'
import { isUKNF, hasPermission } from '@/lib/rbac/permissions'

export const bulletinsRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        cursor: z.string().optional(),
        unreadOnly: z.boolean().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const where: any = {
        publishedAt: { not: null },
      }

      if (input.unreadOnly) {
        where.NOT = {
          reads: {
            some: {
              userId: ctx.session.user.id,
            },
          },
        }
      }

      const bulletins = await ctx.prisma.bulletin.findMany({
        where,
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { publishedAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          reads: {
            where: { userId: ctx.session.user.id },
            take: 1,
          },
          _count: {
            select: { reads: true },
          },
        },
      })

      let nextCursor: string | undefined
      if (bulletins.length > input.limit) {
        const nextItem = bulletins.pop()
        nextCursor = nextItem!.id
      }

      return {
        items: bulletins.map((b) => ({
          ...b,
          isRead: b.reads.length > 0,
          readCount: b._count.reads,
        })),
        nextCursor,
      }
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const bulletin = await ctx.prisma.bulletin.findUnique({
        where: { id: input.id },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          reads: {
            where: { userId: ctx.session.user.id },
          },
          _count: {
            select: { reads: true },
          },
        },
      })

      if (!bulletin || !bulletin.publishedAt) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Bulletin not found',
        })
      }

      return {
        ...bulletin,
        isRead: bulletin.reads.length > 0,
        readCount: bulletin._count.reads,
      }
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        body: z.string().min(1),
        priority: z.nativeEnum(BulletinPriority),
        recipientType: z.nativeEnum(BulletinRecipientType),
        recipientFilter: z.string().optional(),
        requireReadReceipt: z.boolean(),
        attachments: z.array(z.string()).optional(),
        publish: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!hasPermission(ctx.session.user.role, 'bulletin:publish')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to create bulletins',
        })
      }

      const bulletin = await ctx.prisma.bulletin.create({
        data: {
          title: input.title,
          body: input.body,
          priority: input.priority,
          recipientType: input.recipientType,
          recipientFilter: input.recipientFilter,
          requireReadReceipt: input.requireReadReceipt,
          attachments: input.attachments || [],
          authorId: ctx.session.user.id,
          publishedAt: input.publish ? new Date() : null,
        },
      })

      return bulletin
    }),

  markAsRead: protectedProcedure
    .input(z.object({ bulletinId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Get current organization context
      const currentOrgId = ctx.session.user.currentOrgId

      await ctx.prisma.bulletinRead.upsert({
        where: {
          bulletinId_userId: {
            bulletinId: input.bulletinId,
            userId: ctx.session.user.id,
          },
        },
        create: {
          bulletinId: input.bulletinId,
          userId: ctx.session.user.id,
          organizationId: currentOrgId,
        },
        update: {
          readAt: new Date(),
        },
      })

      return { success: true }
    }),

  getReadReceipts: protectedProcedure
    .input(z.object({ bulletinId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!isUKNF(ctx.session.user.role)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only UKNF can view read receipts',
        })
      }

      const reads = await ctx.prisma.bulletinRead.findMany({
        where: { bulletinId: input.bulletinId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { readAt: 'desc' },
      })

      return reads
    }),
})
