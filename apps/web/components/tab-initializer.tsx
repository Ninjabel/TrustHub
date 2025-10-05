/**
 * Tab Initializer Component
 * Ensures current page is opened as a tab when navigating directly
 */

'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useTabStore } from '@/lib/tabs/tab-store'
import { getTabConfig, hasAccessToPath } from '@/lib/tabs/tab-access-map'

export function TabInitializer() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { addTab, hasTab } = useTabStore()
  
  const userRole = session?.user?.role

  useEffect(() => {
    if (!userRole || !pathname) return

    // Check if we're on a dashboard route
    if (!pathname.startsWith('/dashboard')) return

    // Check if user has access to this path
    if (!hasAccessToPath(pathname, userRole)) return

    // Check if tab already exists
    if (hasTab(pathname)) return

    // Get tab configuration
    const config = getTabConfig(pathname)
    if (!config) return

    // Add tab for current page
    addTab({
      id: pathname,
      title: config.title,
      path: config.path,
      allowedRoles: config.allowedRoles,
      icon: config.icon,
      closeable: pathname !== '/dashboard',
    })
  }, [pathname, userRole, addTab, hasTab])

  return null
}
