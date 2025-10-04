import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, staffProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const announcementsRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { prisma, session } = ctx
      const { limit, cursor } = input

      const announcements = await prisma.announcement.findMany({
        where: { isPublished: true },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { publishedAt: 'desc' },
        include: {
          author: {
            select: { id: true, name: true, email: true },
          },
          reads: {
            where: { userId: session.user.id },
            select: { readAt: true },
          },
        },
      })

      let nextCursor: typeof cursor | undefined = undefined
      if (announcements.length > limit) {
        const nextItem = announcements.pop()
        nextCursor = nextItem!.id
      }

      return {
        announcements: announcements.map(a => ({
          ...a,
          isRead: a.reads.length > 0,
        })),
        nextCursor,
      }
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { prisma } = ctx

      const announcement = await prisma.announcement.findUnique({
        where: { id: input.id },
        include: {
          author: {
            select: { id: true, name: true, email: true },
          },
        },
      })

      if (!announcement) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Announcement not found' })
      }

      return announcement
    }),

  create: staffProcedure
    .input(
      z.object({
        title: z.string().min(1),
        content: z.string().min(1),
        publish: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { session, prisma } = ctx

      const announcement = await prisma.announcement.create({
        data: {
          title: input.title,
          content: input.content,
          isPublished: input.publish,
          publishedAt: input.publish ? new Date() : null,
          authorId: session.user.id,
        },
      })

      return announcement
    }),

  publish: staffProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { prisma } = ctx

      const announcement = await prisma.announcement.update({
        where: { id: input.id },
        data: {
          isPublished: true,
          publishedAt: new Date(),
        },
      })

      return announcement
    }),

  markAsRead: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { session, prisma } = ctx

      const read = await prisma.announcementRead.upsert({
        where: {
          announcementId_userId: {
            announcementId: input.id,
            userId: session.user.id,
          },
        },
        create: {
          announcementId: input.id,
          userId: session.user.id,
        },
        update: {
          readAt: new Date(),
        },
      })

      return read
    }),

  getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
    const { session, prisma } = ctx

    const count = await prisma.announcement.count({
      where: {
        isPublished: true,
        reads: {
          none: {
            userId: session.user.id,
          },
        },
      },
    })

    return count
  }),
})
