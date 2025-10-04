import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, staffProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const faqRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z.object({
        category: z.string().optional(),
        search: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { prisma } = ctx
      const { category, search, limit, cursor } = input

  const where: Record<string, unknown> = { isPublished: true }

      if (category) {
        where.category = category
      }

      if (search) {
        where.OR = [
          { question: { contains: search, mode: 'insensitive' } },
          { answer: { contains: search, mode: 'insensitive' } },
        ]
      }

      const faqs = await prisma.fAQ.findMany({
        where,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: { id: true, name: true },
          },
          ratings: {
            select: {
              rating: true,
            },
          },
        },
      })

      let nextCursor: typeof cursor | undefined = undefined
      if (faqs.length > limit) {
        const nextItem = faqs.pop()
        nextCursor = nextItem!.id
      }

      // Calculate average rating
      const faqsWithRating = faqs.map(faq => ({
        ...faq,
        avgRating: faq.ratings.length > 0
          ? faq.ratings.reduce((sum, r) => sum + r.rating, 0) / faq.ratings.length
          : null,
        ratingCount: faq.ratings.length,
      }))

      return { faqs: faqsWithRating, nextCursor }
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { prisma } = ctx

      const faq = await prisma.fAQ.findUnique({
        where: { id: input.id },
        include: {
          author: {
            select: { id: true, name: true },
          },
          ratings: {
            select: {
              rating: true,
            },
          },
        },
      })

      if (!faq) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'FAQ not found' })
      }

      return faq
    }),

  create: staffProcedure
    .input(
      z.object({
        question: z.string().min(1),
        answer: z.string().min(1),
        category: z.string().optional(),
        isPublished: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { session, prisma } = ctx

      const faq = await prisma.fAQ.create({
        data: {
          ...input,
          authorId: session.user.id,
        },
      })

      return faq
    }),

  update: staffProcedure
    .input(
      z.object({
        id: z.string(),
        question: z.string().min(1).optional(),
        answer: z.string().min(1).optional(),
        category: z.string().optional(),
        isPublished: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { prisma } = ctx
      const { id, ...data } = input

      const faq = await prisma.fAQ.update({
        where: { id },
        data,
      })

      return faq
    }),

  rate: protectedProcedure
    .input(
      z.object({
        faqId: z.string(),
        rating: z.number().min(1).max(5),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { session, prisma } = ctx

      const rating = await prisma.fAQRating.upsert({
        where: {
          faqId_userId: {
            faqId: input.faqId,
            userId: session.user.id,
          },
        },
        create: {
          faqId: input.faqId,
          userId: session.user.id,
          rating: input.rating,
        },
        update: {
          rating: input.rating,
        },
      })

      return rating
    }),

  getCategories: protectedProcedure.query(async ({ ctx }) => {
    const { prisma } = ctx

    const categories = await prisma.fAQ.findMany({
      where: { 
        isPublished: true,
        category: { not: null },
      },
      select: { category: true },
      distinct: ['category'],
    })

    return categories.map(c => c.category).filter(Boolean)
  }),
})
