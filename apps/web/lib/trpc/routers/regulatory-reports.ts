import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, staffProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { 
  Prisma,
  RegulatoryReportStatus, 
  RegulatoryReportType,
  UserRole 
} from '@prisma/client'
import { isUKNF, canAccessEntity } from '@/lib/rbac/permissions'

/**
 * Regulatory Reports Router
 * Handles report submissions, validations, corrections, and calendar
 */
export const regulatoryReportsRouter = createTRPCRouter({
  
  /**
   * List regulatory reports with filters
   */
  list: protectedProcedure
    .input(
      z.object({
        // Filters
        status: z.nativeEnum(RegulatoryReportStatus).optional(),
        reportType: z.nativeEnum(RegulatoryReportType).optional(),
        period: z.string().optional(),
        isArchived: z.boolean().optional(),
        search: z.string().optional(),
        dateFrom: z.date().optional(),
        dateTo: z.date().optional(),
        organizationId: z.string().optional(),
        userId: z.string().optional(), // Filter by submitter
        
        // Pagination
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
        
        // Sorting
        sortBy: z.enum(['submittedAt', 'validatedAt', 'period', 'status']).default('submittedAt'),
        sortOrder: z.enum(['asc', 'desc']).default('desc'),
      })
    )
    .query(async ({ ctx, input }) => {
      const { session, prisma } = ctx
      const { 
        status, reportType, period, isArchived, search, 
        dateFrom, dateTo, organizationId, userId,
        limit, cursor, sortBy, sortOrder 
      } = input

      // Build where clause based on role and filters
      const where: Prisma.RegulatoryReportWhereInput = {}

      // Role-based access control
      if (!isUKNF(session.user.role as UserRole)) {
        // Entity users can only see their organization's reports
        const userOrgIds = session.user.memberships.map(m => m.orgId)
        
        if (userOrgIds.length === 0) {
          throw new TRPCError({ 
            code: 'FORBIDDEN', 
            message: 'No organization membership found' 
          })
        }
        
        where.organizationId = { in: userOrgIds }
        
        // ENTITY_USER can only see their own submissions unless they're admin
        if (session.user.role === 'ENTITY_USER') {
          where.submittedById = session.user.id
        }
      }

      // Apply filters
      if (status) where.status = status
      if (reportType) where.reportType = reportType
      if (period) where.period = period
      if (isArchived !== undefined) where.isArchived = isArchived
      if (organizationId) where.organizationId = organizationId
      if (userId) where.submittedById = userId

      // Date range filter
      if (dateFrom || dateTo) {
        where.submittedAt = {}
        if (dateFrom) where.submittedAt.gte = dateFrom
        if (dateTo) where.submittedAt.lte = dateTo
      }

      // Full-text search
      if (search) {
        where.OR = [
          { fileName: { contains: search, mode: 'insensitive' } },
          { entityCode: { contains: search, mode: 'insensitive' } },
          { entityName: { contains: search, mode: 'insensitive' } },
          { submittedByName: { contains: search, mode: 'insensitive' } },
          { submittedByEmail: { contains: search, mode: 'insensitive' } },
          { validationNotes: { contains: search, mode: 'insensitive' } },
        ]
      }

      // Fetch reports
      const reports = await prisma.regulatoryReport.findMany({
        where,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { [sortBy]: sortOrder },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              uknfCode: true,
            }
          },
          submittedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
          correctedReport: {
            select: {
              id: true,
              fileName: true,
              period: true,
              submittedAt: true,
            }
          },
          corrections: {
            select: {
              id: true,
              fileName: true,
              period: true,
              submittedAt: true,
              status: true,
            },
            orderBy: { submittedAt: 'desc' }
          },
          _count: {
            select: {
              comments: true,
              statusHistory: true,
            }
          }
        },
      })

      let nextCursor: typeof cursor | undefined = undefined
      if (reports.length > limit) {
        const nextItem = reports.pop()
        nextCursor = nextItem!.id
      }

      // Get total count for pagination
      const totalCount = await prisma.regulatoryReport.count({ where })

      return {
        items: reports,
        nextCursor,
        totalCount,
      }
    }),

  /**
   * Get single report details
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { session, prisma } = ctx
      const { id } = input

      const report = await prisma.regulatoryReport.findUnique({
        where: { id },
        include: {
          organization: true,
          submittedBy: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            }
          },
          correctedReport: {
            include: {
              submittedBy: {
                select: { name: true, email: true }
              }
            }
          },
          corrections: {
            include: {
              submittedBy: {
                select: { name: true, email: true }
              }
            },
            orderBy: { submittedAt: 'desc' }
          },
          comments: {
            include: {
              user: {
                select: { name: true, email: true, role: true }
              }
            },
            orderBy: { createdAt: 'desc' }
          },
          statusHistory: {
            orderBy: { createdAt: 'asc' }
          }
        },
      })

      if (!report) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Report not found' })
      }

      // Check access
      if (!isUKNF(session.user.role as UserRole)) {
        if (!canAccessEntity(
          session.user.role as UserRole,
          session.user.memberships,
          report.organizationId
        )) {
          throw new TRPCError({ code: 'FORBIDDEN' })
        }
        
        // ENTITY_USER can only see their own submissions
        if (session.user.role === 'ENTITY_USER' && report.submittedById !== session.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN' })
        }
      }

      return report
    }),

  /**
   * Submit a new report
   */
  create: protectedProcedure
    .input(
      z.object({
        fileName: z.string(),
        fileUrl: z.string(),
        fileSize: z.number(),
        mimeType: z.string().default('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'),
        reportType: z.nativeEnum(RegulatoryReportType),
        period: z.string(),
        organizationId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { session, prisma } = ctx

      // Check access to organization
      if (!isUKNF(session.user.role as UserRole)) {
        if (!canAccessEntity(
          session.user.role as UserRole,
          session.user.memberships,
          input.organizationId
        )) {
          throw new TRPCError({ code: 'FORBIDDEN' })
        }
      }

      // Get organization details
      const organization = await prisma.organization.findUnique({
        where: { id: input.organizationId },
        select: { name: true, uknfCode: true }
      })

      if (!organization) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Organization not found' })
      }

      // Create report
      const report = await prisma.regulatoryReport.create({
        data: {
          fileName: input.fileName,
          fileUrl: input.fileUrl,
          fileSize: input.fileSize,
          mimeType: input.mimeType,
          reportType: input.reportType,
          period: input.period,
          entityCode: organization.uknfCode || '',
          entityName: organization.name,
          organizationId: input.organizationId,
          submittedById: session.user.id,
          submittedByName: session.user.name || '',
          submittedByEmail: session.user.email || '',
          status: RegulatoryReportStatus.DRAFT,
        },
      })

      // Create initial status history
      await prisma.regulatoryReportStatusHistory.create({
        data: {
          reportId: report.id,
          status: RegulatoryReportStatus.DRAFT,
          note: 'Sprawozdanie utworzone',
          changedBy: session.user.id,
        }
      })

      // Audit log
      await prisma.auditLog.create({
        data: {
          action: 'regulatory_report.create',
          resource: 'RegulatoryReport',
          resourceId: report.id,
          userId: session.user.id,
          details: JSON.stringify({
            fileName: input.fileName,
            reportType: input.reportType,
            period: input.period,
            organizationId: input.organizationId,
          }),
        },
      })

      return report
    }),

  /**
   * Submit a correction to existing report
   */
  submitCorrection: protectedProcedure
    .input(
      z.object({
        originalReportId: z.string(),
        fileName: z.string(),
        fileUrl: z.string(),
        fileSize: z.number(),
        mimeType: z.string().default('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { session, prisma } = ctx

      // Get original report
      const originalReport = await prisma.regulatoryReport.findUnique({
        where: { id: input.originalReportId },
      })

      if (!originalReport) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Original report not found' })
      }

      // Check access
      if (!isUKNF(session.user.role as UserRole)) {
        if (!canAccessEntity(
          session.user.role as UserRole,
          session.user.memberships,
          originalReport.organizationId
        )) {
          throw new TRPCError({ code: 'FORBIDDEN' })
        }
      }

      // Create correction report
      const correction = await prisma.regulatoryReport.create({
        data: {
          fileName: input.fileName,
          fileUrl: input.fileUrl,
          fileSize: input.fileSize,
          mimeType: input.mimeType,
          reportType: originalReport.reportType,
          period: originalReport.period,
          entityCode: originalReport.entityCode,
          entityName: originalReport.entityName,
          organizationId: originalReport.organizationId,
          submittedById: session.user.id,
          submittedByName: session.user.name || '',
          submittedByEmail: session.user.email || '',
          status: RegulatoryReportStatus.DRAFT,
          isCorrection: true,
          correctedReportId: originalReport.id,
        },
      })

      // Create status history
      await prisma.regulatoryReportStatusHistory.create({
        data: {
          reportId: correction.id,
          status: RegulatoryReportStatus.DRAFT,
          note: `Korekta sprawozdania ${originalReport.fileName}`,
          changedBy: session.user.id,
        }
      })

      // Audit log
      await prisma.auditLog.create({
        data: {
          action: 'regulatory_report.correction',
          resource: 'RegulatoryReport',
          resourceId: correction.id,
          userId: session.user.id,
          details: JSON.stringify({
            originalReportId: originalReport.id,
            fileName: input.fileName,
          }),
        },
      })

      return correction
    }),

  /**
   * Update report status (UKNF staff only)
   */
  updateStatus: staffProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.nativeEnum(RegulatoryReportStatus),
        note: z.string().optional(),
        validationReportUrl: z.string().optional(),
        validationNotes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { session, prisma } = ctx
      const { id, status, note, validationReportUrl, validationNotes } = input

      const report = await prisma.regulatoryReport.findUnique({
        where: { id },
      })

      if (!report) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }

      // Update report
      const updated = await prisma.regulatoryReport.update({
        where: { id },
        data: {
          status,
          validatedAt: (
            new Set<RegulatoryReportStatus>([
              RegulatoryReportStatus.SUCCESS,
              RegulatoryReportStatus.RULE_ERROR,
              RegulatoryReportStatus.SYSTEM_ERROR,
              RegulatoryReportStatus.TIMEOUT_ERROR,
              RegulatoryReportStatus.REJECTED_BY_UKNF,
            ]).has(status)
          ) ? new Date() : undefined,
          validationReportUrl: validationReportUrl || report.validationReportUrl,
          validationNotes: validationNotes || report.validationNotes,
        },
      })

      // Add status history
      await prisma.regulatoryReportStatusHistory.create({
        data: {
          reportId: id,
          status,
          note,
          changedBy: session.user.id,
        }
      })

      // Audit log
      await prisma.auditLog.create({
        data: {
          action: 'regulatory_report.status_update',
          resource: 'RegulatoryReport',
          resourceId: id,
          userId: session.user.id,
          details: JSON.stringify({
            oldStatus: report.status,
            newStatus: status,
            note,
          }),
        },
      })

      return updated
    }),

  /**
   * Delete report (only DRAFT status, own submissions)
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { session, prisma } = ctx
      const { id } = input

      const report = await prisma.regulatoryReport.findUnique({
        where: { id },
      })

      if (!report) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }

      // Only DRAFT can be deleted
      if (report.status !== RegulatoryReportStatus.DRAFT) {
        throw new TRPCError({ 
          code: 'BAD_REQUEST', 
          message: 'Only draft reports can be deleted' 
        })
      }

      // Check permissions
      if (!isUKNF(session.user.role as UserRole)) {
        // Must be own submission
        if (report.submittedById !== session.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN' })
        }

        // Must have access to organization
        if (!canAccessEntity(
          session.user.role as UserRole,
          session.user.memberships,
          report.organizationId
        )) {
          throw new TRPCError({ code: 'FORBIDDEN' })
        }
      }

      // Delete report
      await prisma.regulatoryReport.delete({
        where: { id },
      })

      // Audit log
      await prisma.auditLog.create({
        data: {
          action: 'regulatory_report.delete',
          resource: 'RegulatoryReport',
          resourceId: id,
          userId: session.user.id,
          details: JSON.stringify({ fileName: report.fileName, period: report.period }),
        },
      })

      return { success: true }
    }),

  /**
   * Add comment to report
   */
  addComment: protectedProcedure
    .input(
      z.object({
        reportId: z.string(),
        comment: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { session, prisma } = ctx
      const { reportId, comment } = input

      const report = await prisma.regulatoryReport.findUnique({
        where: { id: reportId },
      })

      if (!report) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }

      // Check access
      if (!isUKNF(session.user.role as UserRole)) {
        if (!canAccessEntity(
          session.user.role as UserRole,
          session.user.memberships,
          report.organizationId
        )) {
          throw new TRPCError({ code: 'FORBIDDEN' })
        }
      }

      const newComment = await prisma.regulatoryReportComment.create({
        data: {
          reportId,
          userId: session.user.id,
          userName: session.user.name || '',
          userRole: session.user.role as UserRole,
          comment,
        },
        include: {
          user: {
            select: { name: true, email: true, role: true }
          }
        }
      })

      return newComment
    }),

  /**
   * Get reporting calendar
   */
  getCalendar: protectedProcedure
    .input(
      z.object({
        year: z.number().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { prisma } = ctx
      const { year, isActive } = input

  const where: Prisma.ReportingCalendarWhereInput = {}
      if (isActive !== undefined) where.isActive = isActive

      if (year) {
        const startDate = new Date(year, 0, 1)
        const endDate = new Date(year + 1, 0, 1)
        where.dueDate = {
          gte: startDate,
          lt: endDate,
        }
      }

      const calendar = await prisma.reportingCalendar.findMany({
        where,
        orderBy: { dueDate: 'asc' },
      })

      // Calculate completion rates (simplified version - in production, this would be more complex)
      const calendarWithCompletion = await Promise.all(
        calendar.map(async (item) => {
          // Count expected vs submitted reports for this period/type
          // This is a simplified calculation
          const totalOrgs = await prisma.organization.count({
            where: { status: 'ACTIVE' }
          })
          
          const submittedReports = await prisma.regulatoryReport.count({
            where: {
              period: item.period,
              reportType: item.reportType,
              status: { not: RegulatoryReportStatus.DRAFT }
            }
          })

          const completionRate = totalOrgs > 0 ? (submittedReports / totalOrgs) * 100 : 0

          return {
            ...item,
            completionRate: Math.round(completionRate * 100) / 100,
            totalOrganizations: totalOrgs,
            submittedReports,
          }
        })
      )

      return calendarWithCompletion
    }),

  /**
   * Get dashboard statistics
   */
  getStats: protectedProcedure
    .query(async ({ ctx }) => {
      const { session, prisma } = ctx

      const where: Prisma.RegulatoryReportWhereInput = {}

      // Role-based filtering
      if (!isUKNF(session.user.role as UserRole)) {
        const userOrgIds = session.user.memberships.map(m => m.orgId)
        where.organizationId = { in: userOrgIds }
        
        if (session.user.role === 'ENTITY_USER') {
          where.submittedById = session.user.id
        }
      }

      const [
        total,
        draft,
        submitted,
        inProgress,
        success,
        errors,
        archived,
      ] = await Promise.all([
        prisma.regulatoryReport.count({ where }),
        prisma.regulatoryReport.count({ where: { ...where, status: RegulatoryReportStatus.DRAFT } }),
        prisma.regulatoryReport.count({ where: { ...where, status: RegulatoryReportStatus.SUBMITTED } }),
        prisma.regulatoryReport.count({ where: { ...where, status: RegulatoryReportStatus.IN_PROGRESS } }),
        prisma.regulatoryReport.count({ where: { ...where, status: RegulatoryReportStatus.SUCCESS } }),
        prisma.regulatoryReport.count({ 
          where: { 
            ...where, 
            status: { 
              in: [
                RegulatoryReportStatus.RULE_ERROR, 
                RegulatoryReportStatus.SYSTEM_ERROR,
                RegulatoryReportStatus.TIMEOUT_ERROR,
                RegulatoryReportStatus.REJECTED_BY_UKNF
              ] 
            } 
          } 
        }),
        prisma.regulatoryReport.count({ where: { ...where, isArchived: true } }),
      ])

      return {
        total,
        draft,
        submitted,
        inProgress,
        success,
        errors,
        archived,
      }
    }),

  /**
   * Archive/Unarchive report (UKNF staff only)
   */
  toggleArchive: staffProcedure
    .input(
      z.object({
        id: z.string(),
        isArchived: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { session, prisma } = ctx
      const { id, isArchived } = input

      const report = await prisma.regulatoryReport.update({
        where: { id },
        data: {
          isArchived,
          archivedAt: isArchived ? new Date() : null,
        },
      })

      // Audit log
      await prisma.auditLog.create({
        data: {
          action: isArchived ? 'regulatory_report.archive' : 'regulatory_report.unarchive',
          resource: 'RegulatoryReport',
          resourceId: id,
          userId: session.user.id,
          details: JSON.stringify({ fileName: report.fileName }),
        },
      })

      return report
    }),

  /**
   * Export reports to CSV/XLSX
   */
  export: protectedProcedure
    .input(
      z.object({
        format: z.enum(['csv', 'xlsx', 'json']).default('xlsx'),
        filters: z.object({
          status: z.nativeEnum(RegulatoryReportStatus).optional(),
          reportType: z.nativeEnum(RegulatoryReportType).optional(),
          period: z.string().optional(),
          isArchived: z.boolean().optional(),
          dateFrom: z.date().optional(),
          dateTo: z.date().optional(),
        }).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { session, prisma } = ctx
      const { format, filters } = input

      // Build where clause (same logic as list)
      const where: Prisma.RegulatoryReportWhereInput = {}

      if (!isUKNF(session.user.role as UserRole)) {
        const userOrgIds = session.user.memberships.map(m => m.orgId)
        where.organizationId = { in: userOrgIds }
        
        if (session.user.role === 'ENTITY_USER') {
          where.submittedById = session.user.id
        }
      }

      if (filters) {
        if (filters.status) where.status = filters.status
        if (filters.reportType) where.reportType = filters.reportType
        if (filters.period) where.period = filters.period
        if (filters.isArchived !== undefined) where.isArchived = filters.isArchived
        
        if (filters.dateFrom || filters.dateTo) {
          where.submittedAt = {}
          if (filters.dateFrom) where.submittedAt.gte = filters.dateFrom
          if (filters.dateTo) where.submittedAt.lte = filters.dateTo
        }
      }

      const reports = await prisma.regulatoryReport.findMany({
        where,
        orderBy: { submittedAt: 'desc' },
        include: {
          organization: {
            select: { name: true, uknfCode: true }
          },
          submittedBy: {
            select: { name: true, email: true }
          }
        }
      })

      // Audit log
      await prisma.auditLog.create({
        data: {
          action: 'regulatory_report.export',
          resource: 'RegulatoryReport',
          resourceId: 'bulk',
          userId: session.user.id,
          details: JSON.stringify({ format, count: reports.length, filters }),
        },
      })

      // Return data (actual export formatting would be done client-side or via separate service)
      return {
        data: reports.map(r => ({
          fileName: r.fileName,
          entityCode: r.entityCode,
          entityName: r.entityName,
          period: r.period,
          reportType: r.reportType,
          submittedAt: r.submittedAt,
          status: r.status,
          validatedAt: r.validatedAt,
          submittedByName: r.submittedByName,
          submittedByEmail: r.submittedByEmail,
          isCorrection: r.isCorrection ? 'TAK' : 'NIE',
          isArchived: r.isArchived ? 'TAK' : 'NIE',
          validationNotes: r.validationNotes,
        })),
        format,
        timestamp: new Date(),
      }
    }),
})
