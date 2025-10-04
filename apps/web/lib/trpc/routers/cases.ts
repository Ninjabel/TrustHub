import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, staffProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { CaseStatus, CasePriority } from '@prisma/client'

export const casesRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z.object({
        status: z.nativeEnum(CaseStatus).optional(),
        priority: z.nativeEnum(CasePriority).optional(),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { session, prisma } = ctx
      const { status, priority, limit, cursor } = input

  const where: Record<string, unknown> = {}

      // Entity users see only their cases
      if (session.user.role === 'ENTITY_USER' || session.user.role === 'ENTITY_ADMIN') {
        where.OR = [
          { createdById: session.user.id },
          { assignedToId: session.user.id },
        ]
      }

      if (status) where.status = status
      if (priority) where.priority = priority

      const cases = await prisma.case.findMany({
        where,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: {
            select: { id: true, name: true, email: true },
          },
          assignedTo: {
            select: { id: true, name: true, email: true },
          },
          entity: {
            select: { id: true, name: true, code: true },
          },
        },
      })

      let nextCursor: typeof cursor | undefined = undefined
      if (cases.length > limit) {
        const nextItem = cases.pop()
        nextCursor = nextItem!.id
      }

      return { cases, nextCursor }
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { session, prisma } = ctx

      const caseData = await prisma.case.findUnique({
        where: { id: input.id },
        include: {
          createdBy: { select: { id: true, name: true, email: true } },
          assignedTo: { select: { id: true, name: true, email: true } },
          entity: { select: { id: true, name: true, code: true } },
          timeline: {
            orderBy: { createdAt: 'asc' },
          },
        },
      })

      if (!caseData) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Case not found' })
      }

      // Check access
      if (
        session.user.role === 'ENTITY_USER' &&
        caseData.createdById !== session.user.id &&
        caseData.assignedToId !== session.user.id
      ) {
        throw new TRPCError({ code: 'FORBIDDEN' })
      }

      return caseData
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        priority: z.nativeEnum(CasePriority).default(CasePriority.MEDIUM),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { session, prisma } = ctx

      const caseData = await prisma.case.create({
        data: {
          title: input.title,
          description: input.description,
          priority: input.priority,
          createdById: session.user.id,
          entityId: session.user.entityId,
          timeline: {
            create: {
              event: 'Case created',
              details: `Created by ${session.user.name}`,
            },
          },
        },
      })

      await prisma.auditLog.create({
        data: {
          action: 'CREATE',
          resource: 'CASE',
          resourceId: caseData.id,
          userId: session.user.id,
        },
      })

      return caseData
    }),

  updateStatus: staffProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.nativeEnum(CaseStatus),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { prisma } = ctx

      const caseData = await prisma.case.update({
        where: { id: input.id },
        data: {
          status: input.status,
          closedAt: input.status === CaseStatus.DONE || input.status === CaseStatus.CANCELLED
            ? new Date()
            : undefined,
        },
      })

      await prisma.caseTimeline.create({
        data: {
          caseId: input.id,
          event: 'Status updated',
          details: `Status changed to ${input.status}`,
        },
      })

      return caseData
    }),

  assign: staffProcedure
    .input(
      z.object({
        id: z.string(),
        assignToId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { prisma } = ctx

      const caseData = await prisma.case.update({
        where: { id: input.id },
        data: { assignedToId: input.assignToId },
      })

      await prisma.caseTimeline.create({
        data: {
          caseId: input.id,
          event: 'Case assigned',
          details: `Assigned to user ${input.assignToId}`,
        },
      })

      return caseData
    }),

  addTimelineEvent: protectedProcedure
    .input(
      z.object({
        caseId: z.string(),
        event: z.string(),
        details: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { prisma } = ctx

      const timelineEvent = await prisma.caseTimeline.create({
        data: {
          caseId: input.caseId,
          event: input.event,
          details: input.details,
        },
      })

      return timelineEvent
    }),
})
