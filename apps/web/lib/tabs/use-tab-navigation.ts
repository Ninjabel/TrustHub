/**
 * useTabNavigation Hook
 * Provides functions to open tabs with role-based access control
 */

'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { hasAccessToPath, getTabConfig } from './tab-access-map'
import { toast } from 'sonner'

/**
 * Simplified tab navigation hook.
 * Keeps the access-checking logic but no longer manages an open-tabs store.
 * Components can call navigateTo(path) to navigate while respecting access rules.
 */
export function useTabNavigation() {
  const router = useRouter()
  const { data: session } = useSession()

  const userRole = session?.user?.role

  const navigateTo = useCallback(
    (path: string) => {
      if (!userRole) {
        toast.error('Brak dost\u0119pu')
        return false
      }

      if (!hasAccessToPath(path, userRole)) {
        toast.error('Brak dost\u0119pu', {
          description: 'Nie posiadasz uprawnie\u0144 do otwarcia tego modu\u0142u.',
        })
        return false
      }

      const config = getTabConfig(path)
      if (!config) {
        // If no config exists, still navigate - it's likely a nested route
        router.push(path)
        return true
      }

      router.push(path)
      return true
    },
    [userRole, router]
  )

  return { navigateTo, userRole }
}
