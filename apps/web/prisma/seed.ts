import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data
  await prisma.auditLog.deleteMany()
  await prisma.fAQRating.deleteMany()
  await prisma.fAQ.deleteMany()
  await prisma.libraryFile.deleteMany()
  await prisma.announcementRead.deleteMany()
  await prisma.announcement.deleteMany()
  await prisma.caseTimeline.deleteMany()
  await prisma.case.deleteMany()
  await prisma.message.deleteMany()
  await prisma.messageThread.deleteMany()
  await prisma.report.deleteMany()
  await prisma.user.deleteMany()
  await prisma.entity.deleteMany()

  // Hash password for all demo users
  const hashedPassword = await bcrypt.hash('password123', 10)

  // Create Entities
  const acmeEntity = await prisma.entity.create({
    data: {
      name: 'ACME Corporation',
      code: 'ACME',
      description: 'Demo financial institution',
      isActive: true,
    },
  })

  const techEntity = await prisma.entity.create({
    data: {
      name: 'TechFinance Ltd',
      code: 'TECHFIN',
      description: 'Technology-focused finance company',
      isActive: true,
    },
  })

  console.log('✅ Created entities')

  // Create Users
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@trusthub.demo',
      name: 'Admin User',
      password: hashedPassword,
      role: UserRole.ADMIN,
    },
  })

  const staffUser = await prisma.user.create({
    data: {
      email: 'staff@trusthub.demo',
      name: 'Staff Member',
      password: hashedPassword,
      role: UserRole.STAFF,
    },
  })

  const entityAdmin = await prisma.user.create({
    data: {
      email: 'entity.admin@company.demo',
      name: 'Entity Admin',
      password: hashedPassword,
      role: UserRole.ENTITY_ADMIN,
      entityId: acmeEntity.id,
    },
  })

  const entityUser = await prisma.user.create({
    data: {
      email: 'entity.user@company.demo',
      name: 'Entity User',
      password: hashedPassword,
      role: UserRole.ENTITY_USER,
      entityId: acmeEntity.id,
    },
  })

  console.log('✅ Created users')

  // Create Reports
  await prisma.report.createMany({
    data: [
      {
        title: 'Q4 2024 Compliance Report',
        description: 'Quarterly compliance data submission',
        fileName: 'q4-2024-compliance.xlsx',
        fileUrl: '/uploads/reports/q4-2024-compliance.xlsx',
        fileSize: 245000,
        status: 'SUCCESS',
        userId: entityUser.id,
        entityId: acmeEntity.id,
        processedAt: new Date(),
      },
      {
        title: 'Monthly Risk Assessment',
        description: 'January 2025 risk metrics',
        fileName: 'risk-jan-2025.xlsx',
        fileUrl: '/uploads/reports/risk-jan-2025.xlsx',
        fileSize: 189000,
        status: 'PROCESSING',
        userId: entityUser.id,
        entityId: acmeEntity.id,
      },
      {
        title: 'AML Transaction Report',
        description: 'Anti-money laundering report',
        fileName: 'aml-report.xlsx',
        fileUrl: '/uploads/reports/aml-report.xlsx',
        fileSize: 512000,
        status: 'ERROR',
        errorMessage: 'Invalid data format in row 45',
        userId: entityUser.id,
        entityId: acmeEntity.id,
      },
    ],
  })

  console.log('✅ Created reports')

  // Create Message Threads and Messages
  const thread1 = await prisma.messageThread.create({
    data: {
      subject: 'Question about Q4 reporting requirements',
      messages: {
        create: [
          {
            content: 'Hi, I have a question about the new reporting requirements for Q4. Can you clarify section 3.2?',
            userId: entityUser.id,
            attachments: [],
          },
          {
            content: 'Hello! Section 3.2 requires detailed breakdown of risk-weighted assets. Please refer to the updated guidelines document.',
            userId: staffUser.id,
            attachments: ['/uploads/messages/guidelines-v2.pdf'],
          },
        ],
      },
    },
  })

  const thread2 = await prisma.messageThread.create({
    data: {
      subject: 'System maintenance notification',
      messages: {
        create: [
          {
            content: 'Please be advised that we will perform system maintenance on Sunday, Oct 6th from 2-4 AM.',
            userId: adminUser.id,
            attachments: [],
          },
        ],
      },
    },
  })

  console.log('✅ Created message threads')

  // Create Cases
  const case1 = await prisma.case.create({
    data: {
      title: 'Data validation error in report submission',
      description: 'Encountered validation errors when uploading the monthly report. Need assistance troubleshooting.',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      createdById: entityUser.id,
      assignedToId: staffUser.id,
      entityId: acmeEntity.id,
      timeline: {
        create: [
          {
            event: 'Case created',
            details: 'User reported validation errors',
          },
          {
            event: 'Assigned to staff',
            details: 'Case assigned to support team',
          },
          {
            event: 'Investigation started',
            details: 'Reviewing error logs and data format',
          },
        ],
      },
    },
  })

  const case2 = await prisma.case.create({
    data: {
      title: 'Request for additional entity access',
      description: 'Requesting access to TechFinance entity for consolidated reporting.',
      status: 'NEW',
      priority: 'MEDIUM',
      createdById: entityAdmin.id,
      entityId: acmeEntity.id,
      timeline: {
        create: [
          {
            event: 'Case created',
            details: 'Access request submitted',
          },
        ],
      },
    },
  })

  console.log('✅ Created cases')

  // Create Announcements
  const announcement1 = await prisma.announcement.create({
    data: {
      title: 'New Reporting Template Available',
      content: 'We have released an updated reporting template for Q1 2025. Please download the latest version from the Library section.',
      isPublished: true,
      authorId: adminUser.id,
      publishedAt: new Date(),
      reads: {
        create: [
          {
            userId: entityUser.id,
          },
        ],
      },
    },
  })

  const announcement2 = await prisma.announcement.create({
    data: {
      title: 'Upcoming Training Session',
      content: 'Join us for a training session on the new compliance requirements on October 15th at 2 PM EST.',
      isPublished: true,
      authorId: staffUser.id,
      publishedAt: new Date(),
    },
  })

  console.log('✅ Created announcements')

  // Create Library Files
  await prisma.libraryFile.createMany({
    data: [
      {
        title: 'Compliance Guidelines 2025',
        description: 'Updated compliance guidelines for the current year',
        fileName: 'compliance-guidelines-2025.pdf',
        fileUrl: '/uploads/library/compliance-guidelines-2025.pdf',
        fileSize: 2400000,
        mimeType: 'application/pdf',
        version: '1.0',
        uploadedById: adminUser.id,
      },
      {
        title: 'Report Template - Risk Assessment',
        description: 'Excel template for risk assessment reports',
        fileName: 'risk-assessment-template.xlsx',
        fileUrl: '/uploads/library/risk-assessment-template.xlsx',
        fileSize: 85000,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        version: '2.1',
        uploadedById: staffUser.id,
      },
      {
        title: 'Data Dictionary',
        description: 'Complete data field definitions and requirements',
        fileName: 'data-dictionary.pdf',
        fileUrl: '/uploads/library/data-dictionary.pdf',
        fileSize: 1800000,
        mimeType: 'application/pdf',
        version: '1.5',
        uploadedById: staffUser.id,
      },
    ],
  })

  console.log('✅ Created library files')

  // Create FAQs
  const faq1 = await prisma.fAQ.create({
    data: {
      question: 'How do I upload a report?',
      answer: 'Navigate to the Reports section, click on "Upload Report", select your XLSX file, provide a title and description, then click Submit. The system will validate your file automatically.',
      category: 'Reports',
      isPublished: true,
      authorId: staffUser.id,
      ratings: {
        create: [
          {
            userId: entityUser.id,
            rating: 5,
          },
        ],
      },
    },
  })

  const faq2 = await prisma.fAQ.create({
    data: {
      question: 'What file formats are supported for reports?',
      answer: 'Currently, we support XLSX (Excel) format for report uploads. Please ensure your file follows the template structure available in the Library section.',
      category: 'Reports',
      isPublished: true,
      authorId: staffUser.id,
      ratings: {
        create: [
          {
            userId: entityUser.id,
            rating: 4,
          },
        ],
      },
    },
  })

  const faq3 = await prisma.fAQ.create({
    data: {
      question: 'How do I reset my password?',
      answer: 'Click on "Forgot Password" on the login page. Enter your email address and follow the instructions sent to your email to reset your password.',
      category: 'Account',
      isPublished: true,
      authorId: adminUser.id,
    },
  })

  const faq4 = await prisma.fAQ.create({
    data: {
      question: 'What are the different case priorities?',
      answer: 'Cases can be marked as LOW (routine requests), MEDIUM (standard issues), HIGH (important issues requiring quick attention), or URGENT (critical issues requiring immediate attention).',
      category: 'Cases',
      isPublished: true,
      authorId: staffUser.id,
    },
  })

  console.log('✅ Created FAQs')

  // Create Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        action: 'LOGIN',
        resource: 'AUTH',
        userId: adminUser.id,
        ipAddress: '192.168.1.100',
      },
      {
        action: 'CREATE',
        resource: 'REPORT',
        resourceId: 'report-1',
        userId: entityUser.id,
        ipAddress: '192.168.1.101',
      },
      {
        action: 'UPDATE',
        resource: 'CASE',
        resourceId: case1.id,
        details: 'Status changed to IN_PROGRESS',
        userId: staffUser.id,
        ipAddress: '192.168.1.102',
      },
      {
        action: 'PUBLISH',
        resource: 'ANNOUNCEMENT',
        resourceId: announcement1.id,
        userId: adminUser.id,
        ipAddress: '192.168.1.100',
      },
    ],
  })

  console.log('✅ Created audit logs')

  console.log('\n🎉 Seeding completed successfully!')
  console.log('\n📧 Demo accounts:')
  console.log('   Admin:        admin@trusthub.demo / password123')
  console.log('   Staff:        staff@trusthub.demo / password123')
  console.log('   Entity Admin: entity.admin@company.demo / password123')
  console.log('   Entity User:  entity.user@company.demo / password123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
