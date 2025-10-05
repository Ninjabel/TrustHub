/**
 * Tab Access Control Map
 * Defines which user roles can access which routes/tabs
 */

import { UserRole } from '@prisma/client'

export type TabAccessConfig = {
  path: string
  title: string
  allowedRoles: UserRole[]
  icon?: string
}

/**
 * Central map of all accessible routes with role-based permissions
 */
export const TAB_ACCESS_MAP: Record<string, TabAccessConfig> = {
  '/dashboard': {
    path: '/dashboard',
    title: 'Pulpit',
    allowedRoles: ['UKNF_ADMIN', 'UKNF_EMPLOYEE', 'ENTITY_ADMIN', 'ENTITY_USER'],
    icon: 'home',
  },
  '/dashboard/access-requests': {
    path: '/dashboard/access-requests',
    title: 'Wnioski o dostęp',
    allowedRoles: ['UKNF_ADMIN', 'UKNF_EMPLOYEE', 'ENTITY_ADMIN', 'ENTITY_USER'],
    icon: 'document',
  },
  '/dashboard/reports': {
    path: '/dashboard/reports',
    title: 'Sprawozdawczość (Legacy)',
    allowedRoles: ['UKNF_ADMIN', 'UKNF_EMPLOYEE', 'ENTITY_ADMIN', 'ENTITY_USER'],
    icon: 'reports',
  },
  '/dashboard/regulatory-reporting': {
    path: '/dashboard/regulatory-reporting',
    title: 'Sprawozdawczość',
    allowedRoles: ['UKNF_ADMIN', 'UKNF_EMPLOYEE', 'ENTITY_ADMIN', 'ENTITY_USER'],
    icon: 'reports',
  },
  '/dashboard/regulatory-reporting/upload': {
    path: '/dashboard/regulatory-reporting/upload',
    title: 'Prześlij sprawozdanie',
    allowedRoles: ['ENTITY_ADMIN', 'ENTITY_USER'],
    icon: 'upload',
  },
  '/dashboard/regulatory-reporting/calendar': {
    path: '/dashboard/regulatory-reporting/calendar',
    title: 'Kalendarz sprawozdawczy',
    allowedRoles: ['UKNF_ADMIN', 'UKNF_EMPLOYEE', 'ENTITY_ADMIN', 'ENTITY_USER'],
    icon: 'calendar',
  },
  '/dashboard/regulatory-reporting/:id': {
    path: '/dashboard/regulatory-reporting/:id',
    title: 'Szczegóły sprawozdania',
    allowedRoles: ['UKNF_ADMIN', 'UKNF_EMPLOYEE', 'ENTITY_ADMIN', 'ENTITY_USER'],
    icon: 'document',
  },
  '/dashboard/cases': {
    path: '/dashboard/cases',
    title: 'Sprawy',
    allowedRoles: ['UKNF_ADMIN', 'UKNF_EMPLOYEE', 'ENTITY_ADMIN', 'ENTITY_USER'],
    icon: 'briefcase',
  },
  '/dashboard/library': {
    path: '/dashboard/library',
    title: 'Biblioteka',
    allowedRoles: ['UKNF_ADMIN', 'UKNF_EMPLOYEE', 'ENTITY_ADMIN', 'ENTITY_USER'],
    icon: 'library',
  },
  '/dashboard/bulletins': {
    path: '/dashboard/bulletins',
    title: 'Komunikaty',
    allowedRoles: ['UKNF_ADMIN', 'UKNF_EMPLOYEE', 'ENTITY_ADMIN', 'ENTITY_USER'],
    icon: 'bulletins',
  },
  '/dashboard/announcements': {
    path: '/dashboard/announcements',
    title: 'Ogłoszenia',
    allowedRoles: ['UKNF_ADMIN', 'UKNF_EMPLOYEE', 'ENTITY_ADMIN', 'ENTITY_USER'],
    icon: 'megaphone',
  },
  '/dashboard/messages': {
    path: '/dashboard/messages',
    title: 'Wiadomości',
    allowedRoles: ['UKNF_ADMIN', 'UKNF_EMPLOYEE', 'ENTITY_ADMIN', 'ENTITY_USER'],
    icon: 'chat',
  },
  '/dashboard/entities': {
    path: '/dashboard/entities',
    title: 'Baza podmiotów',
    allowedRoles: ['UKNF_ADMIN', 'UKNF_EMPLOYEE'],
    icon: 'building',
  },
  '/dashboard/entities/:id/view': {
    path: '/dashboard/entities/:id/view',
    title: 'Podgląd podmiotu',
    allowedRoles: ['UKNF_ADMIN', 'UKNF_EMPLOYEE'],
    icon: 'building',
  },
  '/dashboard/entities/:id/edit': {
    path: '/dashboard/entities/:id/edit',
    title: 'Edycja podmiotu',
    allowedRoles: ['UKNF_ADMIN', 'UKNF_EMPLOYEE'],
    icon: 'building',
  },
  '/dashboard/entities/:id/history': {
    path: '/dashboard/entities/:id/history',
    title: 'Historia podmiotu',
    allowedRoles: ['UKNF_ADMIN', 'UKNF_EMPLOYEE'],
    icon: 'building',
  },
  '/dashboard/users': {
    path: '/dashboard/users',
    title: 'Użytkownicy i role',
    allowedRoles: ['UKNF_ADMIN'],
    icon: 'users',
  },
  '/dashboard/audit': {
    path: '/dashboard/audit',
    title: 'Audyt',
    allowedRoles: ['UKNF_ADMIN'],
    icon: 'cog',
  },
  '/dashboard/faq': {
    path: '/dashboard/faq',
    title: 'Baza wiedzy / Moje pytania',
    allowedRoles: ['UKNF_ADMIN', 'UKNF_EMPLOYEE', 'ENTITY_ADMIN', 'ENTITY_USER'],
    icon: 'question',
  },
  '/dashboard/knowledge': {
    path: '/dashboard/knowledge',
    title: 'Baza wiedzy',
    allowedRoles: ['UKNF_ADMIN', 'UKNF_EMPLOYEE', 'ENTITY_ADMIN', 'ENTITY_USER'],
    icon: 'book',
  },
  '/dashboard/documents': {
    path: '/dashboard/documents',
    title: 'Dokumenty',
    allowedRoles: ['UKNF_ADMIN', 'UKNF_EMPLOYEE', 'ENTITY_ADMIN', 'ENTITY_USER'],
    icon: 'document',
  },
  '/dashboard/permissions': {
    path: '/dashboard/permissions',
    title: 'Uprawnienia',
    allowedRoles: ['UKNF_ADMIN'],
    icon: 'cog',
  },
  '/dashboard/entity-users': {
    path: '/dashboard/entity-users',
    title: 'Pracownicy podmiotu',
    allowedRoles: ['ENTITY_ADMIN'],
    icon: 'users',
  },
  '/dashboard/entity-data': {
    path: '/dashboard/entity-data',
    title: 'Aktualizator danych podmiotu',
    allowedRoles: ['ENTITY_ADMIN'],
    icon: 'building',
  },
}

