'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { ChevronDown, Building2, Check } from 'lucide-react'

export function OrganizationSwitcher() {
  const { data: session, update } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  if (!session?.user?.memberships || session.user.memberships.length === 0) {
    return null
  }

  const currentOrg = session.user.memberships.find(
    (m) => m.orgId === session.user.currentOrgId
  )

  const handleSwitch = async (orgId: string) => {
    if (orgId === session.user.currentOrgId) {
      setIsOpen(false)
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/session/switch-org', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId }),
      })

      if (response.ok) {
        // Update session
        await update({
          ...session,
          user: {
            ...session.user,
            currentOrgId: orgId,
          },
        })
        setIsOpen(false)
        window.location.reload() // Refresh to update context
      }
    } catch (error) {
      console.error('Failed to switch organization:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <Building2 className="h-4 w-4 text-gray-500" />
        <span className="text-gray-700">
          Reprezentuję: <span className="font-medium">{currentOrg?.orgName || 'Wybierz'}</span>
        </span>
        <ChevronDown className="h-4 w-4 text-gray-500" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                Twoje organizacje
              </div>
              {session.user.memberships.map((membership) => (
                <button
                  key={membership.orgId}
                  onClick={() => handleSwitch(membership.orgId)}
                  disabled={isLoading}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm text-left rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">
                      {membership.orgName}
                    </span>
                    <span className="text-xs text-gray-500">
                      {membership.role === 'ADMIN' ? 'Administrator' : 'Użytkownik'}
                    </span>
                  </div>
                  {membership.orgId === session.user.currentOrgId && (
                    <Check className="h-4 w-4 text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
