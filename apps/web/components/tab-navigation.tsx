/**
 * Tab Navigation Bar Component
 * Displays open tabs with role-aware access control
 */

'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { X } from 'lucide-react'
import { useTabStore } from '@/lib/tabs/tab-store'
import { UserRole } from '@prisma/client'
import { cn } from '@/lib/utils'

interface TabNavigationProps {
  userRole?: UserRole | null
}

export function TabNavigation({ userRole }: TabNavigationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { tabs, activeTabId, setActiveTab, closeTab, setUserRole } = useTabStore()

  // Update user role in store when it changes
  useEffect(() => {
    if (userRole) {
      setUserRole(userRole)
    }
  }, [userRole, setUserRole])

  // Filter tabs based on user role
  const accessibleTabs = tabs.filter(tab => {
    if (!userRole) return false
    return tab.allowedRoles.includes(userRole)
  })

  // Handle tab click
  const handleTabClick = (tabId: string, path: string) => {
    setActiveTab(tabId)
    router.push(path)
  }

  // Handle tab close
  const handleTabClose = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation()
    
    // Find the next tab to activate
    const currentIndex = accessibleTabs.findIndex(t => t.id === tabId)
    let nextTab = null
    
    if (currentIndex > 0) {
      nextTab = accessibleTabs[currentIndex - 1]
    } else if (accessibleTabs.length > 1) {
      nextTab = accessibleTabs[1]
    }
    
    closeTab(tabId)
    
    // Navigate to the next tab if we closed the active one
    if (nextTab && activeTabId === tabId) {
      router.push(nextTab.path)
    }
  }

  if (accessibleTabs.length === 0) {
    return null
  }

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <div className="flex items-center min-w-0 flex-1">
          {accessibleTabs.map((tab) => {
            const isActive = activeTabId === tab.id || pathname === tab.path
            
            return (
              <div
                key={tab.id}
                className={cn(
                  'group relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-r border-gray-200 min-w-0 cursor-pointer',
                  'hover:bg-gray-50',
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-b-2 border-b-blue-600'
                    : 'bg-white text-gray-700'
                )}
              >
                <span 
                  onClick={() => handleTabClick(tab.id, tab.path)}
                  className="truncate max-w-[200px] flex-1"
                >
                  {tab.title}
                </span>
                
                {tab.closeable !== false && (
                  <button
                    onClick={(e) => handleTabClose(e, tab.id)}
                    className={cn(
                      'flex-shrink-0 p-0.5 rounded hover:bg-gray-200 transition-colors',
                      isActive ? 'text-blue-700' : 'text-gray-500'
                    )}
                    aria-label={`Zamknij ${tab.title}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            )
          })}
        </div>
        
        {/* Tab counter */}
        <div className="flex-shrink-0 px-4 py-3 text-xs text-gray-500 border-l border-gray-200">
          {accessibleTabs.length} {accessibleTabs.length === 1 ? 'zakładka' : 'zakładek'}
        </div>
      </div>
    </div>
  )
}