/**
 * Navigation order for different user roles
 * Lower numbers appear first in the menu
 */
const NAVIGATION_ORDER = {
  UKNF_ADMIN: {
    '/dashboard': 1,
    '/dashboard/library': 2,
    '/dashboard/access-requests': 3,
    '/dashboard/cases': 4,
    '/dashboard/reports': 5,
    '/dashboard/bulletins': 6,
    '/dashboard/faq': 7,
    '/dashboard/entities': 8,
    '/dashboard/users': 9,
    '/dashboard/audit': 10,
  },
  UKNF_EMPLOYEE: {
    '/dashboard': 1,
    '/dashboard/library': 2,
    '/dashboard/access-requests': 3,
    '/dashboard/cases': 4,
    '/dashboard/reports': 5,
    '/dashboard/bulletins': 6,
    '/dashboard/faq': 7,
    '/dashboard/entities': 8,
  },
  UKNF_INSTITUTION: {
    '/dashboard': 1,
  },
  ENTITY_ADMIN: {
    '/dashboard': 1,
    '/dashboard/reports': 2,
    '/dashboard/cases': 3,
    '/dashboard/messages': 4,
    '/dashboard/library': 5,
    '/dashboard/bulletins': 6,
    '/dashboard/access-requests': 7,
    '/dashboard/entity-users': 8,
    '/dashboard/entity-data': 9,
    '/dashboard/faq': 10,
  },
  ENTITY_USER: {
    '/dashboard': 1,
    '/dashboard/regulatory-reporting': 2,
    '/dashboard/cases': 3,
    '/dashboard/messages': 4,
    '/dashboard/library': 5,
    '/dashboard/bulletins': 6,
    '/dashboard/access-requests': 7,
    '/dashboard/faq': 8,
  },
} as const

/**
 * Helper: Match a path against the TAB_ACCESS_MAP, supporting dynamic routes
 */
function matchTabConfig(path: string): TabAccessConfig | undefined {
  // Try exact match first
  let config = TAB_ACCESS_MAP[path]
  
  // If no exact match, try pattern matching for dynamic routes
  if (!config) {
    const matchingKey = Object.keys(TAB_ACCESS_MAP).find(key => {
      if (!key.includes(':id')) return false
      const pattern = key.replace(/:id/g, '[^/]+') // Support multiple :id params
      const regex = new RegExp(`^${pattern}$`)
      return regex.test(path)
    })
    
    if (matchingKey) {
      config = TAB_ACCESS_MAP[matchingKey]
    }
  }
  
  return config
}

/**
 * Check if a user has access to a specific path
 * Supports dynamic paths with :id parameters
 */
export function hasAccessToPath(path: string, userRole?: UserRole): boolean {
  if (!userRole) return false
  
  const config = matchTabConfig(path)
  if (!config) return false
  
  return config.allowedRoles.includes(userRole)
}

/**
 * Get all accessible paths for a user role
 * Returns paths sorted by navigation order for the specific role
 */
export function getAccessiblePaths(userRole?: UserRole): TabAccessConfig[] {
  if (!userRole) return []
  
  const accessiblePaths = Object.values(TAB_ACCESS_MAP).filter(config =>
    config.allowedRoles.includes(userRole) && !config.path.includes(':id')
  )
  
  // Sort by navigation order if defined for this role
  const orderMap = (NAVIGATION_ORDER as Record<string, Record<string, number>>)[userRole] || {}
  
  return accessiblePaths.sort((a, b) => {
    const orderA = (orderMap as Record<string, number>)[a.path] || 999
    const orderB = (orderMap as Record<string, number>)[b.path] || 999
    return orderA - orderB
  })
}

/**
 * Get tab configuration for a specific path
 * Supports dynamic paths with :id parameters
 */
export function getTabConfig(path: string): TabAccessConfig | undefined {
  return matchTabConfig(path)
}
