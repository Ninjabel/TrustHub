import { initTRPC, TRPCError } from '@trpc/server'
import { type Session } from 'next-auth'
import superjson from 'superjson'
import { ZodError } from 'zod'
import { prisma } from '@/lib/db'
import { UserRole } from '@prisma/client'

interface CreateContextOptions {
  session: Session | null
}

export const createTRPCContext = async (opts: CreateContextOptions) => {
  return {
    session: opts.session,
    prisma,
  }
}

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

export const createTRPCRouter = t.router
export const publicProcedure = t.procedure

// Authenticated procedure
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.session.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({
    ctx: {
      ...ctx,
      session: { ...ctx.session, user: ctx.session.user },
    },
  })
})

// Admin-only procedure
export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.session.user.role !== UserRole.ADMIN) {
    throw new TRPCError({ code: 'FORBIDDEN' })
  }
  return next({ ctx })
})

// Staff procedure (ADMIN + STAFF)
export const staffProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const allowedRoles: UserRole[] = [UserRole.ADMIN, UserRole.STAFF]
  if (!allowedRoles.includes(ctx.session.user.role as UserRole)) {
    throw new TRPCError({ code: 'FORBIDDEN' })
  }
  return next({ ctx })
})
