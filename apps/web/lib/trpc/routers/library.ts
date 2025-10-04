import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, staffProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const libraryRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { prisma } = ctx
      const { search, limit, cursor } = input

  const where: Record<string, unknown> = {}

      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ]
      }

      const files = await prisma.libraryFile.findMany({
        where,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
          uploadedBy: {
            select: { id: true, name: true, email: true },
          },
        },
      })

      let nextCursor: typeof cursor | undefined = undefined
      if (files.length > limit) {
        const nextItem = files.pop()
        nextCursor = nextItem!.id
      }

      return { files, nextCursor }
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { prisma } = ctx

      const file = await prisma.libraryFile.findUnique({
        where: { id: input.id },
        include: {
          uploadedBy: {
            select: { id: true, name: true, email: true },
          },
        },
      })

      if (!file) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'File not found' })
      }

      return file
    }),

  upload: staffProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        fileName: z.string(),
        fileUrl: z.string(),
        fileSize: z.number(),
        mimeType: z.string(),
        version: z.string().default('1.0'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { session, prisma } = ctx

      const file = await prisma.libraryFile.create({
        data: {
          ...input,
          uploadedById: session.user.id,
        },
      })

      await prisma.auditLog.create({
        data: {
          action: 'CREATE',
          resource: 'LIBRARY_FILE',
          resourceId: file.id,
          userId: session.user.id,
        },
      })

      return file
    }),

  delete: staffProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { session, prisma } = ctx

      await prisma.libraryFile.delete({
        where: { id: input.id },
      })

      await prisma.auditLog.create({
        data: {
          action: 'DELETE',
          resource: 'LIBRARY_FILE',
          resourceId: input.id,
          userId: session.user.id,
        },
      })

      return { success: true }
    }),
})
