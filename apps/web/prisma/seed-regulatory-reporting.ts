/**
 * Seed data for Regulatory Reporting Module
 * 
 * Add to main seed.ts file
 */

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function seedRegulatoryReporting() {
  console.log('📊 Seeding Regulatory Reporting Module...')

  // 1. Reporting Calendar
  console.log('  📅 Creating reporting calendar...')
  
  const calendar = await prisma.reportingCalendar.createMany({
    data: [
      // Quarterly 2025
      {
        period: 'Q1 2025',
        reportType: 'QUARTERLY',
        dueDate: new Date('2025-04-30T23:59:59'),
        description: 'Sprawozdanie kwartalne za I kwartał 2025 roku',
        isActive: true,
        completionRate: 0,
      },
      {
        period: 'Q2 2025',
        reportType: 'QUARTERLY',
        dueDate: new Date('2025-07-31T23:59:59'),
        description: 'Sprawozdanie kwartalne za II kwartał 2025 roku',
        isActive: true,
        completionRate: 0,
      },
      {
        period: 'Q3 2025',
        reportType: 'QUARTERLY',
        dueDate: new Date('2025-10-31T23:59:59'),
        description: 'Sprawozdanie kwartalne za III kwartał 2025 roku',
        isActive: true,
        completionRate: 0,
      },
      {
        period: 'Q4 2025',
        reportType: 'QUARTERLY',
        dueDate: new Date('2026-01-31T23:59:59'),
        description: 'Sprawozdanie kwartalne za IV kwartał 2025 roku',
        isActive: true,
        completionRate: 0,
      },
      
      // Annual
      {
        period: '2024',
        reportType: 'ANNUAL',
        dueDate: new Date('2025-03-31T23:59:59'),
        description: 'Sprawozdanie roczne za rok 2024',
        isActive: true,
        completionRate: 0,
      },
      {
        period: '2025',
        reportType: 'ANNUAL',
        dueDate: new Date('2026-03-31T23:59:59'),
        description: 'Sprawozdanie roczne za rok 2025',
        isActive: true,
        completionRate: 0,
      },
    ],
    skipDuplicates: true,
  })

  console.log(`  ✅ Created ${calendar.count} calendar items`)

  // 2. Sample Regulatory Reports
  console.log('  📄 Creating sample reports...')

  // Get some organizations and users (assuming they exist from main seed)
  const organizations = await prisma.organization.findMany({
    take: 5,
    include: {
      memberships: {
        include: {
          user: true
        }
      }
    }
  })

  if (organizations.length === 0) {
    console.log('  ⚠️  No organizations found. Skipping sample reports.')
    return
  }

  const reports = []

  for (const org of organizations) {
    if (org.memberships.length === 0) continue

    const submitter = org.memberships[0].user

    // Create Q1 2025 report (Success)
    const q1Report = await prisma.regulatoryReport.create({
      data: {
        fileName: `RIP_Q1_2025_${org.slug}.xlsx`,
        fileUrl: `/storage/reports/rip_q1_2025_${org.slug}.xlsx`,
        fileSize: Math.floor(Math.random() * 5000000) + 500000, // 500KB - 5MB
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        entityCode: org.uknfCode || `PL${Math.random().toString().slice(2, 12)}`,
        entityName: org.name,
        period: 'Q1 2025',
        reportType: 'QUARTERLY',
        status: 'SUCCESS',
        validatedAt: new Date('2025-04-16T10:30:00'),
        validationReportUrl: `/storage/validation/q1_2025_${org.slug}_validation.pdf`,
        validationNotes: 'Walidacja zakończona pomyślnie. Wszystkie kontrole przeszły pozytywnie.',
        organizationId: org.id,
        submittedById: submitter.id,
        submittedByName: submitter.name,
        submittedByEmail: submitter.email,
        submittedAt: new Date('2025-04-15T14:20:00'),
      }
    })

    // Add status history for Q1 report
    await prisma.regulatoryReportStatusHistory.createMany({
      data: [
        {
          reportId: q1Report.id,
          status: 'DRAFT',
          note: 'Sprawozdanie utworzone',
          changedBy: submitter.id,
          createdAt: new Date('2025-04-15T14:20:00'),
        },
        {
          reportId: q1Report.id,
          status: 'SUBMITTED',
          note: 'Przesłane do walidacji',
          changedBy: submitter.id,
          createdAt: new Date('2025-04-15T14:25:00'),
        },
        {
          reportId: q1Report.id,
          status: 'IN_PROGRESS',
          note: 'Rozpoczęto proces walidacji automatycznej',
          createdAt: new Date('2025-04-15T14:26:00'),
        },
        {
          reportId: q1Report.id,
          status: 'SUCCESS',
          note: 'Walidacja zakończona pozytywnie',
          createdAt: new Date('2025-04-16T10:30:00'),
        },
      ]
    })

    reports.push(q1Report)

    // Create 2024 Annual report (In Progress) - only for first 3 orgs
    if (reports.length <= 3) {
      const annualReport = await prisma.regulatoryReport.create({
        data: {
          fileName: `Roczne_2024_${org.slug}.xlsx`,
          fileUrl: `/storage/reports/roczne_2024_${org.slug}.xlsx`,
          fileSize: Math.floor(Math.random() * 10000000) + 1000000, // 1MB - 10MB
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          entityCode: org.uknfCode || `PL${Math.random().toString().slice(2, 12)}`,
          entityName: org.name,
          period: '2024',
          reportType: 'ANNUAL',
          status: 'IN_PROGRESS',
          organizationId: org.id,
          submittedById: submitter.id,
          submittedByName: submitter.name,
          submittedByEmail: submitter.email,
          submittedAt: new Date('2025-03-28T09:15:00'),
        }
      })

      await prisma.regulatoryReportStatusHistory.createMany({
        data: [
          {
            reportId: annualReport.id,
            status: 'DRAFT',
            note: 'Sprawozdanie utworzone',
            changedBy: submitter.id,
            createdAt: new Date('2025-03-28T09:15:00'),
          },
          {
            reportId: annualReport.id,
            status: 'SUBMITTED',
            note: 'Przesłane do walidacji',
            changedBy: submitter.id,
            createdAt: new Date('2025-03-28T09:20:00'),
          },
          {
            reportId: annualReport.id,
            status: 'IN_PROGRESS',
            note: 'Rozpoczęto proces walidacji',
            createdAt: new Date('2025-03-28T09:21:00'),
          },
        ]
      })

      reports.push(annualReport)
    }

    // Create Q4 2024 with error (only for first 2 orgs)
    if (reports.length <= 2) {
      const q4ErrorReport = await prisma.regulatoryReport.create({
        data: {
          fileName: `RIP_Q4_2024_${org.slug}.xlsx`,
          fileUrl: `/storage/reports/rip_q4_2024_${org.slug}.xlsx`,
          fileSize: Math.floor(Math.random() * 5000000) + 500000,
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          entityCode: org.uknfCode || `PL${Math.random().toString().slice(2, 12)}`,
          entityName: org.name,
          period: 'Q4 2024',
          reportType: 'QUARTERLY',
          status: 'RULE_ERROR',
          validatedAt: new Date('2025-02-11T16:45:00'),
          validationReportUrl: `/storage/validation/q4_2024_${org.slug}_validation.pdf`,
          validationNotes: 'Błędy walidacji:\n- Pozycja A.1.2: niezgodność sum kontrolnych\n- Pozycja B.3.1: brakująca wartość\n- Pozycja C.2.4: nieprawidłowy format daty',
          organizationId: org.id,
          submittedById: submitter.id,
          submittedByName: submitter.name,
          submittedByEmail: submitter.email,
          submittedAt: new Date('2025-02-10T11:30:00'),
        }
      })

      await prisma.regulatoryReportStatusHistory.createMany({
        data: [
          {
            reportId: q4ErrorReport.id,
            status: 'DRAFT',
            note: 'Sprawozdanie utworzone',
            changedBy: submitter.id,
            createdAt: new Date('2025-02-10T11:30:00'),
          },
          {
            reportId: q4ErrorReport.id,
            status: 'SUBMITTED',
            note: 'Przesłane do walidacji',
            changedBy: submitter.id,
            createdAt: new Date('2025-02-10T11:35:00'),
          },
          {
            reportId: q4ErrorReport.id,
            status: 'IN_PROGRESS',
            note: 'Rozpoczęto proces walidacji',
            createdAt: new Date('2025-02-10T11:36:00'),
          },
          {
            reportId: q4ErrorReport.id,
            status: 'RULE_ERROR',
            note: 'Wykryto błędy walidacji',
            createdAt: new Date('2025-02-11T16:45:00'),
          },
        ]
      })

      // Create correction for Q4 error report
      const q4Correction = await prisma.regulatoryReport.create({
        data: {
          fileName: `RIP_Q4_2024_${org.slug}_Korekta.xlsx`,
          fileUrl: `/storage/reports/rip_q4_2024_${org.slug}_korekta.xlsx`,
          fileSize: Math.floor(Math.random() * 5000000) + 500000,
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          entityCode: org.uknfCode || `PL${Math.random().toString().slice(2, 12)}`,
          entityName: org.name,
          period: 'Q4 2024',
          reportType: 'QUARTERLY',
          status: 'SUBMITTED',
          isCorrection: true,
          correctedReportId: q4ErrorReport.id,
          organizationId: org.id,
          submittedById: submitter.id,
          submittedByName: submitter.name,
          submittedByEmail: submitter.email,
          submittedAt: new Date('2025-02-12T10:00:00'),
        }
      })

      await prisma.regulatoryReportStatusHistory.createMany({
        data: [
          {
            reportId: q4Correction.id,
            status: 'DRAFT',
            note: `Korekta sprawozdania ${q4ErrorReport.fileName}`,
            changedBy: submitter.id,
            createdAt: new Date('2025-02-12T10:00:00'),
          },
          {
            reportId: q4Correction.id,
            status: 'SUBMITTED',
            note: 'Korekta przesłana do walidacji',
            changedBy: submitter.id,
            createdAt: new Date('2025-02-12T10:05:00'),
          },
        ]
      })

      reports.push(q4ErrorReport)
      reports.push(q4Correction)
    }
  }

  console.log(`  ✅ Created ${reports.length} sample reports`)

  // 3. Add some comments
  console.log('  💬 Adding sample comments...')
  
  const uknfEmployees = await prisma.user.findMany({
    where: {
      role: {
        in: ['UKNF_ADMIN', 'UKNF_EMPLOYEE']
      }
    },
    take: 2
  })

  if (uknfEmployees.length > 0 && reports.length > 0) {
    const successReports = reports.filter(r => r.status === 'SUCCESS')
    
    for (const report of successReports.slice(0, 2)) {
      await prisma.regulatoryReportComment.create({
        data: {
          reportId: report.id,
          userId: uknfEmployees[0].id,
          userName: uknfEmployees[0].name,
          userRole: uknfEmployees[0].role,
          comment: 'Sprawozdanie przyjęte do dalszego przetwarzania. Wszystkie dane poprawne.',
        }
      })
    }

    console.log('  ✅ Added sample comments')
  }

  console.log('📊 ✅ Regulatory Reporting Module seeded successfully!')
}

// Export for use in main seed file
export { seedRegulatoryReporting }

// Or run standalone
// seedRegulatoryReporting()
//   .catch(console.error)
//   .finally(() => prisma.$disconnect())
