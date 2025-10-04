 'use client'

import { signOut } from 'next-auth/react'
import { Session } from 'next-auth'

type UserFromSession = Session['user'] & {
  id?: string
  role?: string
  entityId?: string | null
}

export function Header({ user }: { user: UserFromSession | null }) {
  return (
    <header className="bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Welcome, {user?.name}
            </h2>
            <p className="text-xs text-gray-500">{user?.role}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700">{user?.email}</span>
            <button
              onClick={() => signOut({ callbackUrl: '/signin' })}
              className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
