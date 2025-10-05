/**
 * Tab Store using Zustand
 * Manages open tabs with persistence and role-aware access control
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { UserRole } from '@prisma/client'

export interface Tab {
  id: string
  title: string
  path: string
  allowedRoles: UserRole[]
  icon?: string
  closeable?: boolean // Dashboard tab might not be closeable
}

interface TabState {
  tabs: Tab[]
  activeTabId: string | null
  userRole: UserRole | null
  
  // Actions
  setUserRole: (role: UserRole | null) => void
  addTab: (tab: Omit<Tab, 'id'> & { id?: string }) => void
  removeTab: (tabId: string) => void
  setActiveTab: (tabId: string) => void
  closeTab: (tabId: string) => void
  clearTabs: () => void
  hasTab: (path: string) => boolean
  getTabByPath: (path: string) => Tab | undefined
}

export const useTabStore = create<TabState>()(
  persist(
    (set, get) => ({
      tabs: [],
      activeTabId: null,
      userRole: null,

      setUserRole: (role) => set({ userRole: role }),

      addTab: (tabData) => {
        const { tabs, userRole } = get()
        
        // Check if user has access to this tab
        if (userRole && tabData.allowedRoles && !tabData.allowedRoles.includes(userRole)) {
          console.warn(`User role ${userRole} does not have access to tab: ${tabData.path}`)
          return
        }

        // Generate ID from path if not provided
        const tabId = tabData.id || tabData.path
        
        // Check if tab already exists
        const existingTab = tabs.find(t => t.id === tabId)
        if (existingTab) {
          // Just activate the existing tab
          set({ activeTabId: tabId })
          return
        }

        // Create new tab
        const newTab: Tab = {
          id: tabId,
          title: tabData.title,
          path: tabData.path,
          allowedRoles: tabData.allowedRoles,
          icon: tabData.icon,
          closeable: tabData.closeable !== false, // Default to true
        }

        set({
          tabs: [...tabs, newTab],
          activeTabId: tabId,
        })
      },

      removeTab: (tabId) => {
        const { tabs, activeTabId } = get()
        const tabIndex = tabs.findIndex(t => t.id === tabId)
        
        if (tabIndex === -1) return

        const newTabs = tabs.filter(t => t.id !== tabId)
        let newActiveTabId = activeTabId

        // If we're closing the active tab, switch to another tab
        if (activeTabId === tabId) {
          if (newTabs.length > 0) {
            // Try to activate the previous tab, or the next one, or the dashboard
            if (tabIndex > 0) {
              newActiveTabId = newTabs[tabIndex - 1].id
            } else if (newTabs.length > 0) {
              newActiveTabId = newTabs[0].id
            } else {
              newActiveTabId = null
            }
          } else {
            newActiveTabId = null
          }
        }

        set({
          tabs: newTabs,
          activeTabId: newActiveTabId,
        })
      },

      setActiveTab: (tabId) => {
        const { tabs } = get()
        const tabExists = tabs.some(t => t.id === tabId)
        
        if (tabExists) {
          set({ activeTabId: tabId })
        }
      },

      closeTab: (tabId) => {
        const { removeTab } = get()
        removeTab(tabId)
      },

      clearTabs: () => set({ tabs: [], activeTabId: null }),

      hasTab: (path) => {
        const { tabs } = get()
        return tabs.some(t => t.path === path)
      },

      getTabByPath: (path) => {
        const { tabs } = get()
        return tabs.find(t => t.path === path)
      },
    }),
    {
      name: 'trusthub-tabs-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        tabs: state.tabs,
        activeTabId: state.activeTabId,
        // Don't persist userRole - it should come from session
      }),
    }
  )
)
