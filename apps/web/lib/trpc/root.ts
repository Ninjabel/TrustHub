import { createTRPCRouter } from './trpc'
import { reportsRouter } from './routers/reports'
import { messagesRouter } from './routers/messages'
import { casesRouter } from './routers/cases'
import { announcementsRouter } from './routers/announcements'
import { libraryRouter } from './routers/library'
import { faqRouter } from './routers/faq'
import { entitiesRouter } from './routers/entities'
import { usersRouter } from './routers/users'

export const appRouter = createTRPCRouter({
  reports: reportsRouter,
  messages: messagesRouter,
  cases: casesRouter,
  announcements: announcementsRouter,
  library: libraryRouter,
  faq: faqRouter,
  entities: entitiesRouter,
  users: usersRouter,
})

export type AppRouter = typeof appRouter
