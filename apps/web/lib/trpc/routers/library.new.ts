import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, staffProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import { Prisma } from '@prisma/client'

export const libraryRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        reportPeriod: z.enum(['QUARTERLY', 'ANNUAL', 'NONE']).optional(),
        isArchived: z.boolean().optional(),
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { prisma, session } = ctx
      const { search, reportPeriod, isArchived, limit, cursor } = input

      const where: Prisma.LibraryFileWhereInput = {
        isArchived: isArchived ?? false,
      }

      // Filter by access type
      // ENTITY_ADMIN and ENTITY_USER can only see GLOBAL files or files specific to their organization
      if (session.user.role === 'ENTITY_ADMIN' || session.user.role === 'ENTITY_USER') {
        // Get user's organization
        const membership = await prisma.organizationMembership.findFirst({
          where: { userId: session.user.id },
          select: { organizationId: true },
        })

        if (membership) {
          where.OR = [
            { accessType: 'GLOBAL' },
            {
              accessType: 'ENTITY_SPECIFIC',
              accessList: { has: membership.organizationId },
            },
          ]
        } else {
          where.accessType = 'GLOBAL'
        }
      }

      if (search) {
        const clause: Prisma.LibraryFileWhereInput = {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { fileName: { contains: search, mode: 'insensitive' } },
          ],
        }

        const existing = where.AND
        if (!existing) {
          where.AND = [clause]
        } else if (Array.isArray(existing)) {
          existing.push(clause)
          where.AND = existing
        } else {
          where.AND = [existing as Prisma.LibraryFileWhereInput, clause]
        }
      }

      if (reportPeriod) {
        where.reportPeriod = reportPeriod
      }

      const files = await prisma.libraryFile.findMany({
        where,
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { updatedAt: 'desc' },
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
      const { prisma, session } = ctx

      const file = await prisma.libraryFile.findUnique({
        where: { id: input.id },
        include: {
          uploadedBy: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      })

      if (!file) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Plik nie został znaleziony' })
      }

      // Check access permissions
      if (session.user.role === 'ENTITY_ADMIN' || session.user.role === 'ENTITY_USER') {
        const membership = await prisma.organizationMembership.findFirst({
          where: { userId: session.user.id },
          select: { organizationId: true },
        })

        const hasAccess =
          file.accessType === 'GLOBAL' ||
          (file.accessType === 'ENTITY_SPECIFIC' &&
            membership &&
            file.accessList.includes(membership.organizationId))

        if (!hasAccess) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Brak dostępu do tego pliku' })
        }
      }

      return file
    }),

  create: staffProcedure
    .input(
      z.object({
        title: z.string().min(1, 'Nazwa pliku jest wymagana'),
        description: z.string().optional(),
        fileName: z.string(),
        fileUrl: z.string().url('Nieprawidłowy URL pliku'),
        fileSize: z.number().positive('Rozmiar pliku musi być dodatni'),
        mimeType: z.string(),
        version: z.string().default('1.0'),
        reportPeriod: z.enum(['QUARTERLY', 'ANNUAL', 'NONE']).default('NONE'),
        isArchived: z.boolean().default(false),
        accessType: z.enum(['GLOBAL', 'ENTITY_SPECIFIC']).default('GLOBAL'),
        accessList: z.array(z.string()).default([]),
        recipientGroups: z
          .object({
            group1: z.array(z.string()).optional(),
            group2: z.array(z.string()).optional(),
            group3: z.array(z.string()).optional(),
          })
          .optional(),
        notifyOnUpload: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { session, prisma } = ctx

      const file = await prisma.libraryFile.create({
        data: {
          title: input.title,
          description: input.description,
          fileName: input.fileName,
          fileUrl: input.fileUrl,
          fileSize: input.fileSize,
          mimeType: input.mimeType,
          version: input.version,
          reportPeriod: input.reportPeriod,
          isArchived: input.isArchived,
          accessType: input.accessType,
          accessList: input.accessList,
          recipientGroups: input.recipientGroups,
          notifyOnUpload: input.notifyOnUpload,
          uploadedById: session.user.id,
        },
        include: {
          uploadedBy: {
            select: { id: true, name: true, email: true },
          },
        },
      })

      // Log the action
      await prisma.auditLog.create({
        data: {
          action: 'CREATE',
          resource: 'LibraryFile',
          resourceId: file.id,
          userId: session.user.id,
          details: `Utworzono plik: ${file.title}`,
        },
      })

      return file
    }),

  update: staffProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        reportPeriod: z.enum(['QUARTERLY', 'ANNUAL', 'NONE']).optional(),
        isArchived: z.boolean().optional(),
        accessType: z.enum(['GLOBAL', 'ENTITY_SPECIFIC']).optional(),
        accessList: z.array(z.string()).optional(),
        recipientGroups: z
          .object({
            group1: z.array(z.string()).optional(),
            group2: z.array(z.string()).optional(),
            group3: z.array(z.string()).optional(),
          })
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { session, prisma } = ctx
      const { id, ...updateData } = input

      const file = await prisma.libraryFile.update({
        where: { id },
        data: {
          ...updateData,
          reportPeriod: updateData.reportPeriod,
          accessType: updateData.accessType,
          recipientGroups: updateData.recipientGroups,
        },
        include: {
          uploadedBy: {
            select: { id: true, name: true, email: true },
          },
        },
      })

      // Log the action
      await prisma.auditLog.create({
        data: {
          action: 'UPDATE',
          resource: 'LibraryFile',
          resourceId: file.id,
          userId: session.user.id,
          details: `Zaktualizowano plik: ${file.title}`,
        },
      })

      return file
    }),

  delete: staffProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { session, prisma } = ctx

      const file = await prisma.libraryFile.findUnique({
        where: { id: input.id },
        select: { title: true },
      })

      if (!file) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Plik nie został znaleziony' })
      }

      await prisma.libraryFile.delete({
        where: { id: input.id },
      })

      // Log the action
      await prisma.auditLog.create({
        data: {
          action: 'DELETE',
          resource: 'LibraryFile',
          resourceId: input.id,
          userId: session.user.id,
          details: `Usunięto plik: ${file.title}`,
        },
      })

      return { success: true }
    }),

  archive: staffProcedure
    .input(z.object({ id: z.string(), isArchived: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const { session, prisma } = ctx

      const file = await prisma.libraryFile.update({
        where: { id: input.id },
        data: {
          isArchived: input.isArchived,
          archivedAt: input.isArchived ? new Date() : null,
        },
      })

      await prisma.auditLog.create({
        data: {
          action: 'UPDATE',
          resource: 'LibraryFile',
          resourceId: file.id,
          userId: session.user.id,
          details: input.isArchived
            ? `Zarchiwizowano plik: ${file.title}`
            : `Przywrócono plik z archiwum: ${file.title}`,
        },
      })

      return file
    }),

  getHistory: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { prisma } = ctx

      // Get audit logs for this file
      const history = await prisma.auditLog.findMany({
        where: {
          resource: 'LibraryFile',
          resourceId: input.id,
        },
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
        take: 50,
      })

      return history
    }),

  export: protectedProcedure
    .input(
      z.object({
        format: z.enum(['csv', 'xlsx', 'json']),
        search: z.string().optional(),
        reportPeriod: z.enum(['QUARTERLY', 'ANNUAL', 'NONE']).optional(),
        isArchived: z.boolean().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { prisma, session } = ctx
      const { search, reportPeriod, isArchived } = input

      const where: Prisma.LibraryFileWhereInput = {
        isArchived: isArchived ?? false,
      }

      // Apply same filters as list
      if (session.user.role === 'ENTITY_ADMIN' || session.user.role === 'ENTITY_USER') {
        const membership = await prisma.organizationMembership.findFirst({
          where: { userId: session.user.id },
          select: { organizationId: true },
        })

        if (membership) {
          where.OR = [
            { accessType: 'GLOBAL' },
            {
              accessType: 'ENTITY_SPECIFIC',
              accessList: { has: membership.organizationId },
            },
          ]
        } else {
          where.accessType = 'GLOBAL'
        }
      }

      if (search) {
        const clause: Prisma.LibraryFileWhereInput = {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { fileName: { contains: search, mode: 'insensitive' } },
          ],
        }

        const existing = where.AND
        if (!existing) {
          where.AND = [clause]
        } else if (Array.isArray(existing)) {
          existing.push(clause)
          where.AND = existing
        } else {
          where.AND = [existing as Prisma.LibraryFileWhereInput, clause]
        }
      }

      if (reportPeriod) {
        where.reportPeriod = reportPeriod
      }

      const files = await prisma.libraryFile.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        include: {
          uploadedBy: {
            select: { name: true, email: true },
          },
        },
      })

      // Return data for export
      return files.map((file) => ({
        'Data aktualizacji': new Date(file.updatedAt).toLocaleDateString('pl-PL'),
        'Nazwa pliku': file.title,
        'Okres sprawozdawczy': file.reportPeriod,
        Wersja: file.version,
        Archiwalny: file.isArchived ? 'Tak' : 'Nie',
        'Dodany przez': file.uploadedBy.name,
      }))
    }),

  download: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { prisma, session } = ctx

      const file = await prisma.libraryFile.findUnique({
        where: { id: input.id },
      })

      if (!file) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Plik nie został znaleziony' })
      }

      // Check access permissions
      if (session.user.role === 'ENTITY_ADMIN' || session.user.role === 'ENTITY_USER') {
        const membership = await prisma.organizationMembership.findFirst({
          where: { userId: session.user.id },
          select: { organizationId: true },
        })

        const hasAccess =
          file.accessType === 'GLOBAL' ||
          (file.accessType === 'ENTITY_SPECIFIC' &&
            membership &&
            file.accessList.includes(membership.organizationId))

        if (!hasAccess) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Brak dostępu do tego pliku' })
        }
      }

      // Log the download
      await prisma.auditLog.create({
        data: {
          action: 'DOWNLOAD',
          resource: 'LibraryFile',
          resourceId: file.id,
          userId: session.user.id,
          details: `Pobrano plik: ${file.title}`,
        },
      })

      return { fileUrl: file.fileUrl, fileName: file.fileName }
    }),
})
