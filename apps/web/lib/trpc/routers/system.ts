import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

/**
 * System Router - for UKNF_INSTITUTION automated actions
 * Only accessible by the system account (isSystemAccount = true)
 */
export const systemRouter = createTRPCRouter({
  /**
   * Update report status - automated validation/approval
   */
  updateReportStatus: protectedProcedure
    .input(
      z.object({
        reportId: z.string(),
        newStatus: z.enum(['DRAFT', 'PROCESSING', 'SUCCESS', 'RULE_ERROR', 'SYSTEM_ERROR']),
        errorMessage: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Only UKNF_INSTITUTION can use this endpoint
      if (ctx.session.user.role !== 'UKNF_INSTITUTION') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only the UKNF institutional account can perform system actions',
        })
      }

      const report = await ctx.prisma.report.update({
        where: { id: input.reportId },
        data: {
          status: input.newStatus,
          errorMessage: input.errorMessage,
          processedAt: new Date(),
        },
      })

      // Log the action
      await ctx.prisma.auditLog.create({
        data: {
          action: 'REPORT_STATUS_UPDATED',
          resource: 'Report',
          resourceId: input.reportId,
          details: JSON.stringify({
            status: input.newStatus,
            errorMessage: input.errorMessage,
            source: 'automation',
            actor: 'UKNF (system)',
          }),
          userId: ctx.session.user.id,
        },
      })

      return report
    }),

  /**
   * Create system announcement
   */
  createSystemAnnouncement: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        body: z.string(),
        priority: z.enum(['LOW', 'NORMAL', 'HIGH']),
        recipientType: z.enum(['ALL', 'BY_TYPE', 'BY_ENTITY', 'BY_GROUP']),
        recipientFilter: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== 'UKNF_INSTITUTION') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only the UKNF institutional account can create system announcements',
        })
      }

      const bulletin = await ctx.prisma.bulletin.create({
        data: {
          title: input.title,
          body: input.body,
          priority: input.priority,
          recipientType: input.recipientType,
          recipientFilter: input.recipientFilter,
          authorId: ctx.session.user.id,
          publishedAt: new Date(),
        },
      })

      await ctx.prisma.auditLog.create({
        data: {
          action: 'SYSTEM_ANNOUNCEMENT_CREATED',
          resource: 'Bulletin',
          resourceId: bulletin.id,
          details: JSON.stringify({
            source: 'automation',
            actor: 'UKNF (system)',
            actionType: 'System Publication',
          }),
          userId: ctx.session.user.id,
        },
      })

      return bulletin
    }),

  /**
   * Get system overview statistics
   */
  getSystemOverview: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.session.user.role !== 'UKNF_INSTITUTION') {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Only the UKNF institutional account can access system overview',
      })
    }

    // Get recent audit logs for this system account
    const recentActions = await ctx.prisma.auditLog.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
      select: {
        id: true,
        action: true,
        resource: true,
        resourceId: true,
        createdAt: true,
        details: true,
      },
    })

    // Get system statistics
    const [
      totalReports,
      processingReports,
      totalEntities,
      activeEntities,
      totalUsers,
    ] = await Promise.all([
      ctx.prisma.report.count(),
      ctx.prisma.report.count({ where: { status: 'PROCESSING' } }),
      ctx.prisma.organization.count(),
      ctx.prisma.organization.count({ where: { status: 'ACTIVE' } }),
      ctx.prisma.user.count({ where: { isSystemAccount: false } }),
    ])

    return {
      statistics: {
        totalReports,
        processingReports,
        totalEntities,
        activeEntities,
        totalUsers,
      },
      recentActions: recentActions.map((action) => ({
        ...action,
        parsedDetails: action.details ? JSON.parse(action.details as string) : {},
      })),
      systemInfo: {
        accountName: ctx.session.user.name,
        accountEmail: ctx.session.user.email,
        uptime: process.uptime(),
      },
    }
  }),

  /**
   * Validate report submission (automated)
   */
  validateReportSubmission: protectedProcedure
    .input(
      z.object({
        submissionId: z.string(),
        isValid: z.boolean(),
        validationReport: z.string().optional(),
        errorDetails: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== 'UKNF_INSTITUTION') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only the UKNF institutional account can validate submissions',
        })
      }

      const submission = await ctx.prisma.reportSubmission.update({
        where: { id: input.submissionId },
        data: {
          status: input.isValid ? 'SUCCESS' : 'RULE_ERROR',
          validationReport: input.validationReport,
          errorDetails: input.errorDetails,
          validatedAt: new Date(),
        },
      })

      await ctx.prisma.auditLog.create({
        data: {
          action: 'SUBMISSION_VALIDATED',
          resource: 'ReportSubmission',
          resourceId: input.submissionId,
          details: JSON.stringify({
            status: input.isValid ? 'SUCCESS' : 'RULE_ERROR',
            isValid: input.isValid,
            source: 'automation',
            actor: 'UKNF (system)',
            actionType: 'System Validation',
          }),
          userId: ctx.session.user.id,
        },
      })

      return submission
    }),

  /**
   * Send automated notification
   */
  sendAutomatedNotification: protectedProcedure
    .input(
      z.object({
        threadSubject: z.string(),
        messageBody: z.string(),
        organizationId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== 'UKNF_INSTITUTION') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Only the UKNF institutional account can send automated notifications',
        })
      }

      const thread = await ctx.prisma.messageThread.create({
        data: {
          subject: input.threadSubject,
          status: 'OPEN',
          createdById: ctx.session.user.id,
          organizationId: input.organizationId,
          messages: {
            create: {
              body: input.messageBody,
              senderId: ctx.session.user.id,
              attachments: [],
            },
          },
        },
        include: {
          messages: true,
        },
      })

      await ctx.prisma.auditLog.create({
        data: {
          action: 'AUTOMATED_NOTIFICATION_SENT',
          resource: 'MessageThread',
          resourceId: thread.id,
          details: JSON.stringify({
            source: 'automation',
            actor: 'UKNF (system)',
            actionType: 'Auto Notification',
          }),
          userId: ctx.session.user.id,
        },
      })

      return thread
    }),
})
