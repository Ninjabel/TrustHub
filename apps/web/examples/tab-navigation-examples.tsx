/**
 * Example Usage: Role-Aware Tab Navigation
 * 
 * This file demonstrates various ways to use the tab navigation system
 */

'use client'

import { useTabNavigation } from '@/lib/tabs/use-tab-navigation'
import { hasAccessToPath, getAccessiblePaths } from '@/lib/tabs/tab-access-map'
// tab-store related examples removed in favor of simplified navigation
import { useSession } from 'next-auth/react'
import { AccessDenied } from '@/components/access-denied'

// ============================================================================
// EXAMPLE 1: Basic Tab Opening
// ============================================================================

export function Example1_BasicTabOpen() {
  const { navigateTo } = useTabNavigation()
  
  return (
    <div className="space-y-4">
      <h2>Example 1: Open Tabs on Click</h2>
      
      <button 
        onClick={() => navigateTo('/dashboard/library')}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Open Library
      </button>
      
      <button 
        onClick={() => navigateTo('/dashboard/reports')}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Open Reports
      </button>
      
      {/* If user doesn't have access, they'll see a toast notification */}
      <button 
        onClick={() => navigateTo('/dashboard/users')}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Open Users (Admin Only)
      </button>
    </div>
  )
}

// ============================================================================
// EXAMPLE 2: Conditional Rendering Based on Access
// ============================================================================

export function Example2_ConditionalAccess() {
  const { data: session } = useSession()
  const userRole = session?.user?.role
  
  // Check if user can access users management
  const canManageUsers = hasAccessToPath('/dashboard/users', userRole)
  
  return (
    <div className="space-y-4">
      <h2>Example 2: Conditional Rendering</h2>
      
      {/* Always show library link if user has access */}
      {hasAccessToPath('/dashboard/library', userRole) && (
        <div className="p-4 bg-green-50 border border-green-200 rounded">
          <p>You have access to Library</p>
        </div>
      )}
      
      {/* Only show admin panel if user is admin */}
      {canManageUsers ? (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded">
          <p>Admin Panel Available</p>
        </div>
      ) : (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded">
          <p>Admin access required</p>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// EXAMPLE 3: Dynamic Navigation Menu
// ============================================================================

export function Example3_DynamicMenu() {
  const { data: session } = useSession()
  const { navigateTo } = useTabNavigation()
  
  // Get all accessible paths for current user
  const accessiblePaths = getAccessiblePaths(session?.user?.role)
  
  return (
    <div className="space-y-4">
      <h2>Example 3: Dynamic Menu</h2>
      
      <nav className="space-y-2">
        {accessiblePaths.map((config) => (
          <button
            key={config.path}
            onClick={() => navigateTo(config.path)}
            className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded"
          >
            {config.title}
          </button>
        ))}
      </nav>
    </div>
  )
}

// ============================================================================
// EXAMPLE 4: Tab Store Direct Access
// ============================================================================

// Tab store is no longer part of the simplified navigation. Example removed.

// ============================================================================
// EXAMPLE 5: Protected Page Component
// ============================================================================

export function Example5_ProtectedPage() {
  const { data: session } = useSession()
  
  // Check if user has access to this specific page
  const hasAccess = hasAccessToPath('/dashboard/users', session?.user?.role)
  
  if (!hasAccess) {
    return <AccessDenied />
  }
  
  return (
    <div className="space-y-4">
      <h2>Example 5: Protected Page</h2>
      <p>This content is only visible to users with access to /dashboard/users</p>
      <div className="p-4 bg-green-50 border border-green-200 rounded">
        <p className="font-semibold">User Management</p>
        <p>Admin-only content here...</p>
      </div>
    </div>
  )
}

// ============================================================================
// EXAMPLE 6: Custom Tab with Custom Title
// ============================================================================

export function Example6_CustomTabTitle() {
  const { navigateTo } = useTabNavigation()
  
  const openReportWithCustomTitle = () => {
    // Navigate to reports (no custom title in simplified navigation)
    navigateTo('/dashboard/reports')
  }
  
  return (
    <div className="space-y-4">
      <h2>Example 6: Custom Tab Title</h2>
      
      <button
        onClick={openReportWithCustomTitle}
        className="px-4 py-2 bg-purple-600 text-white rounded"
      >
        Open Q4 Reports
      </button>
    </div>
  )
}

// ============================================================================
// EXAMPLE 7: Programmatic Navigation
// ============================================================================

export function Example7_ProgrammaticNavigation() {
  const { navigateTo } = useTabNavigation()
  
  const handleWorkflow = async () => {
    // Step 1: Open library
    const libraryOpened = navigateTo('/dashboard/library')
    if (!libraryOpened) {
      console.error('Failed to open library')
      return
    }
    
    // Step 2: Wait for user action...
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Step 3: Navigate to reports
    navigateTo('/dashboard/reports')
  }
  
  return (
    <div className="space-y-4">
      <h2>Example 7: Programmatic Navigation</h2>
      
      <button
        onClick={handleWorkflow}
        className="px-4 py-2 bg-indigo-600 text-white rounded"
      >
        Start Workflow
      </button>
    </div>
  )
}

// ============================================================================
// EXAMPLE 8: Role-Based Dashboard
// ============================================================================

export function Example8_RoleDashboard() {
  const { data: session } = useSession()
  const { navigateTo } = useTabNavigation()
  const accessiblePaths = getAccessiblePaths(session?.user?.role)
  
  // Create role-specific dashboard cards
  const dashboardCards = accessiblePaths
    .filter(path => path.path !== '/dashboard') // Exclude dashboard itself
    .slice(0, 6) // Show first 6
  
  return (
    <div className="space-y-4">
      <h2>Example 8: Role-Based Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dashboardCards.map((config) => (
          <button
            key={config.path}
            onClick={() => navigateTo(config.path)}
            className="p-6 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-lg transition-all text-left"
          >
            <h3 className="font-semibold text-lg mb-2">{config.title}</h3>
            <p className="text-sm text-gray-600">
              Click to open
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// EXAMPLE 9: Tab Context Information
// ============================================================================

// Example 9 removed: tab-store based context is deprecated in this simplified navigation

// ============================================================================
// EXAMPLE 10: Complete Dashboard Page
// ============================================================================

export function Example10_CompleteDashboard() {
  return (
    <div className="space-y-8 p-8">
      <h1 className="text-3xl font-bold">Tab Navigation Examples</h1>
      
      <Example1_BasicTabOpen />
      <Example2_ConditionalAccess />
      <Example3_DynamicMenu />
  {/* Example4_TabStoreAccess removed */}
      <Example5_ProtectedPage />
      <Example6_CustomTabTitle />
      <Example7_ProgrammaticNavigation />
      <Example8_RoleDashboard />
      {/* Example9_TabInfo removed */}
    </div>
  )
}
