import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, staffProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { ReportStatus, UserRole } from '@prisma/client'

export const reportsRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z.object({
        status: z.nativeEnum(ReportStatus).optional(),
        limit: z.number().min(1).max(100).default(10),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { session, prisma } = ctx
      const { status, limit, cursor } = input

  const where: Record<string, unknown> = {}
      
      // Entity users can only see their organization's reports
      if (session.user.role === 'ENTITY_USER' || session.user.role === 'ENTITY_ADMIN') {
        const userOrgIds = session.user.memberships.map(m => m.orgId)
        
        if (userOrgIds.length === 0) {
          throw new TRPCError({ 
            code: 'FORBIDDEN', 
            message: 'No organization membership found' 
          })
        }
        
        where.organizationId = { in: userOrgIds }
      }

      if (status) {
        where.status = status
      }

      const reports = await prisma.report.findMany({
        where,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          organization: {
            select: { id: true, name: true, slug: true },
          },
        },
      })

      let nextCursor: typeof cursor | undefined = undefined
      if (reports.length > limit) {
        const nextItem = reports.pop()
        nextCursor = nextItem!.id
      }

      return {
        reports,
        nextCursor,
      }
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { session, prisma } = ctx

      const report = await prisma.report.findUnique({
        where: { id: input.id },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          organization: {
            select: { id: true, name: true, slug: true },
          },
        },
      })

      if (!report) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Report not found' })
      }

      // Check access
      if (
        (session.user.role === UserRole.ENTITY_USER || session.user.role === UserRole.ENTITY_ADMIN) &&
        report.organizationId &&
        !session.user.memberships.some(m => m.orgId === report.organizationId)
      ) {
        throw new TRPCError({ code: 'FORBIDDEN' })
      }

      return report
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        fileName: z.string(),
        fileUrl: z.string(),
        fileSize: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { session, prisma } = ctx

      // Get current organization ID
      const organizationId = session.user.currentOrgId || 
        (session.user.memberships.length > 0 ? session.user.memberships[0].orgId : null);

      const report = await prisma.report.create({
        data: {
          ...input,
          status: ReportStatus.DRAFT,
          userId: session.user.id,
          organizationId
        },
      })

      // Create audit log
      await prisma.auditLog.create({
        data: {
          action: 'CREATE',
          resource: 'REPORT',
          resourceId: report.id,
          userId: session.user.id,
        },
      })

      return report
    }),

  updateStatus: staffProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.nativeEnum(ReportStatus),
        errorMessage: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { session, prisma } = ctx

      const report = await prisma.report.update({
        where: { id: input.id },
        data: {
          status: input.status,
          errorMessage: input.errorMessage,
          processedAt: input.status === ReportStatus.SUCCESS ? new Date() : undefined,
        },
      })

      await prisma.auditLog.create({
        data: {
          action: 'UPDATE',
          resource: 'REPORT',
          resourceId: report.id,
          details: `Status changed to ${input.status}`,
          userId: session.user.id,
        },
      })

      return report
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { session, prisma } = ctx

      const report = await prisma.report.findUnique({
        where: { id: input.id },
      })

      if (!report) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }

      // Check permissions
      if (
        report.userId !== session.user.id &&
        session.user.role !== UserRole.UKNF_ADMIN &&
        session.user.role !== UserRole.UKNF_EMPLOYEE
      ) {
        throw new TRPCError({ code: 'FORBIDDEN' })
      }

      await prisma.report.delete({
        where: { id: input.id },
      })

      await prisma.auditLog.create({
        data: {
          action: 'DELETE',
          resource: 'REPORT',
          resourceId: input.id,
          userId: session.user.id,
        },
      })

      return { success: true }
    }),
})
