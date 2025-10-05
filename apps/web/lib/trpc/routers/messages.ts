import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const messagesRouter = createTRPCRouter({
  listThreads: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { prisma } = ctx
      const { limit, cursor } = input

      const threads = await prisma.messageThread.findMany({
        where: { status: { not: 'CLOSED' } },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { updatedAt: 'desc' },
        include: {
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            include: {
              sender: {
                select: { id: true, name: true, email: true },
              },
            },
          },
          _count: {
            select: { messages: true },
          },
        },
      })

      let nextCursor: typeof cursor | undefined = undefined
      if (threads.length > limit) {
        const nextItem = threads.pop()
        nextCursor = nextItem!.id
      }

      return {
        threads,
        nextCursor,
      }
    }),

  getThread: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { prisma } = ctx

      const thread = await prisma.messageThread.findUnique({
        where: { id: input.id },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            include: {
              sender: {
                select: { id: true, name: true, email: true, role: true },
              },
            },
          },
        },
      })

      if (!thread) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Thread not found' })
      }

      return thread
    }),

  createThread: protectedProcedure
    .input(
      z.object({
        subject: z.string().min(1),
        content: z.string().min(1),
        attachments: z.array(z.string()).default([]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { session, prisma } = ctx

      const thread = await prisma.messageThread.create({
        data: {
          subject: input.subject,
          createdById: session.user.id,
          messages: {
            create: {
              body: input.content,
              senderId: session.user.id,
              attachments: input.attachments,
            },
          },
        },
        include: {
          messages: true,
        },
      })

      await prisma.auditLog.create({
        data: {
          action: 'CREATE',
          resource: 'MESSAGE_THREAD',
          resourceId: thread.id,
          userId: session.user.id,
        },
      })

      return thread
    }),

  replyToThread: protectedProcedure
    .input(
      z.object({
        threadId: z.string(),
        content: z.string().min(1),
        attachments: z.array(z.string()).default([]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { session, prisma } = ctx

      const thread = await prisma.messageThread.findUnique({
        where: { id: input.threadId },
      })

      if (!thread) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Thread not found' })
      }

      if (thread.status === 'CLOSED') {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Thread is closed' })
      }

      const message = await prisma.message.create({
        data: {
          body: input.content,
          threadId: input.threadId,
          senderId: session.user.id,
          attachments: input.attachments,
        },
        include: {
          sender: {
            select: { id: true, name: true, email: true },
          },
        },
      })

      // Update thread's updatedAt
      await prisma.messageThread.update({
        where: { id: input.threadId },
        data: { updatedAt: new Date() },
      })

      return message
    }),

  closeThread: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { session, prisma } = ctx

      const thread = await prisma.messageThread.update({
        where: { id: input.id },
        data: { status: 'CLOSED' },
      })

      await prisma.auditLog.create({
        data: {
          action: 'UPDATE',
          resource: 'MESSAGE_THREAD',
          resourceId: input.id,
          details: 'Thread closed',
          userId: session.user.id,
        },
      })

      return thread
    }),
})
