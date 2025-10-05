import { createTRPCRouter } from './trpc'
import { reportsRouter } from './routers/reports'
import { messagesRouter } from './routers/messages'
import { casesRouter } from './routers/cases'
import { announcementsRouter } from './routers/announcements'
import { bulletinsRouter } from './routers/bulletins'
import { libraryRouter } from './routers/library'
import { faqRouter } from './routers/faq'
import { entitiesRouter } from './routers/entities'
import { usersRouter } from './routers/users'
import { accessRequestsRouter } from './routers/accessRequests'
import { auditRouter } from './routers/audit'
import { systemRouter } from './routers/system'
import { regulatoryReportsRouter } from './routers/regulatory-reports'

export const appRouter = createTRPCRouter({
  reports: reportsRouter,
  regulatoryReports: regulatoryReportsRouter,
  messages: messagesRouter,
  cases: casesRouter,
  announcements: announcementsRouter,
  bulletins: bulletinsRouter,
  library: libraryRouter,
  faq: faqRouter,
  entities: entitiesRouter,
  users: usersRouter,
  accessRequests: accessRequestsRouter,
  audit: auditRouter,
  system: systemRouter,
})

export type AppRouter = typeof appRouter
